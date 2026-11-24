//// The extension's built-ins (see extension.txt): colors, trigonometry,
//// turtle graphics, and coloring/symmetry transforms on lists of paths.
////
//// Everything here is an ordinary built-in function, so the evaluator needs
//// no changes beyond the new record types in evaluator.constructors.
////
//// Screen coordinates have positive y pointing down, so increasing angles
//// turn clockwise on screen, for arcs, rotate, and turtle headings alike.

import errors.{type EvalError, TypeError}
import evaluator.{type Value, Builtin, VBool, VData, VFunc, VInt, VList}
import gleam/float
import gleam/int
import gleam/list
import gleam/result
import limits

const pi = 3.141592653589793

/// The extension's built-in bindings, added to the global frame.
pub fn builtins() -> List(#(String, Value)) {
  [
    builtin("hsl", 3, builtin_hsl),
    builtin("sin", 2, trig("sin", sin)),
    builtin("cos", 2, trig("cos", cos)),
    builtin("gradient", 3, builtin_gradient),
    builtin("rainbow", 1, builtin_rainbow),
    builtin("rotate", 2, builtin_rotate),
    builtin("kaleidoscope", 2, builtin_kaleidoscope),
    builtin("mirror", 1, builtin_mirror),
    builtin("turtle", 3, builtin_turtle),
    builtin("forward", 2, builtin_forward),
    builtin("turn", 2, builtin_turn),
    builtin("circle", 3, builtin_circle),
    builtin(
      "pen_up",
      1,
      pen_setter("pen_up", fn(t, _) { Turtle(..t, pen: False) }),
    ),
    builtin(
      "pen_down",
      1,
      pen_setter("pen_down", fn(t, _) { Turtle(..t, pen: True) }),
    ),
    builtin("pen_color", 2, builtin_pen_color),
    builtin("pen_width", 2, builtin_pen_width),
    builtin("speed", 2, builtin_speed),
    builtin("turtle_paths", 1, builtin_turtle_paths),
  ]
}

fn builtin(
  name: String,
  num_args: Int,
  run: fn(List(Value)) -> Result(Value, EvalError),
) -> #(String, Value) {
  #(name, VFunc(Builtin(name, num_args, run)))
}

fn expects(name: String, what: String) -> Result(a, EvalError) {
  Error(TypeError(name <> " expects " <> what))
}

// ── Colors and trigonometry ──────────────────────────────────────────────────

fn rgb(r: Int, g: Int, b: Int) -> Value {
  VData("Rgb", [VInt(r), VInt(g), VInt(b)])
}

fn is_color(v: Value) -> Bool {
  case v {
    VData("Rgb", [VInt(_), VInt(_), VInt(_)]) -> True
    _ -> False
  }
}

// hsl(hue, saturation, lightness): hue in degrees (wrapping around), saturation
// and lightness as percentages from 0 to 100.
fn builtin_hsl(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [VInt(h), VInt(s), VInt(l)] -> Ok(hsl(int.to_float(h), s, l))
    _ -> expects("hsl", "three ints")
  }
}

fn hsl(hue: Float, saturation: Int, lightness: Int) -> Value {
  let h = wrap_degrees(hue) /. 60.0
  let s = int.to_float(int.clamp(saturation, 0, 100)) /. 100.0
  let l = int.to_float(int.clamp(lightness, 0, 100)) /. 100.0
  let chroma = { 1.0 -. float.absolute_value(2.0 *. l -. 1.0) } *. s
  let x = chroma *. { 1.0 -. float.absolute_value(fmod(h, 2.0) -. 1.0) }
  let #(r, g, b) = case float.truncate(h) {
    0 -> #(chroma, x, 0.0)
    1 -> #(x, chroma, 0.0)
    2 -> #(0.0, chroma, x)
    3 -> #(0.0, x, chroma)
    4 -> #(x, 0.0, chroma)
    _ -> #(chroma, 0.0, x)
  }
  let m = l -. chroma /. 2.0
  let channel = fn(v) { float.round({ v +. m } *. 255.0) }
  rgb(channel(r), channel(g), channel(b))
}

