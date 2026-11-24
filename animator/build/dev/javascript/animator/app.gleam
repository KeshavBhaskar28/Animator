//// Animator -- an application for program-generated drawings.

import builtins
import data
import drawing
import editor
import errors
import gleam/float
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import lustre
import lustre/attribute as attr
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/element/keyed
import lustre/event
import parser
import render
import shape.{type Path}

/// Your app's public address, once you've deployed it in Problem 13, such as
/// "https://your-username.github.io/animator/".
pub const public_url = ""

/// Set to True if you would like your app's URL included in the course gallery.
pub const include_app_in_gallery = False

/// A link to your video from Problem 14, which anyone with the link can watch.
pub const video_url = ""

/// Set to True if you would like your video included in the course gallery.
pub const include_video_in_gallery = False

/// The code a new drawing starts with: a line whose length follows the shape
/// slider, so it is clear what the slider does.
const default_code =
  "fn draw(shape_slider: Int) -> List(Path) {
  // shape_slider is the shape slider's value, from 0 to 100.
  // Drag the slider to make this line longer or shorter.
  [Path(Line(Point(-400, 0), Point(-400 + shape_slider * 8, 0)), 0, 10, 4)]
}
"

// ── Model ──────────────────────────────────────────────────────────────────────

pub type Model {
  Model(
    // Every saved drawing, and which one is open in the editor.
    library: data.Library,
    // Whether the code editor is shown.
    code_open: Bool,
    // The error from running the open drawing, if it failed to parse or evaluate.
    error: Option(String),
    // The value passed to draw, in [shape_min, shape_max].
    shape: Int,
    // The animation speed, as a multiple of normal speed, in [-3, 3].
    speed: Float,
    // Bumped to rebuild the drawing menu, so that it shows the open drawing again
    // after the user cancels creating a new one.
    menu_version: Int,
  )
}

// Colors given to paths in turn.
const palette = ["#f2c14e", "#4ecdc4", "#ff6b6b", "#a78bfa", "#7bd389"]

const shape_min = 0

const shape_max = 100

pub type Msg {
  // The editor's code changed.
  SetCode(String)

  // Layout controls
  ToggleCode

  // Playback controls. Slider values arrive as the input's text.
  SetShape(String)
  SetSpeed(String)
  Restart

  // The drawing menu: an option's value is a drawing's name, or "" for "New".
  SelectDrawing(String)
  // The name typed into the new-drawing prompt ("" if cancelled).
  NameNewDrawing(String)
}

// ── Init ───────────────────────────────────────────────────────────────────────

pub fn init(_flags: Nil) -> #(Model, Effect(Msg)) {
  // Restore the saved library (or start with the examples) and reopen the
  // drawing that was open last time.
  Model(
    library: data.load(),
    code_open: True,
    error: None,
    shape: 50,
    speed: 1.0,
    menu_version: 0,
  )
  |> open_current
}

// Parse and evaluate a draw function at the given shape-slider value, returning
// the rendered paths on success, or a human-readable message on failure.
fn run_source(shape_slider: Int, source: String) -> Result(List(Path), String) {
  case parser.parse_program(source, builtins.global_frame()) {
    Error(msg) -> Error(msg)
    Ok(program) ->
      drawing.try_draw(shape_slider, program)
      // Convert Error(EvalError) to Error(String) with a useful error message.
      |> result.map_error(errors.error_message)
  }
}

// Run the open drawing and animate it. On an error, show the message, and either
// draw nothing (when the drawing was just opened) or keep the last good drawing
// on screen (while the user is editing or dragging the shape slider).
fn run_current(model: Model, opening: Bool) -> #(Model, Effect(Msg)) {
  case run_source(model.shape, data.current_source(model.library)) {
    Ok(paths) -> #(Model(..model, error: None), set_drawing(paths))
    Error(msg) -> {
      let draw = case opening {
        True -> set_drawing([])
        False -> effect.none()
      }
      #(Model(..model, error: Some(msg)), draw)
    }
  }
}

