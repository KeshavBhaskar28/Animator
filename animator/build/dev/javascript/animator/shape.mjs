//# sourceMappingURL=shape.mjs.map
import { CustomType as $CustomType } from "./gleam.mjs";

export class Point extends $CustomType {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}
export const Point$Point = (x, y) => new Point(x, y);
export const Point$isPoint = (value) => value instanceof Point;
export const Point$Point$x = (value) => value.x;
export const Point$Point$0 = (value) => value.x;
export const Point$Point$y = (value) => value.y;
export const Point$Point$1 = (value) => value.y;

export class Color extends $CustomType {
  constructor(r, g, b) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
  }
}
export const Color$Color = (r, g, b) => new Color(r, g, b);
export const Color$isColor = (value) => value instanceof Color;
export const Color$Color$r = (value) => value.r;
export const Color$Color$0 = (value) => value.r;
export const Color$Color$g = (value) => value.g;
export const Color$Color$1 = (value) => value.g;
export const Color$Color$b = (value) => value.b;
export const Color$Color$2 = (value) => value.b;

export class Line extends $CustomType {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
}
export const Shape$Line = (start, end) => new Line(start, end);
export const Shape$isLine = (value) => value instanceof Line;
export const Shape$Line$start = (value) => value.start;
export const Shape$Line$0 = (value) => value.start;
export const Shape$Line$end = (value) => value.end;
export const Shape$Line$1 = (value) => value.end;

export class ColorLine extends $CustomType {
  constructor(start, end, color) {
    super();
    this.start = start;
    this.end = end;
    this.color = color;
  }
}
export const Shape$ColorLine = (start, end, color) =>
  new ColorLine(start, end, color);
export const Shape$isColorLine = (value) => value instanceof ColorLine;
export const Shape$ColorLine$start = (value) => value.start;
export const Shape$ColorLine$0 = (value) => value.start;
export const Shape$ColorLine$end = (value) => value.end;
export const Shape$ColorLine$1 = (value) => value.end;
export const Shape$ColorLine$color = (value) => value.color;
export const Shape$ColorLine$2 = (value) => value.color;

export class Arc extends $CustomType {
  constructor(center, radius, from, to, color) {
    super();
    this.center = center;
    this.radius = radius;
    this.from = from;
    this.to = to;
    this.color = color;
  }
}
export const Shape$Arc = (center, radius, from, to, color) =>
  new Arc(center, radius, from, to, color);
export const Shape$isArc = (value) => value instanceof Arc;
export const Shape$Arc$center = (value) => value.center;
export const Shape$Arc$0 = (value) => value.center;
export const Shape$Arc$radius = (value) => value.radius;
export const Shape$Arc$1 = (value) => value.radius;
export const Shape$Arc$from = (value) => value.from;
export const Shape$Arc$2 = (value) => value.from;
export const Shape$Arc$to = (value) => value.to;
export const Shape$Arc$3 = (value) => value.to;
export const Shape$Arc$color = (value) => value.color;
export const Shape$Arc$4 = (value) => value.color;

export class Curve extends $CustomType {
  constructor(start, control1, control2, end, color) {
    super();
    this.start = start;
    this.control1 = control1;
    this.control2 = control2;
    this.end = end;
    this.color = color;
  }
}
export const Shape$Curve = (start, control1, control2, end, color) =>
  new Curve(start, control1, control2, end, color);
export const Shape$isCurve = (value) => value instanceof Curve;
export const Shape$Curve$start = (value) => value.start;
export const Shape$Curve$0 = (value) => value.start;
export const Shape$Curve$control1 = (value) => value.control1;
export const Shape$Curve$1 = (value) => value.control1;
export const Shape$Curve$control2 = (value) => value.control2;
export const Shape$Curve$2 = (value) => value.control2;
export const Shape$Curve$end = (value) => value.end;
export const Shape$Curve$3 = (value) => value.end;
export const Shape$Curve$color = (value) => value.color;
export const Shape$Curve$4 = (value) => value.color;

export class Path extends $CustomType {
  constructor(shape, start, end, thickness) {
    super();
    this.shape = shape;
    this.start = start;
    this.end = end;
    this.thickness = thickness;
  }
}
export const Path$Path = (shape, start, end, thickness) =>
  new Path(shape, start, end, thickness);
export const Path$isPath = (value) => value instanceof Path;
export const Path$Path$shape = (value) => value.shape;
export const Path$Path$0 = (value) => value.shape;
export const Path$Path$start = (value) => value.start;
export const Path$Path$1 = (value) => value.start;
export const Path$Path$end = (value) => value.end;
export const Path$Path$2 = (value) => value.end;
export const Path$Path$thickness = (value) => value.thickness;
export const Path$Path$3 = (value) => value.thickness;
