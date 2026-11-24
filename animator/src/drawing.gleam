//// Drawing a program: call its draw function on the shape slider's value and
//// convert the list it returns into the Paths the animator renders.
////
//// The user's integers become the Float fields the geometry needs.

import errors.{type EvalError, BadDrawing, PathLimit}
import evaluator.{type GlobalFrame, type Value, VData, VInt, VList}
import gleam/int
import gleam/list
import gleam/result
import limits
import shape.{
  type Color, type Path, type Point, type Shape, Arc, Color, ColorLine, Curve,
  Line, Path, Point,
}

/// Call the program's draw function on shape_slider, returning its list of
/// paths or the evaluation error, so the app can show failures.
pub fn try_draw(
  shape_slider: Int,
  global: GlobalFrame,
) -> Result(List(Path), EvalError) {
  case evaluator.run("draw", [VInt(shape_slider)], global) {
    Ok(VList(items)) ->
      // The step allowance bounds what evaluation can build, but the
      // renderer redraws every path each frame, so a finished drawing is
      // also capped.
      case list.length(items) > limits.path_limit {
        True -> Error(PathLimit)
        False -> list.try_map(items, to_path)
      }
    Ok(_) -> Error(BadDrawing("return value of draw is not a list"))
    Error(err) -> Error(err)
  }
}

fn to_path(v: Value) -> Result(Path, EvalError) {
  case v {
    VData("Path", [shape, VInt(start), VInt(end), VInt(thickness)]) -> {
      use s <- result.try(to_shape(shape))
      Ok(Path(
        s,
        int.to_float(start),
        int.to_float(end),
        int.to_float(thickness),
      ))
    }
    _ -> Error(BadDrawing("some element is not a well-formed path"))
  }
}

fn to_shape(v: Value) -> Result(Shape, EvalError) {
  case v {
    VData("Line", [start, end]) -> {
      use a <- result.try(to_point(start))
      use b <- result.try(to_point(end))
      Ok(Line(a, b))
    }
    VData("ColorLine", [start, end, color]) -> {
      use a <- result.try(to_point(start))
      use b <- result.try(to_point(end))
      use c <- result.try(to_color(color))
      Ok(ColorLine(a, b, c))
    }
    VData("Arc", [center, VInt(radius), VInt(from), VInt(to), color]) -> {
      use p <- result.try(to_point(center))
      use c <- result.try(to_color(color))
      Ok(Arc(p, int.to_float(radius), int.to_float(from), int.to_float(to), c))
    }
    VData("Curve", [p0, p1, p2, p3, color]) -> {
      use a <- result.try(to_point(p0))
      use b <- result.try(to_point(p1))
      use c <- result.try(to_point(p2))
      use d <- result.try(to_point(p3))
      use col <- result.try(to_color(color))
      Ok(Curve(a, b, c, d, col))
    }
    _ -> Error(BadDrawing("a Path's shape must be a recognized shape"))
  }
}

fn to_point(v: Value) -> Result(Point, EvalError) {
  case v {
    VData("Point", [VInt(x), VInt(y)]) ->
      Ok(Point(int.to_float(x), int.to_float(y)))
    _ -> Error(BadDrawing("expected a Point"))
  }
}

fn to_color(v: Value) -> Result(Color, EvalError) {
  case v {
    VData("Rgb", [VInt(r), VInt(g), VInt(b)]) -> Ok(Color(r, g, b))
    _ -> Error(BadDrawing("expected an Rgb color"))
  }
}
