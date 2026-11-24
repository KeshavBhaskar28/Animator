//# sourceMappingURL=app.mjs.map
import * as $float from "../gleam_stdlib/gleam/float.mjs";
import * as $int from "../gleam_stdlib/gleam/int.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $option from "../gleam_stdlib/gleam/option.mjs";
import { Some, Option$None$const } from "../gleam_stdlib/gleam/option.mjs";
import * as $result from "../gleam_stdlib/gleam/result.mjs";
import * as $string from "../gleam_stdlib/gleam/string.mjs";
import * as $lustre from "../lustre/lustre.mjs";
import * as $attr from "../lustre/lustre/attribute.mjs";
import * as $effect from "../lustre/lustre/effect.mjs";
import * as $element from "../lustre/lustre/element.mjs";
import * as $html from "../lustre/lustre/element/html.mjs";
import * as $keyed from "../lustre/lustre/element/keyed.mjs";
import * as $event from "../lustre/lustre/event.mjs";
import * as $builtins from "./builtins.mjs";
import * as $data from "./data.mjs";
import * as $drawing from "./drawing.mjs";
import * as $editor from "./editor.mjs";
import * as $errors from "./errors.mjs";
import {
  Ok,
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  makeError,
  remainderInt,
} from "./gleam.mjs";
import * as $parser from "./parser.mjs";
import * as $render from "./render.mjs";
import * as $shape from "./shape.mjs";

const FILEPATH = "src\\app.gleam";

export class Model extends $CustomType {
  constructor(library, code_open, error, shape, speed, menu_version) {
    super();
    this.library = library;
    this.code_open = code_open;
    this.error = error;
    this.shape = shape;
    this.speed = speed;
    this.menu_version = menu_version;
  }
}
export const Model$Model = (library, code_open, error, shape, speed, menu_version) =>
  new Model(library, code_open, error, shape, speed, menu_version);
export const Model$isModel = (value) => value instanceof Model;
export const Model$Model$library = (value) => value.library;
export const Model$Model$0 = (value) => value.library;
export const Model$Model$code_open = (value) => value.code_open;
export const Model$Model$1 = (value) => value.code_open;
export const Model$Model$error = (value) => value.error;
export const Model$Model$2 = (value) => value.error;
export const Model$Model$shape = (value) => value.shape;
export const Model$Model$3 = (value) => value.shape;
export const Model$Model$speed = (value) => value.speed;
export const Model$Model$4 = (value) => value.speed;
export const Model$Model$menu_version = (value) => value.menu_version;
export const Model$Model$5 = (value) => value.menu_version;

export class SetCode extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetCode = ($0) => new SetCode($0);
export const Msg$isSetCode = (value) => value instanceof SetCode;
export const Msg$SetCode$0 = (value) => value[0];

export class ToggleCode extends $CustomType {}
export const Msg$ToggleCode$const = new ToggleCode();
export const Msg$ToggleCode = () => Msg$ToggleCode$const;
export const Msg$isToggleCode = (value) => value instanceof ToggleCode;

export class SetShape extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetShape = ($0) => new SetShape($0);
export const Msg$isSetShape = (value) => value instanceof SetShape;
export const Msg$SetShape$0 = (value) => value[0];

export class SetSpeed extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetSpeed = ($0) => new SetSpeed($0);
export const Msg$isSetSpeed = (value) => value instanceof SetSpeed;
export const Msg$SetSpeed$0 = (value) => value[0];

export class Restart extends $CustomType {}
export const Msg$Restart$const = new Restart();
export const Msg$Restart = () => Msg$Restart$const;
export const Msg$isRestart = (value) => value instanceof Restart;

export class SelectDrawing extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SelectDrawing = ($0) => new SelectDrawing($0);
export const Msg$isSelectDrawing = (value) => value instanceof SelectDrawing;
export const Msg$SelectDrawing$0 = (value) => value[0];

export class NameNewDrawing extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$NameNewDrawing = ($0) => new NameNewDrawing($0);
export const Msg$isNameNewDrawing = (value) => value instanceof NameNewDrawing;
export const Msg$NameNewDrawing$0 = (value) => value[0];

const palette = /* @__PURE__ */ listPrepend(
  "#f2c14e",
  listPrepend(
    "#4ecdc4",
    listPrepend(
      "#ff6b6b",
      listPrepend("#a78bfa", listPrepend("#7bd389", $List$Empty$const)),
    ),
  ),
);