// An angle in degrees, wrapped into [0, 360).
fn wrap_degrees(d: Float) -> Float {
  let w = fmod(d, 360.0)
  case w <. 0.0 {
    True -> w +. 360.0
    False -> w
  }
}

fn fmod(x: Float, m: Float) -> Float {
  x -. m *. int.to_float(float.truncate(x /. m))
}

// sin(degrees, scale) and cos(degrees, scale): scale times the sine or cosine,
// rounded, since the language only has integers.
fn trig(
  name: String,
  f: fn(Float) -> Float,
) -> fn(List(Value)) -> Result(Value, EvalError) {
  fn(args) {
    case args {
      [VInt(degrees), VInt(scale)] ->
        Ok(
          VInt(float.round(
            int.to_float(scale) *. f(radians(int.to_float(degrees))),
          )),
        )
      _ -> expects(name, "two ints")
    }
  }
}

fn radians(degrees: Float) -> Float {
  degrees *. pi /. 180.0
}

// Linear blend between two colors, t from 0.0 to 1.0.
fn blend(from: Value, to: Value, t: Float) -> Value {
  case from, to {
    VData("Rgb", [VInt(r1), VInt(g1), VInt(b1)]),
      VData("Rgb", [VInt(r2), VInt(g2), VInt(b2)])
    -> {
      let mix = fn(a, b) {
        float.round(int.to_float(a) +. { int.to_float(b - a) } *. t)
      }
      rgb(mix(r1, r2), mix(g1, g2), mix(b1, b2))
    }
    _, _ -> from
  }
}

// ── Transforming paths ────────────────────────────────────────────────────────

// The paths of a list argument, checking that each element is a Path.
fn paths_arg(name: String, v: Value) -> Result(List(Value), EvalError) {
  case v {
    VList(items) -> {
      limits.charge(list.length(items))
      list.try_map(items, fn(item) {
        case item {
          VData("Path", [_, _, _, _]) -> Ok(item)
          _ -> expects(name, "a list of Paths")
        }
      })
    }
    _ -> expects(name, "a list of Paths")
  }
}

// A Path with its shape replaced by f(shape).
fn map_shape(
  name: String,
  path: Value,
  f: fn(Value) -> Result(Value, EvalError),
) -> Result(Value, EvalError) {
  case path {
    VData("Path", [shape, start, end, thickness]) -> {
      use new_shape <- result.try(f(shape))
      Ok(VData("Path", [new_shape, start, end, thickness]))
    }
    _ -> expects(name, "a list of Paths")
  }
}

// The shape in a new color. A plain Line becomes a ColorLine.
fn recolor(
  name: String,
  shape: Value,
  color: Value,
) -> Result(Value, EvalError) {
  case shape {
    VData("Line", [a, b]) | VData("ColorLine", [a, b, _]) ->
      Ok(VData("ColorLine", [a, b, color]))
    VData("Arc", [center, radius, from, to, _]) ->
      Ok(VData("Arc", [center, radius, from, to, color]))
    VData("Curve", [p0, p1, p2, p3, _]) ->
      Ok(VData("Curve", [p0, p1, p2, p3, color]))
    _ -> expects(name, "Paths of recognized shapes")
  }
}