// Show the open drawing: put its code in the editor and animate it from the start.
fn open_current(model: Model) -> #(Model, Effect(Msg)) {
  let #(model, draw) = run_current(model, True)
  #(
    model,
    effect.batch([
      editor.mount(data.current_source(model.library), SetCode),
      effect.from(fn(_) { render.reset_clock() }),
      draw,
    ]),
  )
}

fn save(library: data.Library) -> Effect(Msg) {
  effect.from(fn(_) { data.save(library) })
}

// ── Update ─────────────────────────────────────────────────────────────────────

pub fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ToggleCode -> #(Model(..model, code_open: !model.code_open), effect.none())

    // After each keystroke in the editor, save the code and animate it, or report
    // the error. set_drawing runs on every successful edit, even when the drawing
    // is empty or unchanged. The code is saved even if it doesn't parse.
    SetCode(text) -> {
      let library = data.set_current_source(model.library, text)
      let #(model, draw) = run_current(Model(..model, library: library), False)
      #(model, effect.batch([save(library), draw]))
    }

    SetShape(text) ->
      case int.parse(text) {
        Ok(shape) ->
          run_current(
            Model(..model, shape: int.clamp(shape, shape_min, shape_max)),
            False,
          )
        Error(_) -> #(model, effect.none())
      }

    SetSpeed(text) -> {
      let speed = parse_number(text) |> result.unwrap(model.speed)
      #(
        Model(..model, speed: speed),
        effect.from(fn(_) { render.set_speed(speed) }),
      )
    }

    Restart -> #(model, effect.from(fn(_) { render.reset_clock() }))

    // "New drawing" asks for a name; any other option opens that drawing.
    SelectDrawing("") -> #(
      model,
      effect.from(fn(dispatch) {
        dispatch(NameNewDrawing(data.prompt_drawing_name()))
      }),
    )
    SelectDrawing(name) -> {
      let library = data.open(model.library, name)
      let #(model, effects) = open_current(Model(..model, library: library))
      #(model, effect.batch([save(library), effects]))
    }

    NameNewDrawing(name) ->
      case string.trim(name) {
        // Cancelled: rebuild the menu so it shows the open drawing again.
        "" -> #(
          Model(..model, menu_version: model.menu_version + 1),
          effect.none(),
        )
        name -> {
          let library = data.add(model.library, name, default_code)
          let #(model, effects) = open_current(Model(..model, library: library))
          #(model, effect.batch([save(library), effects]))
        }
      }
  }
}

// Convert paths to RenderPaths, cycling through the palette, and animate them.
fn set_drawing(paths: List(Path)) -> Effect(Msg) {
  let render_paths =
    list.index_map(paths, fn(path, i) { render.render_path(path, color_at(i)) })
  effect.from(fn(_) { render.set_drawing(render_paths) })
}

fn color_at(i: Int) -> String {
  let n = list.length(palette)
  palette
  |> list.drop(i % n)
  |> list.first
  |> result.unwrap("#f2c14e")
}

// A range input reports "1" or "-0.5"; float.parse rejects whole numbers.
fn parse_number(text: String) -> Result(Float, Nil) {
  case float.parse(text) {
    Ok(x) -> Ok(x)
    Error(_) -> int.parse(text) |> result.map(int.to_float)
  }
}

// ── View ──────────────────────────────────────────────────────────────────
//
// Two side-by-side panes: the code editor on the left and the animation on the
// right. The code column can be hidden to expand the right pane.

pub fn view(model: Model) -> Element(Msg) {
  let app_class = case model.code_open {
    True -> "app"
    False -> "app code-hidden"
  }
  // The code column still exists even when hidden (CSS collapses it) so the
  // mounted CodeMirror editor keeps its state across show/hide.
  html.div([attr.class(app_class)], [
    html.div([attr.class("code-col")], [
      editor.view_panel(ToggleCode),
    ]),
    view_anim(model),
  ])
}

