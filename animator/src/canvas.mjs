// The canvas animation loop. The renderer is kept out of Lustre's virtual DOM:
// Gleam computes the full curve of every path once (whenever the code or
// `shape_slider` changes) and pushes it here via `setDrawing`. A single
// requestAnimationFrame loop owns the clock and, each frame, reveals a growing
// prefix of the precomputed points straight to the 2D context. So per frame
// there is no geometry work and no vdom diffing — just canvas strokes — which
// is what lets many paths animate at high frames per second.
//
// Values cross the Gleam/JS boundary directly — no JSON: a Gleam record arrives
// as an object with named fields, and a Gleam list is iterable.


let canvas = null;
let ctx = null;
// { paths: [{ pts: Float64Array [x0,y0,...], thickness, color, start, end }] }
let drawing = null;
let rate = 1; // a multiple of normal speed; negative plays the drawing backward
let clock = 0; // the drawing's time, in tenths of a second, in [0, endClock]
let lastTs = 0;
let running = false;
let framesWithoutCanvas = 0;

const TENTHS_PER_SECOND = 10;
// How many frames (about 10 seconds' worth) to wait for the canvas to appear
// before reporting that it hasn't.
const MAX_FRAMES_WITHOUT_CANVAS = 600;

// Replace the drawing being animated. `pathList` is the List(RenderPath) built
// by render.gleam; each path's points are packed into a flat Float64Array so
// the per-frame draw loop touches only contiguous numbers.
export function setDrawing(pathList) {
  const paths = [];
  for (const p of pathList) {
    const flat = [];
    for (const q of p.points) flat.push(q.x, q.y);
    paths.push({
      pts: new Float64Array(flat),
      thickness: p.thickness,
      color: p.color,
      start: p.start,
      end: p.end,
    });
  }
  // Keep the current clock across drawing swaps: dragging the shape slider on an
  // already-finished drawing shows the new shape complete, rather than restarting.
  // `endClock` is the moment the last path finishes drawing, past which the frame
  // loop holds time still (see frame).
  drawing = { paths, endClock: drawingEndClock(paths) };
  if (!running) {
    running = true;
    lastTs = performance.now();
    requestAnimationFrame(frame);
  }
}

// The clock at which every path has fully drawn — the largest per-path finish
// time (u = 1). A path finishes at its `end` time, or right at `start` when it
// has no positive duration (end ≤ start, an instant path). An empty drawing
// has nothing to finish, so time runs on unbounded (Infinity).
function drawingEndClock(paths) {
  let end = Infinity;
  for (const p of paths) {
    const finish = Math.max(p.start, p.end);
    end = end === Infinity ? finish : Math.max(end, finish);
  }
  return end;
}

export function setSpeed(r) {
  rate = r;
}

// Jump the animation back to the start (empty canvas).
export function resetClock() {
  clock = 0;
}

function frame(ts) {
  // Cap dt so a backgrounded/paused tab can't jump the clock far ahead.
  const dt = Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;
  // The clock runs forward, each path drawing in over its window and then
  // staying; there is no loop back to an empty canvas. It is bounded at both
  // ends: reverse rewinds only as far as the start (0), and forward stops the
  // instant the last path has fully drawn (endClock), so time never runs on past
  // a finished drawing.
  clock += dt * rate * TENTHS_PER_SECOND;
  clock = clamp(clock, 0, drawing.endClock);
  render();
  requestAnimationFrame(frame);
}

// Match the backing store to the element's CSS size (× device pixel ratio) so
// the drawing stays crisp; only touched when the size actually changes.
function ensureSize() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
    canvas.width = w;
    canvas.height = h;
  }
}

// Find the page's canvas, which Lustre can add to the page after the first drawing
// arrives. Returns whether it is there.
function findCanvas() {
  const el = document.getElementById("animation-canvas");
  if (!el) {
    framesWithoutCanvas += 1;
    if (framesWithoutCanvas === MAX_FRAMES_WITHOUT_CANVAS) {
      console.error('The page has no <canvas id="animation-canvas"> element to draw on.');
    }
    return false;
  }
  if (el !== canvas) {
    canvas = el;
    ctx = canvas.getContext("2d");
  }
  return true;
}

