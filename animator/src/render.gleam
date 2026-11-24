//// Convert each shape into a list of points called a RenderPath.

import gleam/float
import gleam/int
import gleam/list
import gleam/string
import shape.{
  type Color, type Path, type Point, Arc, ColorLine, Curve, Line, Point,
}

/// One path as canvas.mjs setDrawing consumes it (field by field): the
/// polyline, stroke colour/width, and the start and end times (in tenths of a second)
/// between which the reveal runs — so the renderer's clock needs no shape
/// knowledge.
pub type RenderPath {
  RenderPath(
    points: List(Point),
    thickness: Float,
    color: String,
    start: Float,
    end: Float,
  )
}

// ── The canvas (canvas.mjs) ───────────────────────────────────────────────────

/// Replace the drawing being animated in the page's
/// `<canvas id="animation-canvas">` element. If that element doesn't appear within
/// about 10 seconds, this logs an error to the browser console. This keeps the
/// current time, so a drawing that replaces a finished one appears complete. To
/// animate it from the start, also call reset_clock.
@external(javascript, "./canvas.mjs", "setDrawing")
pub fn set_drawing(paths: List(RenderPath)) -> Nil

/// Set the animation's speed, as a multiple of its normal speed: 1.0 is normal and
/// is where it starts, 0.0 pauses, and a negative rate plays it backward.
/// Time stops at the start of the drawing and when its last path finishes, so
/// playing a finished drawing again takes a call to reset_clock.
@external(javascript, "./canvas.mjs", "setSpeed")
pub fn set_speed(rate: Float) -> Nil

/// Jump the animation back to its start, where the canvas is empty.
@external(javascript, "./canvas.mjs", "resetClock")
pub fn reset_clock() -> Nil

/// The RenderPath for a path. `color` is the palette colour, used by shapes
/// that don't choose their own.
pub fn render_path(path: Path, color: String) -> RenderPath {
  let #(points, stroke) = case path.shape {
    Line(a, b) -> #([a, b], color)
    ColorLine(a, b, c) -> #([a, b], css_color(c))
    Arc(center, radius, from, to, c) -> #(
      arc_points(center, radius, from, to),
      css_color(c),
    )
    Curve(p0, p1, p2, p3, c) -> #(bezier_points(p0, p1, p2, p3), css_color(c))
  }
  RenderPath(points, path.thickness, stroke, path.start, path.end)
}

/// A CSS colour string such as "rgb(255,0,128)".
pub fn css_color(c: Color) -> String {
  let channel = fn(x) { int.to_string(int.clamp(x, 0, 255)) }
  "rgb(" <> string.join([channel(c.r), channel(c.g), channel(c.b)], ",") <> ")"
}

const pi = 3.141592653589793

// Points evenly spaced along the arc, so the reveal advances at a steady rate.
// Positive y points down the screen, so increasing angles turn clockwise.
fn arc_points(
  center: Point,
  radius: Float,
  from: Float,
  to: Float,
) -> List(Point) {
  let sweep = to -. from
  // About one point per 5 degrees, and at least 2.
  let steps = int.max(2, float.round(float.absolute_value(sweep) /. 5.0))
  list.map(upto(steps), fn(i) {
    let degrees = from +. sweep *. int.to_float(i) /. int.to_float(steps)
    let radians = degrees *. pi /. 180.0
    Point(
      center.x +. radius *. cos(radians),
      center.y +. radius *. sin(radians),
    )
  })
}

// Points along a cubic Bezier curve.
fn bezier_points(p0: Point, p1: Point, p2: Point, p3: Point) -> List(Point) {
  let steps = 40
  list.map(upto(steps), fn(i) {
    let t = int.to_float(i) /. int.to_float(steps)
    let u = 1.0 -. t
    let a = u *. u *. u
    let b = 3.0 *. u *. u *. t
    let c = 3.0 *. u *. t *. t
    let d = t *. t *. t
    Point(
      a *. p0.x +. b *. p1.x +. c *. p2.x +. d *. p3.x,
      a *. p0.y +. b *. p1.y +. c *. p2.y +. d *. p3.y,
    )
  })
}

@external(javascript, "./render_ffi.mjs", "sin")
fn sin(x: Float) -> Float

@external(javascript, "./render_ffi.mjs", "cos")
fn cos(x: Float) -> Float

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