/**
 * The code a new drawing starts with: a line whose length follows the shape
 * slider, so it is clear what the slider does.
 * 
 * @ignore
 */
const default_code = "fn draw(shape_slider: Int) -> List(Path) {\n  // shape_slider is the shape slider's value, from 0 to 100.\n  // Drag the slider to make this line longer or shorter.\n  [Path(Line(Point(-400, 0), Point(-400 + shape_slider * 8, 0)), 0, 10, 4)]\n}\n";

const shape_max = 100;

const shape_min = 0;

/**
 * Your app's public address, once you've deployed it in Problem 13, such as
 * "https://your-username.github.io/animator/".
 */
export const public_url = "";

/**
 * Set to True if you would like your app's URL included in the course gallery.
 */
export const include_app_in_gallery = false;

/**
 * A link to your video from Problem 14, which anyone with the link can watch.
 */
export const video_url = "";

/**
 * Set to True if you would like your video included in the course gallery.
 */
export const include_video_in_gallery = false;

function color_at(i) {
  let n = $list.length(palette);
  let _pipe = palette;
  let _pipe$1 = $list.drop(_pipe, remainderInt(i, n));
  let _pipe$2 = $list.first(_pipe$1);
  return $result.unwrap(_pipe$2, "#f2c14e");
}

function set_drawing(paths) {
  let render_paths = $list.index_map(
    paths,
    (path, i) => { return $render.render_path(path, color_at(i)); },
  );
  return $effect.from((_) => { return $render.set_drawing(render_paths); });
}

function run_source(shape_slider, source) {
  let $ = $parser.parse_program(source, $builtins.global_frame());
  if ($ instanceof Ok) {
    let program = $[0];
    let _pipe = $drawing.try_draw(shape_slider, program);
    return $result.map_error(_pipe, $errors.error_message);
  } else {
    return $;
  }
}

function run_current(model, opening) {
  let $ = run_source(model.shape, $data.current_source(model.library));
  if ($ instanceof Ok) {
    let paths = $[0];
    return [
      new Model(
        model.library,
        model.code_open,
        Option$None$const,
        model.shape,
        model.speed,
        model.menu_version,
      ),
      set_drawing(paths),
    ];
  } else {
    let msg = $[0];
    let _block;
    if (opening) {
      _block = set_drawing($List$Empty$const);
    } else {
      _block = $effect.none();
    }
    let draw = _block;
    return [
      new Model(
        model.library,
        model.code_open,
        new Some(msg),
        model.shape,
        model.speed,
        model.menu_version,
      ),
      draw,
    ];
  }
}

function open_current(model) {
  let $ = run_current(model, true);
  let model$1 = $[0];
  let draw = $[1];
  return [
    model$1,
    $effect.batch(
      listPrepend(
        $editor.mount(
          $data.current_source(model$1.library),
          (var0) => { return new SetCode(var0); },
        ),
        listPrepend(
          $effect.from((_) => { return $render.reset_clock(); }),
          listPrepend(draw, $List$Empty$const),
        ),
      ),
    ),
  ];
}

export function init(_) {
  let _pipe = new Model($data.load(), true, Option$None$const, 50, 1.0, 0);
  return open_current(_pipe);
}

function save(library) {
  return $effect.from((_) => { return $data.save(library); });
}

function parse_number(text) {
  let $ = $float.parse(text);
  if ($ instanceof Ok) {
    return $;
  } else {
    let _pipe = $int.parse(text);
    return $result.map(_pipe, $int.to_float);
  }
}