// The shape with every point moved by move_point and every arc angle changed
// by move_angle. For a reflection, flip is True, which also reverses an arc's
// direction (handled by move_angle on both ends).
fn transform(
  name: String,
  shape: Value,
  move_point: fn(Float, Float) -> #(Float, Float),
  move_angle: fn(Float) -> Float,
) -> Result(Value, EvalError) {
  let point = fn(p) {
    case p {
      VData("Point", [VInt(x), VInt(y)]) -> {
        let #(nx, ny) = move_point(int.to_float(x), int.to_float(y))
        Ok(VData("Point", [VInt(float.round(nx)), VInt(float.round(ny))]))
      }
      _ -> expects(name, "shapes made of Points")
    }
  }
  let angle = fn(a) {
    case a {
      VInt(d) -> Ok(VInt(float.round(move_angle(int.to_float(d)))))
      _ -> expects(name, "an Arc with int angles")
    }
  }
  case shape {
    VData("Line", [a, b]) -> {
      use a <- result.try(point(a))
      use b <- result.try(point(b))
      Ok(VData("Line", [a, b]))
    }
    VData("ColorLine", [a, b, c]) -> {
      use a <- result.try(point(a))
      use b <- result.try(point(b))
      Ok(VData("ColorLine", [a, b, c]))
    }
    VData("Arc", [center, radius, from, to, c]) -> {
      use center <- result.try(point(center))
      use from <- result.try(angle(from))
      use to <- result.try(angle(to))
      Ok(VData("Arc", [center, radius, from, to, c]))
    }
    VData("Curve", [p0, p1, p2, p3, c]) -> {
      use p0 <- result.try(point(p0))
      use p1 <- result.try(point(p1))
      use p2 <- result.try(point(p2))
      use p3 <- result.try(point(p3))
      Ok(VData("Curve", [p0, p1, p2, p3, c]))
    }
    _ -> expects(name, "Paths of recognized shapes")
  }
}

fn rotate_paths(
  name: String,
  paths: List(Value),
  degrees: Float,
) -> Result(List(Value), EvalError) {
  let r = radians(degrees)
  let c = cos(r)
  let s = sin(r)
  list.try_map(paths, fn(path) {
    map_shape(name, path, fn(shape) {
      transform(
        name,
        shape,
        fn(x, y) { #(x *. c -. y *. s, x *. s +. y *. c) },
        fn(a) { a +. degrees },
      )
    })
  })
}

// gradient(paths, from_color, to_color)
fn builtin_gradient(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [paths, from, to] ->
      case is_color(from) && is_color(to) {
        False -> expects("gradient", "a list of Paths and two Rgb colors")
        True -> {
          use paths <- result.try(paths_arg("gradient", paths))
          let last = int.max(1, list.length(paths) - 1)
          list.index_map(paths, fn(path, i) {
            let color = blend(from, to, int.to_float(i) /. int.to_float(last))
            map_shape("gradient", path, recolor("gradient", _, color))
          })
          |> result.all
          |> result.map(VList)
        }
      }
    _ -> expects("gradient", "a list of Paths and two Rgb colors")
  }
}

// rainbow(paths): hues cycling once through the spectrum.
fn builtin_rainbow(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [paths] -> {
      use paths <- result.try(paths_arg("rainbow", paths))
      let n = int.max(1, list.length(paths))
      list.index_map(paths, fn(path, i) {
        let color = hsl(360.0 *. int.to_float(i) /. int.to_float(n), 90, 60)
        map_shape("rainbow", path, recolor("rainbow", _, color))
      })
      |> result.all
      |> result.map(VList)
    }
    _ -> expects("rainbow", "a list of Paths")
  }
}

// rotate(paths, degrees): rotate around the origin.
fn builtin_rotate(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [paths, VInt(degrees)] -> {
      use paths <- result.try(paths_arg("rotate", paths))
      result.map(rotate_paths("rotate", paths, int.to_float(degrees)), VList)
    }
    _ -> expects("rotate", "a list of Paths and an int")
  }
}

// kaleidoscope(paths, n): n copies rotated evenly around the origin.
fn builtin_kaleidoscope(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [paths, VInt(n)] -> {
      use paths <- result.try(paths_arg("kaleidoscope", paths))
      case n < 1 {
        True -> Ok(VList([]))
        False -> {
          limits.charge(n * list.length(paths))
          upto(n - 1)
          |> list.try_map(fn(i) {
            rotate_paths(
              "kaleidoscope",
              paths,
              360.0 *. int.to_float(i) /. int.to_float(n),
            )
          })
          |> result.map(fn(copies) { VList(list.flatten(copies)) })
        }
      }
    }
    _ -> expects("kaleidoscope", "a list of Paths and an int")
  }
}

