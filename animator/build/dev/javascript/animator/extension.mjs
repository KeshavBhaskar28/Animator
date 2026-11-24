//# sourceMappingURL=extension.mjs.map
import * as $float from "../gleam_stdlib/gleam/float.mjs";
import * as $int from "../gleam_stdlib/gleam/int.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $result from "../gleam_stdlib/gleam/result.mjs";
import * as $errors from "./errors.mjs";
import { TypeError } from "./errors.mjs";
import * as $evaluator from "./evaluator.mjs";
import { Builtin, VBool, VData, VFunc, VInt, VList } from "./evaluator.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
} from "./gleam.mjs";
import * as $limits from "./limits.mjs";
import { sin, cos } from "./render_ffi.mjs";

class Turtle extends $CustomType {
  constructor(x, y, heading, pen, color, width, speed, time, paths) {
    super();
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.pen = pen;
    this.color = color;
    this.width = width;
    this.speed = speed;
    this.time = time;
    this.paths = paths;
  }
}

const scale = 1000.0;

const pi = 3.141592653589793;

function expects(name, what) {
  return new Error(new TypeError((name + " expects ") + what));
}

function from_value(name, v) {
  if (v instanceof VData) {
    let $ = v.fields;
    if ($ instanceof $Empty) {
      return expects(name, "a turtle");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects(name, "a turtle");
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return expects(name, "a turtle");
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            return expects(name, "a turtle");
          } else {
            let $4 = $3.tail;
            if ($4 instanceof $Empty) {
              return expects(name, "a turtle");
            } else {
              let $5 = $4.tail;
              if ($5 instanceof $Empty) {
                return expects(name, "a turtle");
              } else {
                let $6 = $5.tail;
                if ($6 instanceof $Empty) {
                  return expects(name, "a turtle");
                } else {
                  let $7 = $6.tail;
                  if ($7 instanceof $Empty) {
                    return expects(name, "a turtle");
                  } else {
                    let $8 = $7.tail;
                    if ($8 instanceof $Empty) {
                      return expects(name, "a turtle");
                    } else if ($8.tail instanceof $Empty) {
                      let $9 = $.head;
                      if ($9 instanceof VInt) {
                        let $10 = $1.head;
                        if ($10 instanceof VInt) {
                          let $11 = $2.head;
                          if ($11 instanceof VInt) {
                            let $12 = $3.head;
                            if ($12 instanceof VBool) {
                              let $13 = $5.head;
                              if ($13 instanceof VInt) {
                                let $14 = $6.head;
                                if ($14 instanceof VInt) {
                                  let $15 = $7.head;
                                  if ($15 instanceof VInt) {
                                    let $16 = $8.head;
                                    if (
                                      $16 instanceof VList &&
                                      v.tag === "Turtle"
                                    ) {
                                      let color = $4.head;
                                      let x = $9[0];
                                      let y = $10[0];
                                      let heading = $11[0];
                                      let pen = $12[0];
                                      let width = $13[0];
                                      let speed = $14[0];
                                      let time = $15[0];
                                      let paths = $16[0];
                                      return new Ok(
                                        new Turtle(
                                          divideFloat($int.to_float(x), scale),
                                          divideFloat($int.to_float(y), scale),
                                          divideFloat(
                                            $int.to_float(heading),
                                            scale
                                          ),
                                          pen,
                                          color,
                                          width,
                                          speed,
                                          divideFloat(
                                            $int.to_float(time),
                                            scale
                                          ),
                                          paths,
                                        ),
                                      );
                                    } else {
                                      return expects(name, "a turtle");
                                    }
                                  } else {
                                    return expects(name, "a turtle");
                                  }
                                } else {
                                  return expects(name, "a turtle");
                                }
                              } else {
                                return expects(name, "a turtle");
                              }
                            } else {
                              return expects(name, "a turtle");
                            }
                          } else {
                            return expects(name, "a turtle");
                          }
                        } else {
                          return expects(name, "a turtle");
                        }
                      } else {
                        return expects(name, "a turtle");
                      }
                    } else {
                      return expects(name, "a turtle");
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    return expects(name, "a turtle");
  }
}

function builtin_turtle_paths(args) {
  if (args instanceof $Empty) {
    return expects("turtle_paths", "a turtle");
  } else if (args.tail instanceof $Empty) {
    let tv = args.head;
    return $result.try$(
      from_value("turtle_paths", tv),
      (t) => {
        $limits.charge($list.length(t.paths));
        return new Ok(new VList($list.reverse(t.paths)));
      },
    );
  } else {
    return expects("turtle_paths", "a turtle");
  }
}

function builtin(name, num_args, run) {
  return [name, new VFunc(new Builtin(name, num_args, run))];
}

function to_value(t) {
  return new VData(
    "Turtle",
    listPrepend(
      new VInt($float.round(t.x * scale)),
      listPrepend(
        new VInt($float.round(t.y * scale)),
        listPrepend(
          new VInt($float.round(t.heading * scale)),
          listPrepend(
            new VBool(t.pen),
            listPrepend(
              t.color,
              listPrepend(
                new VInt(t.width),
                listPrepend(
                  new VInt(t.speed),
                  listPrepend(
                    new VInt($float.round(t.time * scale)),
                    listPrepend(new VList(t.paths), $List$Empty$const),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function builtin_speed(args) {
  if (args instanceof $Empty) {
    return expects("speed", "a turtle and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("speed", "a turtle and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let tv = args.head;
        let units = $1[0];
        return $result.try$(
          from_value("speed", tv),
          (t) => {
            return new Ok(
              to_value(
                new Turtle(
                  t.x,
                  t.y,
                  t.heading,
                  t.pen,
                  t.color,
                  t.width,
                  $int.max(1, units),
                  t.time,
                  t.paths,
                ),
              ),
            );
          },
        );
      } else {
        return expects("speed", "a turtle and an int");
      }
    } else {
      return expects("speed", "a turtle and an int");
    }
  }
}

function builtin_pen_width(args) {
  if (args instanceof $Empty) {
    return expects("pen_width", "a turtle and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("pen_width", "a turtle and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let tv = args.head;
        let width = $1[0];
        return $result.try$(
          from_value("pen_width", tv),
          (t) => {
            return new Ok(
              to_value(
                new Turtle(
                  t.x,
                  t.y,
                  t.heading,
                  t.pen,
                  t.color,
                  $int.max(1, width),
                  t.speed,
                  t.time,
                  t.paths,
                ),
              ),
            );
          },
        );
      } else {
        return expects("pen_width", "a turtle and an int");
      }
    } else {
      return expects("pen_width", "a turtle and an int");
    }
  }
}

function is_color(v) {
  if (v instanceof VData) {
    let $ = v.fields;
    if ($ instanceof $Empty) {
      return false;
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return false;
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return false;
        } else if (
          $2.tail instanceof $Empty &&
          $.head instanceof VInt &&
          $1.head instanceof VInt &&
          $2.head instanceof VInt &&
          v.tag === "Rgb"
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }
}

function builtin_pen_color(args) {
  if (args instanceof $Empty) {
    return expects("pen_color", "a turtle and an Rgb color");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("pen_color", "a turtle and an Rgb color");
    } else if ($.tail instanceof $Empty) {
      let tv = args.head;
      let color = $.head;
      let $1 = is_color(color);
      if ($1) {
        return $result.try$(
          from_value("pen_color", tv),
          (t) => {
            return new Ok(
              to_value(
                new Turtle(
                  t.x,
                  t.y,
                  t.heading,
                  t.pen,
                  color,
                  t.width,
                  t.speed,
                  t.time,
                  t.paths,
                ),
              ),
            );
          },
        );
      } else {
        return expects("pen_color", "a turtle and an Rgb color");
      }
    } else {
      return expects("pen_color", "a turtle and an Rgb color");
    }
  }
}

function pen_setter(name, f) {
  return (args) => {
    if (args instanceof $Empty) {
      return expects(name, "a turtle");
    } else {
      let tv = args.head;
      let rest = args.tail;
      return $result.try$(
        from_value(name, tv),
        (t) => { return new Ok(to_value(f(t, rest))); },
      );
    }
  };
}

function fmod(x, m) {
  return x - (m * $int.to_float($float.truncate(divideFloat(x, m))));
}

function wrap_degrees(d) {
  let w = fmod(d, 360.0);
  let $ = w < 0.0;
  if ($) {
    return w + 360.0;
  } else {
    return w;
  }
}

function draw(t, shape, length) {
  let duration = divideFloat(length, $int.to_float($int.max(1, t.speed)));
  let end = t.time + duration;
  let $ = t.pen;
  if ($) {
    let path = new VData(
      "Path",
      listPrepend(
        shape,
        listPrepend(
          new VInt($float.round(t.time)),
          listPrepend(
            new VInt($float.round(end)),
            listPrepend(new VInt(t.width), $List$Empty$const),
          ),
        ),
      ),
    );
    return new Turtle(
      t.x,
      t.y,
      t.heading,
      t.pen,
      t.color,
      t.width,
      t.speed,
      end,
      listPrepend(path, t.paths),
    );
  } else {
    return t;
  }
}

function radians(degrees) {
  return ((degrees * pi)) / 180.0;
}

function point(x, y) {
  return new VData(
    "Point",
    listPrepend(
      new VInt($float.round(x)),
      listPrepend(new VInt($float.round(y)), $List$Empty$const),
    ),
  );
}

function builtin_circle(args) {
  if (args instanceof $Empty) {
    return expects("circle", "a turtle and two ints");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("circle", "a turtle and two ints");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects("circle", "a turtle and two ints");
      } else if ($1.tail instanceof $Empty) {
        let $2 = $.head;
        if ($2 instanceof VInt) {
          let $3 = $1.head;
          if ($3 instanceof VInt) {
            let tv = args.head;
            let radius = $2[0];
            let degrees = $3[0];
            return $result.try$(
              from_value("circle", tv),
              (t) => {
                let r = $int.to_float($int.absolute_value(radius));
                let sweep = $int.to_float(degrees);
                let _block;
                let $4 = degrees >= 0;
                if ($4) {
                  _block = 90.0;
                } else {
                  _block = -90.0;
                }
                let side = _block;
                let to_center = radians(t.heading + side);
                let cx = t.x + (r * cos(to_center));
                let cy = t.y + (r * sin(to_center));
                let from = t.heading - side;
                let to = from + sweep;
                let nx = cx + (r * cos(radians(to)));
                let ny = cy + (r * sin(radians(to)));
                let shape = new VData(
                  "Arc",
                  listPrepend(
                    point(cx, cy),
                    listPrepend(
                      new VInt($float.round(r)),
                      listPrepend(
                        new VInt($float.round(from)),
                        listPrepend(
                          new VInt($float.round(to)),
                          listPrepend(t.color, $List$Empty$const),
                        ),
                      ),
                    ),
                  ),
                );
                let length = r * radians($float.absolute_value(sweep));
                let t$1 = draw(t, shape, length);
                return new Ok(
                  to_value(
                    new Turtle(
                      nx,
                      ny,
                      wrap_degrees(t$1.heading + sweep),
                      t$1.pen,
                      t$1.color,
                      t$1.width,
                      t$1.speed,
                      t$1.time,
                      t$1.paths,
                    ),
                  ),
                );
              },
            );
          } else {
            return expects("circle", "a turtle and two ints");
          }
        } else {
          return expects("circle", "a turtle and two ints");
        }
      } else {
        return expects("circle", "a turtle and two ints");
      }
    }
  }
}

function builtin_turn(args) {
  if (args instanceof $Empty) {
    return expects("turn", "a turtle and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("turn", "a turtle and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let tv = args.head;
        let degrees = $1[0];
        return $result.try$(
          from_value("turn", tv),
          (t) => {
            return new Ok(
              to_value(
                new Turtle(
                  t.x,
                  t.y,
                  wrap_degrees(t.heading + $int.to_float(degrees)),
                  t.pen,
                  t.color,
                  t.width,
                  t.speed,
                  t.time,
                  t.paths,
                ),
              ),
            );
          },
        );
      } else {
        return expects("turn", "a turtle and an int");
      }
    } else {
      return expects("turn", "a turtle and an int");
    }
  }
}

function builtin_forward(args) {
  if (args instanceof $Empty) {
    return expects("forward", "a turtle and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("forward", "a turtle and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let tv = args.head;
        let distance = $1[0];
        return $result.try$(
          from_value("forward", tv),
          (t) => {
            let d = $int.to_float(distance);
            let r = radians(t.heading);
            let nx = t.x + (d * cos(r));
            let ny = t.y + (d * sin(r));
            let shape = new VData(
              "ColorLine",
              listPrepend(
                point(t.x, t.y),
                listPrepend(
                  point(nx, ny),
                  listPrepend(t.color, $List$Empty$const),
                ),
              ),
            );
            let t$1 = draw(t, shape, $float.absolute_value(d));
            return new Ok(
              to_value(
                new Turtle(
                  nx,
                  ny,
                  t$1.heading,
                  t$1.pen,
                  t$1.color,
                  t$1.width,
                  t$1.speed,
                  t$1.time,
                  t$1.paths,
                ),
              ),
            );
          },
        );
      } else {
        return expects("forward", "a turtle and an int");
      }
    } else {
      return expects("forward", "a turtle and an int");
    }
  }
}

function rgb(r, g, b) {
  return new VData(
    "Rgb",
    listPrepend(
      new VInt(r),
      listPrepend(new VInt(g), listPrepend(new VInt(b), $List$Empty$const)),
    ),
  );
}

function builtin_turtle(args) {
  if (args instanceof $Empty) {
    return expects("turtle", "three ints");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("turtle", "three ints");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects("turtle", "three ints");
      } else if ($1.tail instanceof $Empty) {
        let $2 = args.head;
        if ($2 instanceof VInt) {
          let $3 = $.head;
          if ($3 instanceof VInt) {
            let $4 = $1.head;
            if ($4 instanceof VInt) {
              let x = $2[0];
              let y = $3[0];
              let heading = $4[0];
              return new Ok(
                to_value(
                  new Turtle(
                    $int.to_float(x),
                    $int.to_float(y),
                    $int.to_float(heading),
                    true,
                    rgb(242, 193, 78),
                    3,
                    10,
                    0.0,
                    $List$Empty$const,
                  ),
                ),
              );
            } else {
              return expects("turtle", "three ints");
            }
          } else {
            return expects("turtle", "three ints");
          }
        } else {
          return expects("turtle", "three ints");
        }
      } else {
        return expects("turtle", "three ints");
      }
    }
  }
}

function transform(name, shape, move_point, move_angle) {
  let point$1 = (p) => {
    if (p instanceof VData) {
      let $ = p.fields;
      if ($ instanceof $Empty) {
        return expects(name, "shapes made of Points");
      } else {
        let $1 = $.tail;
        if ($1 instanceof $Empty) {
          return expects(name, "shapes made of Points");
        } else if ($1.tail instanceof $Empty) {
          let $2 = $.head;
          if ($2 instanceof VInt) {
            let $3 = $1.head;
            if ($3 instanceof VInt && p.tag === "Point") {
              let x = $2[0];
              let y = $3[0];
              let $4 = move_point($int.to_float(x), $int.to_float(y));
              let nx = $4[0];
              let ny = $4[1];
              return new Ok(
                new VData(
                  "Point",
                  listPrepend(
                    new VInt($float.round(nx)),
                    listPrepend(new VInt($float.round(ny)), $List$Empty$const),
                  ),
                ),
              );
            } else {
              return expects(name, "shapes made of Points");
            }
          } else {
            return expects(name, "shapes made of Points");
          }
        } else {
          return expects(name, "shapes made of Points");
        }
      }
    } else {
      return expects(name, "shapes made of Points");
    }
  };
  let angle = (a) => {
    if (a instanceof VInt) {
      let d = a[0];
      return new Ok(new VInt($float.round(move_angle($int.to_float(d)))));
    } else {
      return expects(name, "an Arc with int angles");
    }
  };
  if (shape instanceof VData) {
    let $ = shape.fields;
    if ($ instanceof $Empty) {
      return expects(name, "Paths of recognized shapes");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects(name, "Paths of recognized shapes");
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          if (shape.tag === "Line") {
            let a = $.head;
            let b = $1.head;
            return $result.try$(
              point$1(a),
              (a) => {
                return $result.try$(
                  point$1(b),
                  (b) => {
                    return new Ok(
                      new VData(
                        "Line",
                        listPrepend(a, listPrepend(b, $List$Empty$const)),
                      ),
                    );
                  },
                );
              },
            );
          } else {
            return expects(name, "Paths of recognized shapes");
          }
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            if (shape.tag === "ColorLine") {
              let a = $.head;
              let b = $1.head;
              let c = $2.head;
              return $result.try$(
                point$1(a),
                (a) => {
                  return $result.try$(
                    point$1(b),
                    (b) => {
                      return new Ok(
                        new VData(
                          "ColorLine",
                          listPrepend(
                            a,
                            listPrepend(b, listPrepend(c, $List$Empty$const)),
                          ),
                        ),
                      );
                    },
                  );
                },
              );
            } else {
              return expects(name, "Paths of recognized shapes");
            }
          } else {
            let $4 = $3.tail;
            if ($4 instanceof $Empty) {
              return expects(name, "Paths of recognized shapes");
            } else if ($4.tail instanceof $Empty) {
              let $5 = shape.tag;
              if ($5 === "Arc") {
                let center = $.head;
                let radius = $1.head;
                let from = $2.head;
                let to = $3.head;
                let c = $4.head;
                return $result.try$(
                  point$1(center),
                  (center) => {
                    return $result.try$(
                      angle(from),
                      (from) => {
                        return $result.try$(
                          angle(to),
                          (to) => {
                            return new Ok(
                              new VData(
                                "Arc",
                                listPrepend(
                                  center,
                                  listPrepend(
                                    radius,
                                    listPrepend(
                                      from,
                                      listPrepend(
                                        to,
                                        listPrepend(c, $List$Empty$const),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        );
                      },
                    );
                  },
                );
              } else if ($5 === "Curve") {
                let p0 = $.head;
                let p1 = $1.head;
                let p2 = $2.head;
                let p3 = $3.head;
                let c = $4.head;
                return $result.try$(
                  point$1(p0),
                  (p0) => {
                    return $result.try$(
                      point$1(p1),
                      (p1) => {
                        return $result.try$(
                          point$1(p2),
                          (p2) => {
                            return $result.try$(
                              point$1(p3),
                              (p3) => {
                                return new Ok(
                                  new VData(
                                    "Curve",
                                    listPrepend(
                                      p0,
                                      listPrepend(
                                        p1,
                                        listPrepend(
                                          p2,
                                          listPrepend(
                                            p3,
                                            listPrepend(c, $List$Empty$const),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        );
                      },
                    );
                  },
                );
              } else {
                return expects(name, "Paths of recognized shapes");
              }
            } else {
              return expects(name, "Paths of recognized shapes");
            }
          }
        }
      }
    }
  } else {
    return expects(name, "Paths of recognized shapes");
  }
}

function map_shape(name, path, f) {
  if (path instanceof VData) {
    let $ = path.fields;
    if ($ instanceof $Empty) {
      return expects(name, "a list of Paths");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects(name, "a list of Paths");
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return expects(name, "a list of Paths");
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            return expects(name, "a list of Paths");
          } else if ($3.tail instanceof $Empty && path.tag === "Path") {
            let shape = $.head;
            let start = $1.head;
            let end = $2.head;
            let thickness = $3.head;
            return $result.try$(
              f(shape),
              (new_shape) => {
                return new Ok(
                  new VData(
                    "Path",
                    listPrepend(
                      new_shape,
                      listPrepend(
                        start,
                        listPrepend(
                          end,
                          listPrepend(thickness, $List$Empty$const),
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          } else {
            return expects(name, "a list of Paths");
          }
        }
      }
    }
  } else {
    return expects(name, "a list of Paths");
  }
}

function paths_arg(name, v) {
  if (v instanceof VList) {
    let items = v[0];
    $limits.charge($list.length(items));
    return $list.try_map(
      items,
      (item) => {
        if (item instanceof VData) {
          let $ = item.fields;
          if ($ instanceof $Empty) {
            return expects(name, "a list of Paths");
          } else {
            let $1 = $.tail;
            if ($1 instanceof $Empty) {
              return expects(name, "a list of Paths");
            } else {
              let $2 = $1.tail;
              if ($2 instanceof $Empty) {
                return expects(name, "a list of Paths");
              } else {
                let $3 = $2.tail;
                if ($3 instanceof $Empty) {
                  return expects(name, "a list of Paths");
                } else if ($3.tail instanceof $Empty && item.tag === "Path") {
                  return new Ok(item);
                } else {
                  return expects(name, "a list of Paths");
                }
              }
            }
          }
        } else {
          return expects(name, "a list of Paths");
        }
      },
    );
  } else {
    return expects(name, "a list of Paths");
  }
}

function builtin_mirror(args) {
  if (args instanceof $Empty) {
    return expects("mirror", "a list of Paths");
  } else if (args.tail instanceof $Empty) {
    let paths = args.head;
    return $result.try$(
      paths_arg("mirror", paths),
      (paths) => {
        return $result.try$(
          $list.try_map(
            paths,
            (path) => {
              return map_shape(
                "mirror",
                path,
                (shape) => {
                  return transform(
                    "mirror",
                    shape,
                    (x, y) => { return [0.0 - x, y]; },
                    (a) => { return 180.0 - a; },
                  );
                },
              );
            },
          ),
          (reflected) => {
            return new Ok(new VList($list.append(paths, reflected)));
          },
        );
      },
    );
  } else {
    return expects("mirror", "a list of Paths");
  }
}

function rotate_paths(name, paths, degrees) {
  let r = radians(degrees);
  let c = cos(r);
  let s = sin(r);
  return $list.try_map(
    paths,
    (path) => {
      return map_shape(
        name,
        path,
        (shape) => {
          return transform(
            name,
            shape,
            (x, y) => { return [(x * c) - (y * s), (x * s) + (y * c)]; },
            (a) => { return a + degrees; },
          );
        },
      );
    },
  );
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

function builtin_kaleidoscope(args) {
  if (args instanceof $Empty) {
    return expects("kaleidoscope", "a list of Paths and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("kaleidoscope", "a list of Paths and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let paths = args.head;
        let n = $1[0];
        return $result.try$(
          paths_arg("kaleidoscope", paths),
          (paths) => {
            let $2 = n < 1;
            if ($2) {
              return new Ok(new VList($List$Empty$const));
            } else {
              $limits.charge(n * $list.length(paths));
              let _pipe = upto(n - 1);
              let _pipe$1 = $list.try_map(
                _pipe,
                (i) => {
                  return rotate_paths(
                    "kaleidoscope",
                    paths,
                    divideFloat((360.0 * $int.to_float(i)), $int.to_float(n)),
                  );
                },
              );
              return $result.map(
                _pipe$1,
                (copies) => { return new VList($list.flatten(copies)); },
              );
            }
          },
        );
      } else {
        return expects("kaleidoscope", "a list of Paths and an int");
      }
    } else {
      return expects("kaleidoscope", "a list of Paths and an int");
    }
  }
}

function builtin_rotate(args) {
  if (args instanceof $Empty) {
    return expects("rotate", "a list of Paths and an int");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("rotate", "a list of Paths and an int");
    } else if ($.tail instanceof $Empty) {
      let $1 = $.head;
      if ($1 instanceof VInt) {
        let paths = args.head;
        let degrees = $1[0];
        return $result.try$(
          paths_arg("rotate", paths),
          (paths) => {
            return $result.map(
              rotate_paths("rotate", paths, $int.to_float(degrees)),
              (var0) => { return new VList(var0); },
            );
          },
        );
      } else {
        return expects("rotate", "a list of Paths and an int");
      }
    } else {
      return expects("rotate", "a list of Paths and an int");
    }
  }
}

function recolor(name, shape, color) {
  if (shape instanceof VData) {
    let $ = shape.fields;
    if ($ instanceof $Empty) {
      return expects(name, "Paths of recognized shapes");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects(name, "Paths of recognized shapes");
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          if (shape.tag === "Line") {
            let a = $.head;
            let b = $1.head;
            return new Ok(
              new VData(
                "ColorLine",
                listPrepend(
                  a,
                  listPrepend(b, listPrepend(color, $List$Empty$const)),
                ),
              ),
            );
          } else {
            return expects(name, "Paths of recognized shapes");
          }
        } else {
          let $3 = $2.tail;
          if ($3 instanceof $Empty) {
            if (shape.tag === "ColorLine") {
              let a = $.head;
              let b = $1.head;
              return new Ok(
                new VData(
                  "ColorLine",
                  listPrepend(
                    a,
                    listPrepend(b, listPrepend(color, $List$Empty$const)),
                  ),
                ),
              );
            } else {
              return expects(name, "Paths of recognized shapes");
            }
          } else {
            let $4 = $3.tail;
            if ($4 instanceof $Empty) {
              return expects(name, "Paths of recognized shapes");
            } else if ($4.tail instanceof $Empty) {
              let $5 = shape.tag;
              if ($5 === "Arc") {
                let center = $.head;
                let radius = $1.head;
                let from = $2.head;
                let to = $3.head;
                return new Ok(
                  new VData(
                    "Arc",
                    listPrepend(
                      center,
                      listPrepend(
                        radius,
                        listPrepend(
                          from,
                          listPrepend(to, listPrepend(color, $List$Empty$const)),
                        ),
                      ),
                    ),
                  ),
                );
              } else if ($5 === "Curve") {
                let p0 = $.head;
                let p1 = $1.head;
                let p2 = $2.head;
                let p3 = $3.head;
                return new Ok(
                  new VData(
                    "Curve",
                    listPrepend(
                      p0,
                      listPrepend(
                        p1,
                        listPrepend(
                          p2,
                          listPrepend(p3, listPrepend(color, $List$Empty$const)),
                        ),
                      ),
                    ),
                  ),
                );
              } else {
                return expects(name, "Paths of recognized shapes");
              }
            } else {
              return expects(name, "Paths of recognized shapes");
            }
          }
        }
      }
    }
  } else {
    return expects(name, "Paths of recognized shapes");
  }
}

function hsl(hue, saturation, lightness) {
  let h = wrap_degrees(hue) / 60.0;
  let s = $int.to_float($int.clamp(saturation, 0, 100)) / 100.0;
  let l = $int.to_float($int.clamp(lightness, 0, 100)) / 100.0;
  let chroma = (1.0 - $float.absolute_value((2.0 * l) - 1.0)) * s;
  let x = chroma * (1.0 - $float.absolute_value(fmod(h, 2.0) - 1.0));
  let _block;
  let $1 = $float.truncate(h);
  if ($1 === 0) {
    _block = [chroma, x, 0.0];
  } else if ($1 === 1) {
    _block = [x, chroma, 0.0];
  } else if ($1 === 2) {
    _block = [0.0, chroma, x];
  } else if ($1 === 3) {
    _block = [0.0, x, chroma];
  } else if ($1 === 4) {
    _block = [x, 0.0, chroma];
  } else {
    _block = [chroma, 0.0, x];
  }
  let $ = _block;
  let r = $[0];
  let g = $[1];
  let b = $[2];
  let m = l - (chroma / 2.0);
  let channel = (v) => { return $float.round((v + m) * 255.0); };
  return rgb(channel(r), channel(g), channel(b));
}

function builtin_rainbow(args) {
  if (args instanceof $Empty) {
    return expects("rainbow", "a list of Paths");
  } else if (args.tail instanceof $Empty) {
    let paths = args.head;
    return $result.try$(
      paths_arg("rainbow", paths),
      (paths) => {
        let n = $int.max(1, $list.length(paths));
        let _pipe = $list.index_map(
          paths,
          (path, i) => {
            let color = hsl(
              divideFloat((360.0 * $int.to_float(i)), $int.to_float(n)),
              90,
              60,
            );
            return map_shape(
              "rainbow",
              path,
              (_capture) => { return recolor("rainbow", _capture, color); },
            );
          },
        );
        let _pipe$1 = $result.all(_pipe);
        return $result.map(_pipe$1, (var0) => { return new VList(var0); });
      },
    );
  } else {
    return expects("rainbow", "a list of Paths");
  }
}

function blend(from, to, t) {
  if (from instanceof VData) {
    let $ = from.fields;
    if ($ instanceof $Empty) {
      return from;
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return from;
      } else {
        let $2 = $1.tail;
        if ($2 instanceof $Empty) {
          return from;
        } else if ($2.tail instanceof $Empty && to instanceof VData) {
          let $3 = to.fields;
          if ($3 instanceof $Empty) {
            return from;
          } else {
            let $4 = $3.tail;
            if ($4 instanceof $Empty) {
              return from;
            } else {
              let $5 = $4.tail;
              if ($5 instanceof $Empty) {
                return from;
              } else if ($5.tail instanceof $Empty) {
                let $6 = $.head;
                if ($6 instanceof VInt) {
                  let $7 = $1.head;
                  if ($7 instanceof VInt) {
                    let $8 = $2.head;
                    if ($8 instanceof VInt) {
                      let $9 = $3.head;
                      if ($9 instanceof VInt) {
                        let $10 = $4.head;
                        if ($10 instanceof VInt) {
                          let $11 = $5.head;
                          if (
                            $11 instanceof VInt &&
                            from.tag === "Rgb" &&
                            to.tag === "Rgb"
                          ) {
                            let r1 = $6[0];
                            let g1 = $7[0];
                            let b1 = $8[0];
                            let r2 = $9[0];
                            let g2 = $10[0];
                            let b2 = $11[0];
                            let mix = (a, b) => {
                              return $float.round(
                                $int.to_float(a) + ($int.to_float(b - a) * t),
                              );
                            };
                            return rgb(mix(r1, r2), mix(g1, g2), mix(b1, b2));
                          } else {
                            return from;
                          }
                        } else {
                          return from;
                        }
                      } else {
                        return from;
                      }
                    } else {
                      return from;
                    }
                  } else {
                    return from;
                  }
                } else {
                  return from;
                }
              } else {
                return from;
              }
            }
          }
        } else {
          return from;
        }
      }
    }
  } else {
    return from;
  }
}

function builtin_gradient(args) {
  if (args instanceof $Empty) {
    return expects("gradient", "a list of Paths and two Rgb colors");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("gradient", "a list of Paths and two Rgb colors");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects("gradient", "a list of Paths and two Rgb colors");
      } else if ($1.tail instanceof $Empty) {
        let paths = args.head;
        let from = $.head;
        let to = $1.head;
        let $2 = is_color(from) && is_color(to);
        if ($2) {
          return $result.try$(
            paths_arg("gradient", paths),
            (paths) => {
              let last = $int.max(1, $list.length(paths) - 1);
              let _pipe = $list.index_map(
                paths,
                (path, i) => {
                  let color = blend(
                    from,
                    to,
                    divideFloat($int.to_float(i), $int.to_float(last)),
                  );
                  return map_shape(
                    "gradient",
                    path,
                    (_capture) => {
                      return recolor("gradient", _capture, color);
                    },
                  );
                },
              );
              let _pipe$1 = $result.all(_pipe);
              return $result.map(_pipe$1, (var0) => { return new VList(var0); });
            },
          );
        } else {
          return expects("gradient", "a list of Paths and two Rgb colors");
        }
      } else {
        return expects("gradient", "a list of Paths and two Rgb colors");
      }
    }
  }
}

function trig(name, f) {
  return (args) => {
    if (args instanceof $Empty) {
      return expects(name, "two ints");
    } else {
      let $ = args.tail;
      if ($ instanceof $Empty) {
        return expects(name, "two ints");
      } else if ($.tail instanceof $Empty) {
        let $1 = args.head;
        if ($1 instanceof VInt) {
          let $2 = $.head;
          if ($2 instanceof VInt) {
            let degrees = $1[0];
            let scale$1 = $2[0];
            return new Ok(
              new VInt(
                $float.round(
                  $int.to_float(scale$1) * f(radians($int.to_float(degrees))),
                ),
              ),
            );
          } else {
            return expects(name, "two ints");
          }
        } else {
          return expects(name, "two ints");
        }
      } else {
        return expects(name, "two ints");
      }
    }
  };
}

function builtin_hsl(args) {
  if (args instanceof $Empty) {
    return expects("hsl", "three ints");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      return expects("hsl", "three ints");
    } else {
      let $1 = $.tail;
      if ($1 instanceof $Empty) {
        return expects("hsl", "three ints");
      } else if ($1.tail instanceof $Empty) {
        let $2 = args.head;
        if ($2 instanceof VInt) {
          let $3 = $.head;
          if ($3 instanceof VInt) {
            let $4 = $1.head;
            if ($4 instanceof VInt) {
              let h = $2[0];
              let s = $3[0];
              let l = $4[0];
              return new Ok(hsl($int.to_float(h), s, l));
            } else {
              return expects("hsl", "three ints");
            }
          } else {
            return expects("hsl", "three ints");
          }
        } else {
          return expects("hsl", "three ints");
        }
      } else {
        return expects("hsl", "three ints");
      }
    }
  }
}

/**
 * The extension's built-in bindings, added to the global frame.
 */
export function builtins() {
  return toList([
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
      pen_setter(
        "pen_up",
        (t, _) => {
          return new Turtle(
            t.x,
            t.y,
            t.heading,
            false,
            t.color,
            t.width,
            t.speed,
            t.time,
            t.paths,
          );
        },
      ),
    ),
    builtin(
      "pen_down",
      1,
      pen_setter(
        "pen_down",
        (t, _) => {
          return new Turtle(
            t.x,
            t.y,
            t.heading,
            true,
            t.color,
            t.width,
            t.speed,
            t.time,
            t.paths,
          );
        },
      ),
    ),
    builtin("pen_color", 2, builtin_pen_color),
    builtin("pen_width", 2, builtin_pen_width),
    builtin("speed", 2, builtin_speed),
    builtin("turtle_paths", 1, builtin_turtle_paths),
  ]);
}