export function update(model, msg) {
  if (msg instanceof SetCode) {
    let text = msg[0];
    let library = $data.set_current_source(model.library, text);
    let $ = run_current(
      new Model(
        library,
        model.code_open,
        model.error,
        model.shape,
        model.speed,
        model.menu_version,
      ),
      false,
    );
    let model$1 = $[0];
    let draw = $[1];
    return [
      model$1,
      $effect.batch(
        listPrepend(save(library), listPrepend(draw, $List$Empty$const)),
      ),
    ];
  } else if (msg instanceof ToggleCode) {
    return [
      new Model(
        model.library,
        !model.code_open,
        model.error,
        model.shape,
        model.speed,
        model.menu_version,
      ),
      $effect.none(),
    ];
  } else if (msg instanceof SetShape) {
    let text = msg[0];
    let $ = $int.parse(text);
    if ($ instanceof Ok) {
      let shape = $[0];
      return run_current(
        new Model(
          model.library,
          model.code_open,
          model.error,
          $int.clamp(shape, shape_min, shape_max),
          model.speed,
          model.menu_version,
        ),
        false,
      );
    } else {
      return [model, $effect.none()];
    }
  } else if (msg instanceof SetSpeed) {
    let text = msg[0];
    let _block;
    let _pipe = parse_number(text);
    _block = $result.unwrap(_pipe, model.speed);
    let speed = _block;
    return [
      new Model(
        model.library,
        model.code_open,
        model.error,
        model.shape,
        speed,
        model.menu_version,
      ),
      $effect.from((_) => { return $render.set_speed(speed); }),
    ];
  } else if (msg instanceof Restart) {
    return [model, $effect.from((_) => { return $render.reset_clock(); })];
  } else if (msg instanceof SelectDrawing) {
    let $ = msg[0];
    if ($ === "") {
      return [
        model,
        $effect.from(
          (dispatch) => {
            return dispatch(new NameNewDrawing($data.prompt_drawing_name()));
          },
        ),
      ];
    } else {
      let name = $;
      let library = $data.open(model.library, name);
      let $1 = open_current(
        new Model(
          library,
          model.code_open,
          model.error,
          model.shape,
          model.speed,
          model.menu_version,
        ),
      );
      let model$1 = $1[0];
      let effects = $1[1];
      return [
        model$1,
        $effect.batch(
          listPrepend(save(library), listPrepend(effects, $List$Empty$const)),
        ),
      ];
    }
  } else {
    let name = msg[0];
    let $ = $string.trim(name);
    if ($ === "") {
      return [
        new Model(
          model.library,
          model.code_open,
          model.error,
          model.shape,
          model.speed,
          model.menu_version + 1,
        ),
        $effect.none(),
      ];
    } else {
      let name$1 = $;
      let library = $data.add(model.library, name$1, default_code);
      let $1 = open_current(
        new Model(
          library,
          model.code_open,
          model.error,
          model.shape,
          model.speed,
          model.menu_version,
        ),
      );
      let model$1 = $1[0];
      let effects = $1[1];
      return [
        model$1,
        $effect.batch(
          listPrepend(save(library), listPrepend(effects, $List$Empty$const)),
        ),
      ];
    }
  }
}

function uses_shape_slider(source) {
  return $list.length($string.split(source, "shape_slider")) > 2;
}

function view_shape_hint(model) {
  let $ = uses_shape_slider($data.current_source(model.library));
  if ($) {
    return $element.none();
  } else {
    return $html.span(
      listPrepend($attr.class$("control-hint"), $List$Empty$const),
      listPrepend(
        $html.text("This drawing doesn't use shape_slider."),
        $List$Empty$const,
      ),
    );
  }
}

function view_drawing_menu(model) {
  let options = $list.map(
    model.library.drawings,
    (drawing) => {
      let name = drawing[0];
      return $html.option(
        listPrepend(
          $attr.value(name),
          listPrepend(
            $attr.selected(name === model.library.current),
            $List$Empty$const,
          ),
        ),
        name,
      );
    },
  );
  let new_option = $html.option(
    listPrepend($attr.value(""), $List$Empty$const),
    "+ New drawing…",
  );
  let menu = $html.select(
    listPrepend(
      $attr.class$("drawing-select"),
      listPrepend(
        $attr.attribute("data-test-id", "drawing-select"),
        listPrepend(
          $attr.attribute("title", "Open a drawing"),
          listPrepend(
            $event.on_change((var0) => { return new SelectDrawing(var0); }),
            $List$Empty$const,
          ),
        ),
      ),
    ),
    $list.append(options, listPrepend(new_option, $List$Empty$const)),
  );
  return $keyed.div(
    listPrepend($attr.class$("control"), $List$Empty$const),
    listPrepend([$int.to_string(model.menu_version), menu], $List$Empty$const),
  );
}