// mirror(paths): the paths plus their reflection across the vertical axis.
fn builtin_mirror(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [paths] -> {
      use paths <- result.try(paths_arg("mirror", paths))
      use reflected <- result.try(
        list.try_map(paths, fn(path) {
          map_shape("mirror", path, fn(shape) {
            transform("mirror", shape, fn(x, y) { #(0.0 -. x, y) }, fn(a) {
              180.0 -. a
            })
          })
        }),
      )
      Ok(VList(list.append(paths, reflected)))
    }
    _ -> expects("mirror", "a list of Paths")
  }
}

// ── Turtle graphics ───────────────────────────────────────────────────────────
//
// A turtle is an immutable record value; each command returns a new turtle.
// Its position is kept in thousandths of a unit so repeated turns don't drift,
// and its clock in thousandths of a tenth of a second. Paths are stored newest
// first.

type Turtle {
  Turtle(
    x: Float,
    y: Float,
    heading: Float,
    pen: Bool,
    color: Value,
    width: Int,
    speed: Int,
    time: Float,
    paths: List(Value),
  )
}

const scale = 1000.0

fn to_value(t: Turtle) -> Value {
  VData("Turtle", [
    VInt(float.round(t.x *. scale)),
    VInt(float.round(t.y *. scale)),
    VInt(float.round(t.heading *. scale)),
    VBool(t.pen),
    t.color,
    VInt(t.width),
    VInt(t.speed),
    VInt(float.round(t.time *. scale)),
    VList(t.paths),
  ])
}

fn from_value(name: String, v: Value) -> Result(Turtle, EvalError) {
  case v {
    VData(
      "Turtle",
      [
        VInt(x),
        VInt(y),
        VInt(heading),
        VBool(pen),
        color,
        VInt(width),
        VInt(speed),
        VInt(time),
        VList(paths),
      ],
    ) ->
      Ok(Turtle(
        int.to_float(x) /. scale,
        int.to_float(y) /. scale,
        int.to_float(heading) /. scale,
        pen,
        color,
        width,
        speed,
        int.to_float(time) /. scale,
        paths,
      ))
    _ -> expects(name, "a turtle")
  }
}

fn point(x: Float, y: Float) -> Value {
  VData("Point", [VInt(float.round(x)), VInt(float.round(y))])
}

// turtle(x, y, heading): a new turtle, pen down, heading in degrees
// (0 points right, 90 points down the screen).
fn builtin_turtle(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [VInt(x), VInt(y), VInt(heading)] ->
      Ok(
        to_value(
          Turtle(
            int.to_float(x),
            int.to_float(y),
            int.to_float(heading),
            True,
            rgb(242, 193, 78),
            3,
            10,
            0.0,
            [],
          ),
        ),
      )
    _ -> expects("turtle", "three ints")
  }
}

// Record a shape the turtle drew over `length` units, advancing its clock.
fn draw(t: Turtle, shape: Value, length: Float) -> Turtle {
  let duration = length /. int.to_float(int.max(1, t.speed))
  let end = t.time +. duration
  case t.pen {
    True -> {
      let path =
        VData("Path", [
          shape,
          VInt(float.round(t.time)),
          VInt(float.round(end)),
          VInt(t.width),
        ])
      Turtle(..t, time: end, paths: [path, ..t.paths])
    }
    // Moving with the pen up takes no time.
    False -> t
  }
}

// forward(t, distance): move along the heading, drawing if the pen is down.
fn builtin_forward(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, VInt(distance)] -> {
      use t <- result.try(from_value("forward", tv))
      let d = int.to_float(distance)
      let r = radians(t.heading)
      let nx = t.x +. d *. cos(r)
      let ny = t.y +. d *. sin(r)
      let shape = VData("ColorLine", [point(t.x, t.y), point(nx, ny), t.color])
      let t = draw(t, shape, float.absolute_value(d))
      Ok(to_value(Turtle(..t, x: nx, y: ny)))
    }
    _ -> expects("forward", "a turtle and an int")
  }
}