fn view_anim(model: Model) -> Element(Msg) {
  html.div([attr.class("canvas-area")], [
    view_reveal_code(model),
    html.canvas([attr.id("animation-canvas"), attr.class("canvas")]),
    view_error(model.error),
    view_controls(model),
  ])
}

// The open drawing's error, overlaid on the top of the animation pane.
fn view_error(error: Option(String)) -> Element(Msg) {
  case error {
    None -> element.none()
    Some(msg) -> html.pre([attr.class("error-banner")], [html.text(msg)])
  }
}

// The drawing menu and playback controls along the bottom of the animation pane.
fn view_controls(model: Model) -> Element(Msg) {
  html.div([attr.class("controls")], [
    view_drawing_menu(model),
    html.label([attr.class("control"), attr.for("shape-slider")], [
      html.span([attr.class("control-label shape-label")], [
        html.text("shape_slider = " <> int.to_string(model.shape)),
      ]),
      html.input([
        attr.type_("range"),
        attr.id("shape-slider"),
        attr.attribute("data-test-id", "shape-slider"),
        attr.min(int.to_string(shape_min)),
        attr.max(int.to_string(shape_max)),
        attr.step("1"),
        attr.value(int.to_string(model.shape)),
        event.on_input(SetShape),
      ]),
      view_shape_hint(model),
    ]),
    html.label([attr.class("control"), attr.for("speed-slider")], [
      html.span([attr.class("control-label")], [
        html.text("Speed " <> float.to_string(model.speed) <> "×"),
      ]),
      html.input([
        attr.type_("range"),
        attr.id("speed-slider"),
        attr.attribute("data-test-id", "speed-slider"),
        attr.min("-3"),
        attr.max("3"),
        attr.step("0.1"),
        attr.value(float.to_string(model.speed)),
        event.on_input(SetSpeed),
      ]),
    ]),
    html.button(
      [
        attr.class("icon-btn control-btn"),
        attr.attribute("title", "Play the drawing from the start"),
        event.on_click(Restart),
      ],
      [html.text("↺ Restart")],
    ),
  ])
}

// A note beside the shape slider when the open drawing never uses shape_slider,
// so that dragging the slider doing nothing isn't a surprise.
fn view_shape_hint(model: Model) -> Element(Msg) {
  case uses_shape_slider(data.current_source(model.library)) {
    True -> element.none()
    False ->
      html.span([attr.class("control-hint")], [
        html.text("This drawing doesn't use shape_slider."),
      ])
  }
}

// Whether source mentions shape_slider anywhere besides draw's parameter list.
fn uses_shape_slider(source: String) -> Bool {
  list.length(string.split(source, "shape_slider")) > 2
}

// A <select> of every drawing, with the open one selected, then "New drawing".
// It is keyed by menu_version so that bumping it rebuilds the element.
fn view_drawing_menu(model: Model) -> Element(Msg) {
  let options =
    list.map(model.library.drawings, fn(drawing) {
      let #(name, _) = drawing
      html.option(
        [attr.value(name), attr.selected(name == model.library.current)],
        name,
      )
    })
  let new_option = html.option([attr.value("")], "+ New drawing…")
  let menu =
    html.select(
      [
        attr.class("drawing-select"),
        attr.attribute("data-test-id", "drawing-select"),
        attr.attribute("title", "Open a drawing"),
        event.on_change(SelectDrawing),
      ],
      list.append(options, [new_option]),
    )
  keyed.div([attr.class("control")], [
    #(int.to_string(model.menu_version), menu),
  ])
}

// The button that brings the code column back, overlaid on the top-left of the
// right pane. Nothing is rendered while the column is already showing (its own
// header holds the button that hides it).
fn view_reveal_code(model: Model) -> Element(Msg) {
  case model.code_open {
    True -> element.none()
    False ->
      html.button(
        [
          attr.class("icon-btn reveal-code"),
          attr.attribute("title", "Show code"),
          event.on_click(ToggleCode),
        ],
        [html.text("⟩")],
      )
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

pub fn main() -> Nil {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}
