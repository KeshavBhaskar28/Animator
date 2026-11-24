//# sourceMappingURL=data.mjs.map
import * as $json from "../gleam_json/gleam/json.mjs";
import * as $decode from "../gleam_stdlib/gleam/dynamic/decode.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $result from "../gleam_stdlib/gleam/result.mjs";
import {
  storageGet as storage_get,
  storageSet as storage_set,
  promptDrawingName as prompt_drawing_name,
} from "./data_ffi.mjs";
import * as $examples from "./examples.mjs";
import {
  Ok,
  Error,
  Empty as $Empty,
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  makeError,
} from "./gleam.mjs";

export { prompt_drawing_name, storage_get, storage_set };

const FILEPATH = "src\\data.gleam";

export class Library extends $CustomType {
  constructor(drawings, current) {
    super();
    this.drawings = drawings;
    this.current = current;
  }
}
export const Library$Library = (drawings, current) =>
  new Library(drawings, current);
export const Library$isLibrary = (value) => value instanceof Library;
export const Library$Library$drawings = (value) => value.drawings;
export const Library$Library$0 = (value) => value.drawings;
export const Library$Library$current = (value) => value.current;
export const Library$Library$1 = (value) => value.current;

/**
 * The single localStorage key that holds the whole library, as JSON.
 * 
 * @ignore
 */
const storage_key = "animator-library";

/**
 * The library a browser with nothing saved starts with: the examples, with the
 * first one open.
 */
export function default_library() {
  let _block;
  let $ = $examples.all;
  if ($ instanceof $Empty) {
    _block = "";
  } else {
    let name = $.head[0];
    _block = name;
  }
  let current = _block;
  return new Library($examples.all, current);
}

/**
 * The source of the drawing called name.
 */
export function source_of(library, name) {
  return $list.key_find(library.drawings, name);
}

function library_decoder() {
  let drawing = $decode.field(
    "name",
    $decode.string,
    (name) => {
      return $decode.field(
        "source",
        $decode.string,
        (source) => { return $decode.success([name, source]); },
      );
    },
  );
  return $decode.field(
    "current",
    $decode.string,
    (current) => {
      return $decode.field(
        "drawings",
        $decode.list(drawing),
        (drawings) => { return $decode.success(new Library(drawings, current)); },
      );
    },
  );
}

/**
 * The library saved in localStorage, or the examples if there isn't a usable one.
 */
export function load() {
  let _pipe = storage_get(storage_key);
  let _pipe$1 = $result.try$(
    _pipe,
    (text) => {
      let _pipe$1 = $json.parse(text, library_decoder());
      return $result.replace_error(_pipe$1, undefined);
    },
  );
  let _pipe$2 = $result.try$(
    _pipe$1,
    (library) => {
      let $ = library.drawings;
      if ($ instanceof $Empty) {
        return new Error(undefined);
      } else {
        return new Ok(library);
      }
    },
  );
  let _pipe$3 = $result.map(
    _pipe$2,
    (library) => {
      let $ = source_of(library, library.current);
      if ($ instanceof Ok) {
        return library;
      } else {
        let $1 = library.drawings;
        let first;
        if ($1 instanceof $Empty) {
          throw makeError(
            "let_assert",
            FILEPATH,
            "data",
            67,
            "load",
            "Pattern match failed, no pattern matched the value.",
            {
              value: $1,
              start: 2590,
              end: 2637,
              pattern_start: 2601,
              pattern_end: 2618
            }
          )
        } else {
          first = $1.head[0];
        }
        return new Library(library.drawings, first);
      }
    },
  );
  return $result.lazy_unwrap(_pipe$3, default_library);
}

/**
 * Write the whole library to localStorage. JSON escapes quotes, backslashes, line
 * breaks, and non-English letters, so every source comes back exactly.
 */
export function save(library) {
  let drawing_json = (drawing) => {
    return $json.object(
      listPrepend(
        ["name", $json.string(drawing[0])],
        listPrepend(["source", $json.string(drawing[1])], $List$Empty$const),
      ),
    );
  };
  let _pipe = $json.object(
    listPrepend(
      ["current", $json.string(library.current)],
      listPrepend(
        ["drawings", $json.array(library.drawings, drawing_json)],
        $List$Empty$const,
      ),
    ),
  );
  let _pipe$1 = $json.to_string(_pipe);
  return ((_capture) => { return storage_set(storage_key, _capture); })(_pipe$1);
}

/**
 * The source of the open drawing ("" if it is missing).
 */
export function current_source(library) {
  let _pipe = source_of(library, library.current);
  return $result.unwrap(_pipe, "");
}

/**
 * Replace the open drawing's source.
 */
export function set_current_source(library, source) {
  return new Library(
    $list.key_set(library.drawings, library.current, source),
    library.current,
  );
}

/**
 * Open the drawing called name, if there is one.
 */
export function open(library, name) {
  let $ = source_of(library, name);
  if ($ instanceof Ok) {
    return new Library(library.drawings, name);
  } else {
    return library;
  }
}

/**
 * Add a drawing called name with the given source and open it. If there is
 * already a drawing with that name, just open it.
 */
export function add(library, name, source) {
  let $ = source_of(library, name);
  if ($ instanceof Ok) {
    return new Library(library.drawings, name);
  } else {
    return new Library(
      $list.append(
        library.drawings,
        listPrepend([name, source], $List$Empty$const),
      ),
      name,
    );
  }
}