// turn(t, degrees): positive turns clockwise on screen, negative counterclockwise.
fn builtin_turn(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, VInt(degrees)] -> {
      use t <- result.try(from_value("turn", tv))
      Ok(to_value(
        Turtle(..t, heading: wrap_degrees(t.heading +. int.to_float(degrees))),
      ))
    }
    _ -> expects("turn", "a turtle and an int")
  }
}

// circle(t, radius, degrees): move along an arc of the given radius while
// turning by `degrees` (positive clockwise, negative counterclockwise).
fn builtin_circle(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, VInt(radius), VInt(degrees)] -> {
      use t <- result.try(from_value("circle", tv))
      let r = int.to_float(int.absolute_value(radius))
      let sweep = int.to_float(degrees)
      // The center lies 90 degrees to the side the turtle turns toward.
      let side = case degrees >= 0 {
        True -> 90.0
        False -> -90.0
      }
      let to_center = radians(t.heading +. side)
      let cx = t.x +. r *. cos(to_center)
      let cy = t.y +. r *. sin(to_center)
      // The turtle's angle as seen from the center, before and after.
      let from = t.heading -. side
      let to = from +. sweep
      let nx = cx +. r *. cos(radians(to))
      let ny = cy +. r *. sin(radians(to))
      let shape =
        VData("Arc", [
          point(cx, cy),
          VInt(float.round(r)),
          VInt(float.round(from)),
          VInt(float.round(to)),
          t.color,
        ])
      let length = r *. radians(float.absolute_value(sweep))
      let t = draw(t, shape, length)
      Ok(to_value(
        Turtle(..t, x: nx, y: ny, heading: wrap_degrees(t.heading +. sweep)),
      ))
    }
    _ -> expects("circle", "a turtle and two ints")
  }
}

fn pen_setter(
  name: String,
  f: fn(Turtle, List(Value)) -> Turtle,
) -> fn(List(Value)) -> Result(Value, EvalError) {
  fn(args) {
    case args {
      [tv, ..rest] -> {
        use t <- result.try(from_value(name, tv))
        Ok(to_value(f(t, rest)))
      }
      _ -> expects(name, "a turtle")
    }
  }
}

// pen_color(t, color)
fn builtin_pen_color(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, color] ->
      case is_color(color) {
        True -> {
          use t <- result.try(from_value("pen_color", tv))
          Ok(to_value(Turtle(..t, color: color)))
        }
        False -> expects("pen_color", "a turtle and an Rgb color")
      }
    _ -> expects("pen_color", "a turtle and an Rgb color")
  }
}

// pen_width(t, width)
fn builtin_pen_width(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, VInt(width)] -> {
      use t <- result.try(from_value("pen_width", tv))
      Ok(to_value(Turtle(..t, width: int.max(1, width))))
    }
    _ -> expects("pen_width", "a turtle and an int")
  }
}

// speed(t, units): how many units the turtle draws per tenth of a second
// (10 to start with).
fn builtin_speed(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv, VInt(units)] -> {
      use t <- result.try(from_value("speed", tv))
      Ok(to_value(Turtle(..t, speed: int.max(1, units))))
    }
    _ -> expects("speed", "a turtle and an int")
  }
}

// turtle_paths(t): everything the turtle has drawn, in order.
fn builtin_turtle_paths(args: List(Value)) -> Result(Value, EvalError) {
  case args {
    [tv] -> {
      use t <- result.try(from_value("turtle_paths", tv))
      limits.charge(list.length(t.paths))
      Ok(VList(list.reverse(t.paths)))
    }
    _ -> expects("turtle_paths", "a turtle")
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// The list [0, 1, ..., n].
fn upto(n: Int) -> List(Int) {
  upto_loop(n, [])
}

fn upto_loop(n: Int, acc: List(Int)) -> List(Int) {
  case n < 0 {
    True -> acc
    False -> upto_loop(n - 1, [n, ..acc])
  }
}

@external(javascript, "./render_ffi.mjs", "sin")
fn sin(x: Float) -> Float

@external(javascript, "./render_ffi.mjs", "cos")
fn cos(x: Float) -> Float
