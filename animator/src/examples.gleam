//// The drawings that a browser with no saved library starts with: each one's
//// name and source.

pub const all = [
  #(
    "fan",
    "fn draw(shape_slider: Int) -> List(Path) {
  fan(30, Point(-200, -200))
}

fn fan(n: Int, start: Point) -> List(Path) {
  case n > 0 {
    True -> [Path(Line(start, Point(n * 10, 200)), 0, 30, 3), ..fan(n - 1, start)]
    False -> []
  }
}
",
  ),
  #(
    "square_spiral",
    "fn draw(shape_slider: Int) -> List(Path) {
  let turns = 20 + shape_slider / 4
  spiral(Point(0, 0), Point(1, 0), 0, turns)
}

fn spiral(p: Point, d: Point, i: Int, n: Int) -> List(Path) {
  case i == n {
    True -> []
    False -> {
      let len = { i / 2 + 1 } * 24
      let q = Point(p.x + d.x * len, p.y + d.y * len)
      [
        Path(Line(p, q), i * 3, i * 3 + 3, 3),
        ..spiral(q, Point(0 - d.y, d.x), i + 1, n)
      ]
    }
  }
}
",
  ),
  #(
    "string_art",
    "fn draw(shape_slider: Int) -> List(Path) {
  let n = 8 + shape_slider / 10
  list.flatten([
    quadrant(1, 1, n, 0),
    quadrant(-1, 1, n, n + 1),
    quadrant(-1, -1, n, { n + 1 } * 2),
    quadrant(1, -1, n, { n + 1 } * 3),
  ])
}

fn quadrant(sx: Int, sy: Int, n: Int, base: Int) -> List(Path) {
  strings(0, sx, sy, n, base)
}

fn strings(i: Int, sx: Int, sy: Int, n: Int, base: Int) -> List(Path) {
  case i > n {
    True -> []
    False -> {
      let a = Point(sx * 420 * i / n, 0)
      let b = Point(0, sy * 420 * { n - i } / n)
      let t = { base + i } * 2
      [Path(Line(a, b), t, t + 8, 2), ..strings(i + 1, sx, sy, n, base)]
    }
  }
}
",
  ),
  #(
    "tree",
    "fn draw(shape_slider: Int) -> List(Path) {
  let depth = 4 + shape_slider / 20
  branch(Point(0, 420), Point(0, -220), 0, depth)
}

fn branch(p: Point, d: Point, level: Int, depth: Int) -> List(Path) {
  case level == depth {
    True -> []
    False -> {
      let q = Point(p.x + d.x, p.y + d.y)
      let left = Point({ d.x - d.y } / 2, { d.y + d.x } / 2)
      let right = Point({ d.x + d.y } / 2, { d.y - d.x } / 2)
      [
        Path(Line(p, q), level * 4, level * 4 + 4, depth - level),
        ..list.append(
          branch(q, left, level + 1, depth),
          branch(q, right, level + 1, depth),
        )
      ]
    }
  }
}
",
  ),
  #(
    "mandala",
    "// A turtle draws nested petals; kaleidoscope copies them around the
// center and rainbow colors them. Slide to change the number of copies.
fn draw(shape_slider: Int) -> List(Path) {
  let copies = 3 + shape_slider / 10
  let t = speed(pen_width(turtle(0, 0, -90), 2), 25)
  rainbow(kaleidoscope(turtle_paths(petals(t, 6)), copies))
}

fn petals(t: Turtle, n: Int) -> Turtle {
  case n == 0 {
    True -> t
    False -> {
      let r = n * 70
      let t = circle(t, r, 60)
      let t = turn(t, 120)
      let t = circle(t, r, 60)
      let t = turn(t, 120)
      petals(t, n - 1)
    }
  }
}
",
  ),
  #(
    "color_spiral",
    "// A turtle walks along growing arcs, changing its pen color as it goes.
fn draw(shape_slider: Int) -> List(Path) {
  let steps = 16 + shape_slider / 3
  turtle_paths(spiral(speed(turtle(0, 0, 0), 40), 1, steps))
}

fn spiral(t: Turtle, i: Int, n: Int) -> Turtle {
  case i > n {
    True -> t
    False -> {
      let t = pen_color(t, hsl(i * 12, 90, 60))
      let t = pen_width(t, 1 + i / 6)
      spiral(circle(t, i * 7, 50), i + 1, n)
    }
  }
}
",
  ),
  #(
    "fountain",
    "// Bezier curves, blended from blue to pink and mirrored left to right.
fn draw(shape_slider: Int) -> List(Path) {
  let n = 8 + shape_slider / 5
  mirror(gradient(jets(1, n), Rgb(40, 120, 255), Rgb(255, 80, 200)))
}

fn jets(i: Int, n: Int) -> List(Path) {
  case i > n {
    True -> []
    False -> {
      let x = 420 * i / n
      let top = 0 - 460 + 300 * i / n
      let curve = Curve(Point(0, 420), Point(0, top), Point(x, top), Point(x, 420), Rgb(255, 255, 255))
      [Path(curve, i * 2, i * 2 + 20, 3), ..jets(i + 1, n)]
    }
  }
}
",
  ),
]
