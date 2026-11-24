//# sourceMappingURL=render.mjs.map
import * as $float from "../gleam_stdlib/gleam/float.mjs";
import * as $int from "../gleam_stdlib/gleam/int.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $string from "../gleam_stdlib/gleam/string.mjs";
import {
  setDrawing as set_drawing,
  setSpeed as set_speed,
  resetClock as reset_clock,
} from "./canvas.mjs";
import {
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
} from "./gleam.mjs";
import { sin, cos } from "./render_ffi.mjs";
import * as $shape from "./shape.mjs";
import { Arc, ColorLine, Curve, Line, Point } from "./shape.mjs";

export { reset_clock, set_drawing, set_speed };

export class RenderPath extends $CustomType {
  constructor(points, thickness, color, start, end) {
    super();
    this.points = points;
    this.thickness = thickness;
    this.color = color;
    this.start = start;
    this.end = end;
  }
}
export const RenderPath$RenderPath = (points, thickness, color, start, end) =>
  new RenderPath(points, thickness, color, start, end);
export const RenderPath$isRenderPath = (value) => value instanceof RenderPath;
export const RenderPath$RenderPath$points = (value) => value.points;
export const RenderPath$RenderPath$0 = (value) => value.points;
export const RenderPath$RenderPath$thickness = (value) => value.thickness;
export const RenderPath$RenderPath$1 = (value) => value.thickness;
export const RenderPath$RenderPath$color = (value) => value.color;
export const RenderPath$RenderPath$2 = (value) => value.color;
export const RenderPath$RenderPath$start = (value) => value.start;
export const RenderPath$RenderPath$3 = (value) => value.start;
export const RenderPath$RenderPath$end = (value) => value.end;
export const RenderPath$RenderPath$4 = (value) => value.end;

const pi = 3.141592653589793;

/**
 * A CSS colour string such as "rgb(255,0,128)".
 */
export function css_color(c) {
  let channel = (x) => { return $int.to_string($int.clamp(x, 0, 255)); };
  return ("rgb(" + $string.join(
    listPrepend(
      channel(c.r),
      listPrepend(channel(c.g), listPrepend(channel(c.b), $List$Empty$const)),
    ),
    ",",
  )) + ")";
}

function upto_loop(loop$n, loop$acc) {
  while (true) {
    let n = loop$n;
    let acc = loop$acc;
    let $ = n < 0;
    if ($) {
      return acc;
    } else {
      loop$n = n - 1;
      loop$acc = listPrepend(n, acc);
    }
  }
}

function upto(n) {
  return upto_loop(n, $List$Empty$const);
}

function bezier_points(p0, p1, p2, p3) {
  let steps = 40;
  return $list.map(
    upto(steps),
    (i) => {
      let t = divideFloat($int.to_float(i), $int.to_float(steps));
      let u = 1.0 - t;
      let a = (u * u) * u;
      let b = ((3.0 * u) * u) * t;
      let c = ((3.0 * u) * t) * t;
      let d = (t * t) * t;
      return new Point(
        (((a * p0.x) + (b * p1.x)) + (c * p2.x)) + (d * p3.x),
        (((a * p0.y) + (b * p1.y)) + (c * p2.y)) + (d * p3.y),
      );
    },
  );
}

function arc_points(center, radius, from, to) {
  let sweep = to - from;
  let steps = $int.max(2, $float.round($float.absolute_value(sweep) / 5.0));
  return $list.map(
    upto(steps),
    (i) => {
      let degrees = from + (divideFloat(
        (sweep * $int.to_float(i)),
        $int.to_float(steps)
      ));
      let radians = ((degrees * pi)) / 180.0;
      return new Point(
        center.x + (radius * cos(radians)),
        center.y + (radius * sin(radians)),
      );
    },
  );
}

/**
 * The RenderPath for a path. `color` is the palette colour, used by shapes
 * that don't choose their own.
 */
export function render_path(path, color) {
  let _block;
  let $1 = path.shape;
  if ($1 instanceof Line) {
    let a = $1.start;
    let b = $1.end;
    _block = [listPrepend(a, listPrepend(b, $List$Empty$const)), color];
  } else if ($1 instanceof ColorLine) {
    let a = $1.start;
    let b = $1.end;
    let c = $1.color;
    _block = [listPrepend(a, listPrepend(b, $List$Empty$const)), css_color(c)];
  } else if ($1 instanceof Arc) {
    let center = $1.center;
    let radius = $1.radius;
    let from = $1.from;
    let to = $1.to;
    let c = $1.color;
    _block = [arc_points(center, radius, from, to), css_color(c)];
  } else {
    let p0 = $1.start;
    let p1 = $1.control1;
    let p2 = $1.control2;
    let p3 = $1.end;
    let c = $1.color;
    _block = [bezier_points(p0, p1, p2, p3), css_color(c)];
  }
  let $ = _block;
  let points = $[0];
  let stroke = $[1];
  return new RenderPath(points, path.thickness, stroke, path.start, path.end);
}
