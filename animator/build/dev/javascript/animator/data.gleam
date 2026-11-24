//// The library of saved drawings. A drawing is a name and the source of its draw
//// function.

import examples
import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/result

// ── localStorage (data_ffi.mjs) ───────────────────────────────────────────────

/// The string stored in localStorage under key, or an Error if there isn't one.
@external(javascript, "./data_ffi.mjs", "storageGet")
pub fn storage_get(key: String) -> Result(String, Nil)

/// Store value in localStorage under key, replacing anything already there. If that
/// isn't possible, this logs the reason to the browser console.
@external(javascript, "./data_ffi.mjs", "storageSet")
pub fn storage_set(key: String, value: String) -> Nil

// ── The new-drawing prompt (data_ffi.mjs) ─────────────────────────────────────

/// Prompt the user to name a new drawing; "" (empty string) means they
/// cancelled or left it blank.
@external(javascript, "./data_ffi.mjs", "promptDrawingName")
pub fn prompt_drawing_name() -> String

// ── The library ───────────────────────────────────────────────────────────────

/// Every saved drawing, as #(name, source) in menu order, and the name of the
/// one that is open.
pub type Library {
  Library(drawings: List(#(String, String)), current: String)
}

/// The single localStorage key that holds the whole library, as JSON.
const storage_key = "animator-library"

/// The library a browser with nothing saved starts with: the examples, with the
/// first one open.
pub fn default_library() -> Library {
  let current = case examples.all {
    [#(name, _), ..] -> name
    [] -> ""
  }
  Library(drawings: examples.all, current: current)
}

/// The library saved in localStorage, or the examples if there isn't a usable one.
pub fn load() -> Library {
  storage_get(storage_key)
  |> result.try(fn(text) {
    json.parse(text, library_decoder()) |> result.replace_error(Nil)
  })
  |> result.try(fn(library) {
    // An empty saved library would leave nothing to open.
    case library.drawings {
      [] -> Error(Nil)
      _ -> Ok(library)
    }
  })
  |> result.map(fn(library) {
    // If the open drawing is somehow missing, open the first one.
    case source_of(library, library.current) {
      Ok(_) -> library
      Error(_) -> {
        let assert [#(first, _), ..] = library.drawings
        Library(..library, current: first)
      }
    }
  })
  |> result.lazy_unwrap(default_library)
}

/// Write the whole library to localStorage. JSON escapes quotes, backslashes, line
/// breaks, and non-English letters, so every source comes back exactly.
pub fn save(library: Library) -> Nil {
  let drawing_json = fn(drawing: #(String, String)) {
    json.object([
      #("name", json.string(drawing.0)),
      #("source", json.string(drawing.1)),
    ])
  }
  json.object([
    #("current", json.string(library.current)),
    #("drawings", json.array(library.drawings, drawing_json)),
  ])
  |> json.to_string
  |> storage_set(storage_key, _)
}

fn library_decoder() -> decode.Decoder(Library) {
  let drawing = {
    use name <- decode.field("name", decode.string)
    use source <- decode.field("source", decode.string)
    decode.success(#(name, source))
  }
  use current <- decode.field("current", decode.string)
  use drawings <- decode.field("drawings", decode.list(drawing))
  decode.success(Library(drawings: drawings, current: current))
}

/// The source of the drawing called name.
pub fn source_of(library: Library, name: String) -> Result(String, Nil) {
  list.key_find(library.drawings, name)
}

/// The source of the open drawing ("" if it is missing).
pub fn current_source(library: Library) -> String {
  source_of(library, library.current) |> result.unwrap("")
}

/// Replace the open drawing's source.
pub fn set_current_source(library: Library, source: String) -> Library {
  Library(
    ..library,
    drawings: list.key_set(library.drawings, library.current, source),
  )
}

/// Open the drawing called name, if there is one.
pub fn open(library: Library, name: String) -> Library {
  case source_of(library, name) {
    Ok(_) -> Library(..library, current: name)
    Error(_) -> library
  }
}

/// Add a drawing called name with the given source and open it. If there is
/// already a drawing with that name, just open it.
pub fn add(library: Library, name: String, source: String) -> Library {
  case source_of(library, name) {
    Ok(_) -> Library(..library, current: name)
    Error(_) ->
      Library(
        drawings: list.append(library.drawings, [#(name, source)]),
        current: name,
      )
  }
}