function render() {
  if (!findCanvas()) return;
  ensureSize();
  const w = canvas.width;
  const h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  // Draw functions work in a 0..1000 world centred on the origin: scale it to
  // fill the canvas and translate (0, 0) to the middle, so positive coordinates
  // run toward the bottom-right corner.
  ctx.setTransform(w / 1000, 0, 0, h / 1000, w / 2, h / 2);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // The tips of the paths still being drawn, where a turtle walks.
  const tips = [];
  for (const p of drawing.paths) {
    // Each path is revealed by a parameter u ∈ [0, 1] that advances at a steady
    // rate. A path is complete once u reaches 1.
    const u = penU(p);
    // `u` clamps to 0 both before a path starts and at the very instant it
    // does, so it can't tell "not yet" from "just begun". Gate on the start
    // time instead, so a just-begun path is shown at rest at u = 0
    // rather than staying hidden until the clock advances.
    if (clock >= p.start) {
      const tip = drawUpToU(p, u);
      if (tip && u < 1 && tips.length < MAX_TURTLES) tips.push(tip);
    }
  }
  // Draw the turtles last, so they walk on top of every line.
  tips.forEach((tip, i) => drawTurtle(tip, i));
}

// How much of a path is revealed now: its parameter u ∈ [0, 1], advancing
// linearly from its start time to its end time — 0 before it starts, 1 once
// done. A path with no positive duration (end ≤ start) appears complete the
// moment it starts.
function penU(p) {
  const duration = p.end - p.start;
  if (duration <= 0) return clock >= p.start ? 1 : 0;
  const u = (clock - p.start) / duration;
  return u < 0 ? 0 : u > 1 ? 1 : u;
}

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

// Stroke the first `u` fraction of a path's polyline, interpolating the final
// partial segment so the curve reveals smoothly rather than a vertex at a time.
// Returns where the pen is and which way it is heading, as { x, y, angle }, or
// null for a path with no length.
function drawUpToU(p, u) {
  const pts = p.pts;
  const count = pts.length / 2;
  if (count < 2) return null;
  const segs = count - 1;
  const f = u * segs;
  const k = Math.min(segs, Math.floor(f));
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 1; i <= k; i++) ctx.lineTo(pts[2 * i], pts[2 * i + 1]);
  const frac = f - k;
  let tip = null;
  if (k < segs) {
    const ax = pts[2 * k];
    const ay = pts[2 * k + 1];
    const bx = pts[2 * k + 2];
    const by = pts[2 * k + 3];
    const x = ax + (bx - ax) * frac;
    const y = ay + (by - ay) * frac;
    if (frac > 0) ctx.lineTo(x, y);
    tip = { x, y, angle: Math.atan2(by - ay, bx - ax) };
  }
  ctx.lineWidth = p.thickness;
  ctx.strokeStyle = p.color;
  ctx.stroke();
  return tip;
}

// ── The drawing turtles ───────────────────────────────────────────────────────

// At most this many turtles walk at once, so a drawing with thousands of paths
// in progress stays fast.
const MAX_TURTLES = 300;
// A turtle's length from tail to nose, in world units (the canvas is 1000 wide).
const TURTLE_SIZE = 40;

// Draw a little turtle at a path's tip, facing the way the pen is moving, with
// legs that paddle as the clock runs (and hold still when it is paused). `i`
// staggers each turtle's stride so a crowd of them doesn't march in lockstep.
function drawTurtle(tip, i) {
  const stride = Math.sin(clock * 2.2 + i * 1.7);
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(tip.angle);
  // The shapes below are laid out for a turtle 30 units long, nose along +x.
  const k = TURTLE_SIZE / 30;
  ctx.scale(k, k);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#1d4220";

  // Legs: diagonal pairs swing together, the way a turtle walks.
  ctx.fillStyle = "#6fbf62";
  for (const [lx, ly, phase] of [
    [5, -8, 1], [5, 8, -1], [-6, -8, -1], [-6, 8, 1],
  ]) {
    ctx.beginPath();
    ctx.ellipse(lx + stride * phase * 2.2, ly, 3.6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Tail.
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.lineTo(-15 - stride, 0);
  ctx.lineTo(-10, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head, bobbing slightly with each step, and its eyes.
  const hx = 13.5 + Math.abs(stride) * 0.8;
  ctx.beginPath();
  ctx.ellipse(hx, 0, 4.6, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#111";
  for (const ey of [-1.8, 1.8]) {
    ctx.beginPath();
    ctx.arc(hx + 1.8, ey, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shell: a domed oval with a hexagon in the middle and plates around it.
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#3f8f3a";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = "#245a22";
  ctx.beginPath();
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI) / 3;
    const x = 4.2 * Math.cos(a);
    const y = 3.6 * Math.sin(a);
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#57a84d";
  ctx.fill();
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI) / 3;
    ctx.moveTo(4.2 * Math.cos(a), 3.6 * Math.sin(a));
    ctx.lineTo(10.4 * Math.cos(a), 8 * Math.sin(a));
  }
  ctx.stroke();
  ctx.restore();
}