function view_controls(model) {
  return $html.div(
    listPrepend($attr.class$("controls"), $List$Empty$const),
    listPrepend(
      view_drawing_menu(model),
      listPrepend(
        $html.label(
          listPrepend(
            $attr.class$("control"),
            listPrepend($attr.for$("shape-slider"), $List$Empty$const),
          ),
          listPrepend(
            $html.span(
              listPrepend(
                $attr.class$("control-label shape-label"),
                $List$Empty$const,
              ),
              listPrepend(
                $html.text("shape_slider = " + $int.to_string(model.shape)),
                $List$Empty$const,
              ),
            ),
            listPrepend(
              $html.input(
                listPrepend(
                  $attr.type_("range"),
                  listPrepend(
                    $attr.id("shape-slider"),
                    listPrepend(
                      $attr.attribute("data-test-id", "shape-slider"),
                      listPrepend(
                        $attr.min($int.to_string(shape_min)),
                        listPrepend(
                          $attr.max($int.to_string(shape_max)),
                          listPrepend(
                            $attr.step("1"),
                            listPrepend(
                              $attr.value($int.to_string(model.shape)),
                              listPrepend(
                                $event.on_input(
                                  (var0) => { return new SetShape(var0); },
                                ),
                                $List$Empty$const,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              listPrepend(view_shape_hint(model), $List$Empty$const),
            ),
          ),
        ),
        listPrepend(
          $html.label(
            listPrepend(
              $attr.class$("control"),
              listPrepend($attr.for$("speed-slider"), $List$Empty$const),
            ),
            listPrepend(
              $html.span(
                listPrepend($attr.class$("control-label"), $List$Empty$const),
                listPrepend(
                  $html.text(("Speed " + $float.to_string(model.speed)) + "×"),
                  $List$Empty$const,
                ),
              ),
              listPrepend(
                $html.input(
                  listPrepend(
                    $attr.type_("range"),
                    listPrepend(
                      $attr.id("speed-slider"),
                      listPrepend(
                        $attr.attribute("data-test-id", "speed-slider"),
                        listPrepend(
                          $attr.min("-3"),
                          listPrepend(
                            $attr.max("3"),
                            listPrepend(
                              $attr.step("0.1"),
                              listPrepend(
                                $attr.value($float.to_string(model.speed)),
                                listPrepend(
                                  $event.on_input(
                                    (var0) => { return new SetSpeed(var0); },
                                  ),
                                  $List$Empty$const,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                $List$Empty$const,
              ),
            ),
          ),
          listPrepend(
            $html.button(
              listPrepend(
                $attr.class$("icon-btn control-btn"),
                listPrepend(
                  $attr.attribute("title", "Play the drawing from the start"),
                  listPrepend(
                    $event.on_click(Msg$Restart$const),
                    $List$Empty$const,
                  ),
                ),
              ),
              listPrepend($html.text("↺ Restart"), $List$Empty$const),
            ),
            $List$Empty$const,
          ),
        ),
      ),
    ),
  );
}

function view_error(error) {
  if (error instanceof Some) {
    let msg = error[0];
    return $html.pre(
      listPrepend($attr.class$("error-banner"), $List$Empty$const),
      listPrepend($html.text(msg), $List$Empty$const),
    );
  } else {
    return $element.none();
  }
}

function view_reveal_code(model) {
  let $ = model.code_open;
  if ($) {
    return $element.none();
  } else {
    return $html.button(
      listPrepend(
        $attr.class$("icon-btn reveal-code"),
        listPrepend(
          $attr.attribute("title", "Show code"),
          listPrepend($event.on_click(Msg$ToggleCode$const), $List$Empty$const),
        ),
      ),
      listPrepend($html.text("⟩"), $List$Empty$const),
    );
  }
}

function view_anim(model) {
  return $html.div(
    listPrepend($attr.class$("canvas-area"), $List$Empty$const),
    listPrepend(
      view_reveal_code(model),
      listPrepend(
        $html.canvas(
          listPrepend(
            $attr.id("animation-canvas"),
            listPrepend($attr.class$("canvas"), $List$Empty$const),
          ),
        ),
        listPrepend(
          view_error(model.error),
          listPrepend(view_controls(model), $List$Empty$const),
        ),
      ),
    ),
  );
}

export function view(model) {
  let _block;
  let $ = model.code_open;
  if ($) {
    _block = "app";
  } else {
    _block = "app code-hidden";
  }
  let app_class = _block;
  return $html.div(
    listPrepend($attr.class$(app_class), $List$Empty$const),
    listPrepend(
      $html.div(
        listPrepend($attr.class$("code-col"), $List$Empty$const),
        listPrepend($editor.view_panel(Msg$ToggleCode$const), $List$Empty$const),
      ),
      listPrepend(view_anim(model), $List$Empty$const),
    ),
  );
}

export function main() {
  let app = $lustre.application(init, update, view);
  let $ = $lustre.start(app, "#app", undefined);
  if (!($ instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "app",
      390,
      "main",
      "Pattern match failed, no pattern matched the value.",
      {
        value: $,
        start: 13145,
        end: 13194,
        pattern_start: 13156,
        pattern_end: 13161
      }
    )
  }
  return undefined;
}
