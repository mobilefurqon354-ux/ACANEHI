// INTERACTION MOVES (V1.2, 2026-11-21): characters DO things to props and to each other, as in Rick's prison-tunnel clip
// (digs through the floor, climbs out of the hole, lifts the vault cover, stuffs cash in a bag, guards toss the cell apart,
// sets a box on the x-ray belt, hands things over, two people talking at a table).
// Every style is acted as a STUDIO MOTION sequence: notice -> anticipation (counter-move) -> snap action (~70 % in 5 f)
// -> overshoot -> settle 8-12 f -> DEAD STILL (blinks only). Props are drawn AT the hand (held) or in world coords on the
// floor/in the air (back/front layers), so nothing floats: a prop is either in a hand, flying on a gravity arc, or resting
// on a surface. Same API as every move file: pose(t, ch) -> pose (or { poses: [...] } for two characters).
// Preview: node render.mjs moves/act_interact.mjs#emerge out/emerge.mp4   (or --still 0.5,1.5,2.5 out/emerge.png)
import { G, track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, INK = '#2a1a1f', clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const st = (ch, P, floor = 0) => { P.y = Math.max(P.y ?? 0, floor, reachDrop(ch, P)); return P; };
const still = (t, P) => { const b = blinkAt(t); if (b && P.face === 'k:standard') P.blink = b; return P; };
// gravity arc for a thrown prop: from p0 at t0, initial velocity v (px/s), lands on floor y=fy and bounces once
function arc(t, t0, p0, v, fy) {
  const g = 3200, u = Math.max(0, t - t0); let x = p0[0] + v[0] * u, y = p0[1] + v[1] * u + .5 * g * u * u;
  const tl = (-v[1] + Math.sqrt(v[1] ** 2 + 2 * g * (fy - p0[1]))) / g;        // landing time
  if (u > tl) { const w = u - tl, vb = -.28 * (v[1] + g * tl); x = p0[0] + v[0] * (tl + .35 * w); y = fy + Math.min(0, vb * w + .5 * g * w * w); }
  return [x, y, u > tl ? 0 : Math.atan2(v[1] + g * u, v[0]) * 180 / PI];
}
// ---------- props (world coords, drawn with the kit's ink line) ----------
const disc = (r = 120, col = '#c9a347') => (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><ellipse rx="${r}" ry="${r * .26}" fill="${col}" stroke="${INK}" stroke-width="11"/><ellipse rx="${r * .62}" ry="${r * .15}" fill="none" stroke="#8a6a26" stroke-width="7"/></g>`;
const cash = (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-38" y="-22" width="76" height="44" rx="6" fill="#7cc46a" stroke="${INK}" stroke-width="8"/><rect x="-9" y="-22" width="18" height="44" fill="#f2e7c4" stroke="${INK}" stroke-width="5"/></g>`;
const bag = (fill = 0) => (x, y) => { const w = 120 + 40 * fill, h = 130 + 50 * fill; return `<g transform="translate(${x},${y})"><path d="M${-w / 2},0 Q${-w / 2 - 14},${-h * .7} ${-w * .22},${-h} L${w * .22},${-h} Q${w / 2 + 14},${-h * .7} ${w / 2},0 Z" fill="#c7a26a" stroke="${INK}" stroke-width="11"/><path d="M${-w * .22},${-h + 6} Q0,${-h - 24} ${w * .22},${-h + 6}" fill="none" stroke="${INK}" stroke-width="9"/><text x="0" y="${-h * .38}" text-anchor="middle" font-family="Arial Black" font-size="62" fill="#5a3d1c">$</text></g>`; };
const pillow = (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-95" y="-38" width="190" height="76" rx="34" fill="#e9eef5" stroke="${INK}" stroke-width="10"/><path d="M-60,-10 Q0,12 60,-10" stroke="#b9c3d1" stroke-width="7" fill="none"/></g>`;
const box = (col = '#d98e4f') => (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-70" y="-110" width="140" height="110" rx="8" fill="${col}" stroke="${INK}" stroke-width="10"/><path d="M-70,-62 L70,-62" stroke="#a8652f" stroke-width="8"/></g>`;
const cup = (x, y) => `<g transform="translate(${x},${y})"><path d="M-26,-62 L26,-62 L20,0 L-20,0 Z" fill="#f4f1ea" stroke="${INK}" stroke-width="8"/><path d="M26,-48 Q48,-40 24,-18" fill="none" stroke="${INK}" stroke-width="7"/></g>`;
const table = (x, top = 640, w = 380) => `<rect x="${x - w / 2}" y="${top}" width="${w}" height="26" rx="10" fill="#7d8796" stroke="${INK}" stroke-width="11"/><rect x="${x - 16}" y="${top + 26}" width="32" height="${G - top - 26}" fill="#5d6673" stroke="${INK}" stroke-width="9"/>`;
const shelf = (x, top = 560) => `<rect x="${x - 110}" y="${top}" width="220" height="${G - top}" fill="#6f7b55" stroke="${INK}" stroke-width="11"/><rect x="${x - 125}" y="${top - 16}" width="250" height="24" rx="8" fill="#8a9768" stroke="${INK}" stroke-width="10"/>`;
const belt = (x0, x1, top = 600, t = 0) => { let s = `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="34" rx="16" fill="#4a4f59" stroke="${INK}" stroke-width="11"/>`; for (let k = 0; k < (x1 - x0) / 60; k++) { const xx = x0 + ((k * 60 + t * 120) % (x1 - x0)); s += `<path d="M${xx},${top + 6} L${xx},${top + 28}" stroke="#7d8490" stroke-width="6"/>`; } return s + `<rect x="${(x0 + x1) / 2 - 20}" y="${top + 34}" width="40" height="${G - top - 34}" fill="#3a3e46"/>`; };

// ================= EMERGE: climbs up out of a hole in the floor (side view) =================
const HX = 60, HW = 190;   // hole centre and half width (world)
const holeBack = `<ellipse cx="${HX}" cy="${G + 4}" rx="${HW}" ry="46" fill="#1d130d" stroke="${INK}" stroke-width="10"/>`;
const holeFront = `<path d="M${HX - HW},${G + 4} A${HW},46 0 0 0 ${HX + HW},${G + 4} L${HX + HW},${G + 700} L${HX - HW},${G + 700} Z" fill="#1d130d"/><path d="M${HX - HW},${G + 4} A${HW},46 0 0 0 ${HX + HW},${G + 4}" fill="none" stroke="#6b4a2e" stroke-width="22"/><path d="M${HX - HW},${G + 4} A${HW},46 0 0 0 ${HX + HW},${G + 4}" fill="none" stroke="${INK}" stroke-width="8"/>` +
  [[-HW - 40, 6], [HW + 30, 10], [-HW - 90, 14], [HW + 85, 4]].map(([dx, s]) => `<circle cx="${HX + dx}" cy="${G + 18}" r="${s + 8}" fill="#8b6a48" stroke="${INK}" stroke-width="6"/>`).join('');
// h = how far up (0 = hidden in the hole, 1 = hands on the rim, 2 = chest over the rim, 3 = knee on the rim, 4 = standing)
function emergePose(h, ch, o = {}) {
  const sink = h < 1 ? 980 - 120 * h : h < 2 ? 860 - 480 * (h - 1) : h < 3 ? 380 - 300 * (h - 2) : 80 * (4 - h);
  const grip = h >= .7 && h < 3.4, onRim = h >= 2.6 && h < 3.6;
  const P = { view: 'side', dir: 1, x: HX - 30 + (HW + 110) * clamp((h - 2.6) / 1.4), rot: h < 2 ? 0 : h < 3 ? 22 * (h - 2) : 22 * (4 - h) * .9, y: sink,
    feet: h >= 3.6 ? [{ x: HX + HW + 40 }, { x: HX + HW + 110 }] : onRim ? [{ x: HX - 40, lift: -sink + 150 * (3.6 - h) }, { x: HX + HW + 20, lift: 0, knee: 1 }] : [{ x: HX - 60, lift: -sink }, { x: HX + 20, lift: -sink }],
    hands: grip ? [{ wx: HX - HW + 40, wy: G - 8, bow: .5 }, { wx: HX + HW - 30, wy: G - 8, bow: .5 }] : h < .7 ? [{ f: .2, d: -.9 + .4 * h, over: true }, { f: .3, d: -.9 + .4 * h, over: true }] : [null, null],
    head: o.head ?? 0, face: o.face ?? 'k:standard', back: holeBack, front: holeFront, cam: HX, ...o.P };
  return P;
}
const emergeOut = (P) => ({ ...P, back: holeBack, front: holeFront, cam: HX + .6 * Math.max(0, P.x - HX) });   // the camera follows the climber out
function emergeDetermined(t0, ch) {   // A: clean, strong climb; snap heave, knee, stand, settle, dead still
  const t = t0 % 6, h = track([[0, 0], [.5, 1, 'out'], [.8, .85, 'io'], [1.05, 2, 'out'], [1.6, 2.2, 'io'], [1.9, 3, 'out'], [2.5, 3.1, 'io'], [2.8, 4.08, 'out'], [3.05, 4, 'io']], t);
  const face = t < .9 ? 'k:standard' : t < 2.8 ? 'strain' : t < 3.4 ? 'k:smirk' : 'k:standard';
  return still(t, emergeOut(emergePose(h, ch, { face, head: t > 2.8 && t < 3.1 ? -6 : 0 })));
}
function emergeExhausted(t0, ch) {  // B: heaves, slips back down once, second try, flops out, pants then still
  const t = t0 % 6, h = track([[0, 0], [.5, 1, 'out'], [1.1, 1.9, 'io'], [1.35, 1.05, 'in'], [1.6, 1, 'io'], [2.2, 1.9, 'io'], [2.7, 2.6, 'io'], [3.3, 3, 'io'], [4.0, 4, 'io']], t);
  const face = t < 1.3 ? 'strain' : t < 1.7 ? 'awkward' : t < 4 ? 'strain' : t < 4.6 ? 'tired' : 'k:standard';
  const P = emergePose(h, ch, { face }); if (t > 4 && t < 4.6) P.rot = 6 * sin((t - 4) * 18) * (4.6 - t);
  return still(t, emergeOut(P));
}
function emergeSneaky(t0, ch) {     // C: only the eyes pop up, looks left, right, then climbs out fast and low
  const t = t0 % 6, h = track([[0, 0], [.4, 1.25, 'out'], [2.0, 1.25], [2.25, 2, 'out'], [2.7, 3, 'out'], [3.1, 3.9, 'out'], [3.3, 3.8, 'io']], t);
  const look = t > .6 && t < 2 ? (t < 1.2 ? -1 : t < 1.7 ? 1 : 0) : 0;
  const P = emergePose(h, ch, { face: t < 2 ? 'sus' : t < 3.3 ? 'k:smirk' : 'k:standard', head: 10 * look });
  if (look) P.dir = look < 0 ? -1 : 1;
  if (t > 3.1) P.rot = 12;                // stays low and sneaky when out
  return still(t, emergeOut(P));
}
export const emerge = { title: 'CLIMB OUT OF A HOLE  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Strong climb', blurb: 'heave, knee on the rim, stands, settles', pose: emergeDetermined },
  { key: 'B', name: 'Worn out', blurb: 'slips back once, second try, flops out', pose: emergeExhausted },
  { key: 'C', name: 'Sneaky peek', blurb: 'eyes over the rim, looks both ways, scurries out', pose: emergeSneaky },
] };

// ================= LIFT: lifts a heavy flat thing (vault cover, manhole lid, crate) off the floor =================
const LX = 190;
function liftPose(u, ch, o = {}) {   // u 0 = squat with hands on the object on the floor, 1 = object at chest height
  const hy = G - 40 - 380 * u, P = { view: 'side', dir: 1, x: 0, rot: 24 * (1 - u) - 4 * u, y: 230 * (1 - u) + (o.dy || 0), feet: [{ x: -55 }, { x: 55, knee: 1 }],
    hands: [{ wx: LX - 30, wy: hy, bow: .45 }, { wx: LX + 10, wy: hy + 6, bow: .45 }], held: [{ hand: 1, svg: (x, y) => disc(125)(x + 25, y + 10, o.tilt || 0) }], head: o.head || 0, face: o.face || 'strain' };
  return P;
}
function liftEasy(t0, ch) { const t = t0 % 6;   // A: notice, crouch (anticipation), snap up, overshoot, settle, proud still
  const u = track([[0, 0], [.5, -.05, 'io'], [.75, 1.08, 'out'], [.95, 1, 'io']], t), face = t < .5 ? 'k:standard' : t < .9 ? 'strain' : t < 1.6 ? 'k:happy' : 'k:standard';
  return still(t, { ...st(ch, liftPose(clamp(u, -0.1, 1.1), ch, { face })), cam: 80 }); }
function liftStrain(t0, ch) { const t = t0 % 6;  // B: too heavy: shakes, gets it half up, knees wobble, drops it back with a thud, glares at it
  const u = track([[0, 0], [1.4, .55, 'io'], [2.6, .62, 'io'], [2.75, 0, 'in'], [3.0, 0]], t), sh = t < 2.6 ? 5 * sin(t * 42) : 0;
  const P = liftPose(u, ch, { face: t < 2.7 ? 'strain' : t < 3.6 ? 'k:angry' : 'k:standard', tilt: sh });
  P.x = sh; if (t > 2.75 && t < 3.0) P.rot += 4 * sin((t - 2.75) * 60);
  if (t > 2.75) { P.hands = [null, null]; P.held = []; P.back = disc(125)(LX + 25, G - 18 - 14 * Math.max(0, sin((t - 2.75) * 25)) * (t < 3.0 ? 1 : 0)); P.rot = 8; P.y = 60; }
  return still(t, { ...st(ch, P), cam: 80 }); }
function liftShove(t0, ch) { const t = t0 % 6;   // C: lifts it to the chest, then shoves it aside: it rolls/flops on the floor
  const u = track([[0, 0], [.6, 1, 'out'], [1.4, 1], [1.55, .9, 'io']], t), thrown = t > 1.6;
  const P = liftPose(thrown ? .9 : u, ch, { face: t < 1.6 ? 'strain' : t < 2.2 ? 'k:smirk' : 'k:standard' });
  if (thrown) { const [x, y, a] = arc(t, 1.6, [LX + 25, G - 360], [520, -260], G - 16); P.hands = [{ f: .8, d: .1 }, { f: .95, d: .05 }]; P.held = []; P.back = disc(125)(x, y, t < 2.2 ? a * .3 : 0); P.rot = -4 + 6 * Math.exp(-(t - 1.6) * 6); }
  return still(t, { ...st(ch, P), cam: 160 }); }
export const lift = { title: 'LIFT A HEAVY THING  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Easy and proud', blurb: 'crouch, snap up, overshoot, settle', pose: liftEasy },
  { key: 'B', name: 'Far too heavy', blurb: 'shakes, half up, drops it with a thud', pose: liftStrain },
  { key: 'C', name: 'Lift and shove', blurb: 'up to the chest, then shoves it aside', pose: liftShove },
] };

// ================= GRAB: grabs things from a shelf/cart and stuffs them into a bag (robbery, packing) =================
const SH = 300, BG = -200;   // shelf x, bag x
function grabCycle(t, T, ch, o) {   // one grab: reach to shelf (anticipation lean back first), snatch, swing to the bag, drop
  const k = (t % T) / T, n = Math.floor(t / T), reach = track([[0, 0], [.12, -.15, 'io'], [.38, 1, 'out'], [.5, 1], [.85, -1, 'io'], [1, -1]], k);
  const toShelf = clamp(reach), toBag = clamp(-reach), carrying = k > .45 && k < .86;
  const hx = 40 + (SH - 80) * toShelf - (40 - BG - 60) * toBag, hy = 540 - 40 * toShelf + 170 * toBag;
  const P = { view: 'side', dir: toBag > .3 ? -1 : 1, x: 20 * toShelf - 20 * toBag, rot: 18 * toShelf + 20 * toBag, feet: [{ x: -40 }, { x: 40 }],
    hands: [{ f: .4, d: .4 }, { wx: hx, wy: hy, bow: .5 }], held: carrying ? [{ hand: 1, svg: (x, y) => cash(x, y, 20 * sin(k * 9)) }] : [], head: 0, face: o.face(k, n) };
  return { P, n, k };
}
function grabScene(t, n, k) { const f = Math.min(1, n * .18); let s = shelf(SH);
  for (let i = 0; i < Math.max(0, 5 - n); i++) s += cash(SH - 70 + (i % 3) * 60, 540 - Math.floor(i / 3) * 46);
  return { back: s, front: bag(f)(BG, G) + (k > .86 && k < .96 ? cash(BG, G - 150 - 140 * f + 90 * (k - .86) * 10) : '') }; }
function grabGreedy(t0, ch) { const t = t0 % 6, { P, n, k } = grabCycle(t, .62, ch, { face: () => 'k:happy' }); return { ...st(ch, P), ...grabScene(t, n, k), cam: 40 }; }
function grabSneaky(t0, ch) { const t = t0 % 6;   // looks over the shoulder between grabs
  if ((t % 2) > 1.4) { const P = { view: 'side', dir: -1, x: 0, rot: 6, feet: [{ x: -40 }, { x: 40 }], hands: [null, null], head: -8, face: 'sus' }; return { ...st(ch, P), ...grabScene(t, Math.floor(t / 2) + 1, 0), cam: 40 }; }
  const { P, k } = grabCycle(t % 2, 1.4, ch, { face: () => 'sus' }); return { ...st(ch, P), ...grabScene(t, Math.floor(t / 2), k), cam: 40 }; }
function grabStuffed(t0, ch) { const t = t0 % 6;   // stuffs it until it is huge, then tries to lift the bag and cannot
  if (t > 3.2) { const u = track([[3.2, 0], [3.6, 1, 'io'], [4.6, 1], [4.8, 0, 'in']], t), sh = 4 * sin(t * 40) * (t < 4.6 ? 1 : 0);
    const P = { view: 'side', dir: -1, x: BG + 150, rot: 22 + sh, feet: [{ x: BG + 100 }, { x: BG + 190, knee: 1 }], hands: [{ wx: BG + 30, wy: G - 250 - 20 * u, bow: .5 }, { wx: BG + 60, wy: G - 250 - 20 * u, bow: .5 }], head: sh, face: t < 4.8 ? 'strain' : 'k:standard', y: 120 };
    return still(t, { ...st(ch, P), back: shelf(SH), front: bag(1.2)(BG, G - 6 * u), cam: 0 }); }
  const { P, n, k } = grabCycle(t, .64, ch, { face: () => 'k:smirk' }); return { ...st(ch, P), ...grabScene(t, n + 1, k), cam: 40 }; }
export const grab = { title: 'GRAB AND STUFF THE BAG  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Greedy', blurb: 'fast grabs, swings each one into the bag', pose: grabGreedy },
  { key: 'B', name: 'Sneaky', blurb: 'grab, grab, checks over the shoulder', pose: grabSneaky },
  { key: 'C', name: 'Overstuffed', blurb: 'fills it, then cannot lift the bag', pose: grabStuffed },
] };

// ================= TOSS: searches a place and flings things over the shoulder (cell search, ransacking) =================
function tossPose(t, T, ch, face, item = pillow, cool = 0) {
  const k = (t % T) / T, n = Math.floor(t / T), wind = track([[0, 0], [.25, 1, 'io'], [.42, -1.1, 'out'], [.55, -1, 'io'], [1, 0, 'io']], k);
  const hold = k < .42, hx = 220 - 160 * clamp(-wind) + 40 * clamp(wind), hy = 700 - 120 * clamp(wind) - 260 * clamp(-wind);
  const P = { view: 'side', dir: 1, x: 0, rot: 26 * clamp(wind) - 14 * clamp(-wind), y: 90 * clamp(wind), feet: [{ x: -50 }, { x: 50, knee: 1 }],
    hands: [{ wx: hx - 30, wy: hy + 10, bow: .45 }, { wx: hx, wy: hy, bow: .45 }], held: hold ? [{ hand: 1, svg: (x, y) => item(x, y + 20, -10 * wind) }] : [], head: -5 * clamp(-wind), face };
  let fly = ''; for (let i = 0; i <= n; i++) { const t0 = i * T + .42 * T; if (t >= t0) { const [x, y, a] = arc(t, t0, [100, 380], [-700 - 90 * (i % 3), -650 + 80 * (i % 2)], G - 40); fly += item(x, y, a); } }
  return { P, fly };
}
function tossAngry(t0, ch) { const t = t0 % 6, { P, fly } = tossPose(t, .8, ch, 'k:angry'); return { ...st(ch, P), back: fly, front: table(260, 760, 260), cam: -40 }; }
function tossBored(t0, ch) { const t = t0 % 6, { P, fly } = tossPose(t, 1.6, ch, 'tired'); P.rot *= .5; return still(t, { ...st(ch, P), back: fly, front: table(260, 760, 260), cam: -40 }); }
function tossFinds(t0, ch) { const t = t0 % 6;   // tosses twice, the third time freezes: holds up what it found, eyes wide, then smug
  if (t < 2.4) { const { P, fly } = tossPose(t, 1.2, ch, 'k:angry'); return { ...st(ch, P), back: fly, front: table(260, 760, 260), cam: -40 }; }
  const u = track([[2.4, 0], [2.9, 1.1, 'out'], [3.1, 1, 'io']], t), { fly } = tossPose(2.39, 1.2, ch, '');
  const P = { view: 'side', dir: 1, x: 0, rot: -6 * u, feet: [{ x: -50 }, { x: 50 }], hands: [null, { wx: 160, wy: 620 - 380 * u, bow: .4 }], held: [{ hand: 1, svg: (x, y) => cash(x, y - 10, -10) }], head: -6 * u, face: t < 3.4 ? 'jawdrop' : 'k:smirk' };
  return still(t, { ...st(ch, P), back: fly, front: table(260, 760, 260), cam: -40 }); }
export const toss = { title: 'SEARCH AND TOSS  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Ransack', blurb: 'grabs and flings things over the shoulder', pose: tossAngry },
  { key: 'B', name: 'Bored search', blurb: 'one slow lazy flick at a time', pose: tossBored },
  { key: 'C', name: 'Found it', blurb: 'tosses, tosses, freezes, holds up the find', pose: tossFinds },
] };

// ================= PLACE: sets a thing down on a surface (x-ray belt, table, counter) =================
const BT = 600;
function placeSeq(t, ch, o) {   // carry in at chest -> lean, lower (slow in) -> release -> item settles -> step back -> still
  const u = track([[0, 0], [.4, 0], [1.0, 1, 'io'], [1.15, 1.03, 'out'], [1.3, 1, 'io']], t), rel = t > 1.35, back = track([[1.6, 0], [2.0, 1, 'io']], t);
  const ix = 230, iy = track([[0, 520], [1.0, BT, 'io']], t) + (rel ? -10 * Math.exp(-(t - 1.35) * 9) * Math.abs(sin((t - 1.35) * 30)) : 0);
  const slide = rel ? (o.slide ? (t - 1.35) * 120 : 0) : 0, item = o.item || box();
  const P = { view: 'side', dir: 1, x: -60 * back, rot: 14 * u * (1 - back), feet: [{ x: -40 - 60 * back }, { x: 40 - 60 * back }],
    hands: rel ? [{ f: .3 + .2 * (1 - back), d: .5 }, { f: .5 * (1 - back), d: .6 * back + .2 }] : [{ wx: ix - 70, wy: iy - 60, bow: .5 }, { wx: ix + 70, wy: iy - 60, bow: .5 }], head: 4 * u, face: o.face(t) };
  return { P, scene: belt(-80, 620, BT, o.slide ? t : 0) + item(ix + slide, iy) };
}
function placeNeat(t0, ch) { const t = t0 % 6, { P, scene } = placeSeq(t, ch, { face: t => t < 1.4 ? 'k:standard' : t < 2.2 ? 'k:happy' : 'k:standard', slide: true }); return still(t, { ...st(ch, P), front: scene, cam: 120 }); }
function placeNervous(t0, ch) { const t = t0 % 6, { P, scene } = placeSeq(t, ch, { face: () => 'awkward', slide: true, item: box('#e05a8a') });
  if (t > 2.1) { P.head = t < 2.6 ? -8 : t < 3.1 ? 8 : 0; P.dir = t > 2.1 && t < 2.6 ? -1 : 1; P.face = t < 3.2 ? 'sus' : 'k:standard'; }   // glances at the guard
  return still(t, { ...st(ch, P), front: scene, cam: 120 }); }
function placeSlam(t0, ch) { const t = t0 % 6;   // lifts it high, SLAMS it down, the belt shakes, dusts hands
  const { P, scene } = placeSeq(clamp(t * 1.6, 0, 6), ch, { face: () => t < 1.2 ? 'k:angry' : 'k:smirk' });
  if (t > .9 && t < 1.1) P.rot += 8; const sh = t > .85 && t < 1.2 ? 6 * sin(t * 80) : 0;
  if (t > 1.4 && t < 2.2) P.hands = [{ wx: 30 + 30 * sin(t * 30), wy: 560, bow: .6 }, { wx: 60 - 30 * sin(t * 30), wy: 560, bow: .6 }];
  return still(t, { ...st(ch, P), front: `<g transform="translate(0,${sh})">${scene}</g>`, cam: 120 }); }
export const place = { title: 'PUT IT DOWN  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Neat', blurb: 'lowers it slowly, lets go, it rides away', pose: placeNeat },
  { key: 'B', name: 'Nervous', blurb: 'puts it down, glances back at the guard', pose: placeNervous },
  { key: 'C', name: 'Slam', blurb: 'slams it down, belt shakes, dusts hands', pose: placeSlam },
] };

// ================= GIVE: one character hands a thing to another (two characters, the thing passes hand to hand) =================
const pair = (ch, A, B, gap = 250) => { const mk = (dir, x, o) => { const P = { view: 'side', dir, x, rot: 0, feet: [{ x: x - 22 }, { x: x + 22 }], hands: [null, null], head: 0, face: 'k:standard', ...o }; P.y = Math.max(reachDrop(ch, P), o.dy || 0); return P; }; return [mk(1, -gap, A), mk(-1, gap, B)]; };
const MID = 0, HY = 520;
function giveSeq(t, ch, o) {   // giver reaches out (offer), taker's hand meets it, hand-over frame, both pull back, taker looks at it
  const off = track([[0, 0], [o.t1, 1, 'out'], [o.t2, 1], [o.t2 + .3, 0, 'io']], t), tk = track([[0, 0], [o.t1 - .1, 0], [o.t1 + o.lag, 1, o.snap ? 'out' : 'io'], [o.t2 + .1, 1], [o.t2 + .45, .3, 'io']], t);
  const passed = t > o.t2, gx = -250 + (MID - 8 + 250) * off, tx = 250 - (250 - MID - 8) * tk;
  const A = { hands: [null, off > .02 ? { wx: gx, wy: HY + 80 * (1 - off), bow: .5 } : null], held: passed ? [] : [{ hand: 1, svg: (x, y) => o.item(x + 18, y + 6) }], face: o.fa(t), rot: 6 * off };
  const B = { hands: [null, tk > .02 ? { wx: tx, wy: HY + 60 * (1 - tk), bow: .5 } : null], held: passed ? [{ hand: 1, svg: (x, y) => o.item(x - 18, y + 6) }] : [], face: o.fb(t), rot: 6 * tk };
  return pair(ch, A, B);
}
function givePolite(t0, ch) { const t = t0 % 6; return { poses: giveSeq(t, ch, { t1: .7, t2: 1.6, lag: .35, item: (x, y) => cup(x, y + 30), fa: t => t < 1.8 ? 'k:happy' : 'k:standard', fb: t => t < .8 ? 'k:standard' : t < 2.4 ? 'k:happy' : 'k:standard' }).map(P => still(t, P)), cam: 0 }; }
function giveSnatch(t0, ch) { const t = t0 % 6, ps = giveSeq(t, ch, { t1: .9, t2: 1.0, lag: .08, snap: true, item: cash, fa: t => t < 1 ? 'k:happy' : t < 2.2 ? 'jawdrop' : 'k:angry', fb: t => t < 1 ? 'k:standard' : 'k:smirk' });
  if (t > 1 && t < 1.5) ps[0].rot = -10 * Math.exp(-(t - 1) * 6) * sin((t - 1) * 30);   // the giver is spun by the snatch
  return { poses: ps.map(P => still(t, P)), cam: 0 }; }
function giveTug(t0, ch) { const t = t0 % 6;   // neither lets go: tug of war, then the giver gives up and the taker stumbles back
  const tug = t > 1 && t < 3.4 ? 26 * sin(t * 9) : 0, ps = giveSeq(Math.min(t, 1.2), ch, { t1: .7, t2: 9, lag: .3, item: box('#c9a347'), fa: () => 'strain', fb: () => 'strain' });
  if (t > 1) { ps[0].hands[1].wx += tug; ps[1].hands[1] = { wx: MID + 8 + tug, wy: HY, bow: .5 }; ps[0].rot = 8 - tug * .3; ps[1].rot = 8 + tug * .3; }
  if (t > 3.4) { const b = track([[3.4, 0], [3.7, 1, 'out'], [3.9, .9, 'io']], t); ps[0].held = []; ps[0].hands = [null, null]; ps[0].face = 'tired'; ps[1].held = [{ hand: 1, svg: (x, y) => box('#c9a347')(x - 18, y + 50) }]; ps[1].x += 90 * b; ps[1].feet = ps[1].feet.map(f => ({ ...f, x: f.x + 90 * b })); ps[1].hands = [null, { wx: MID + 70 + 90 * b, wy: HY + 40, bow: .5 }]; ps[1].rot = -16 * b * (t < 4.2 ? 1 : .3); ps[1].face = t < 4.4 ? 'jawdrop' : 'k:smirk'; }
  return { poses: ps.map(P => still(t, P)), cam: 0 }; }
export const give = { title: 'HAND IT OVER  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'Polite', blurb: 'offers, the other takes it, both smile', pose: givePolite },
  { key: 'B', name: 'Snatch', blurb: 'the other snatches it, the giver spins', pose: giveSnatch },
  { key: 'C', name: 'Tug of war', blurb: 'neither lets go, then one stumbles back with it', pose: giveTug },
] };

// ================= TALK: two characters in a conversation (turn-taking: the speaker gestures, the listener reacts) =================
const mouth = t => (Math.floor(t * 8) % 2 ? 'k:open' : 'k:happy');
function talkSeq(t, ch, o) {
  const turn = Math.floor(t / o.T) % 2, k = (t % o.T) / o.T, g = sin(PI * clamp(k * 1.3)) * (k < .8 ? 1 : 0), nod = k > .2 && k < .8 ? 4 * Math.max(0, sin(k * 18)) : 0;
  const spk = (side) => ({ hands: [null, { f: .55 + .25 * g, d: .35 - .45 * g, bow: .6 }], rot: o.lean * g, face: k < .8 ? o.say(t, side) : 'k:standard', head: -3 * g });
  const lis = (side) => ({ hands: [null, null], head: nod, face: o.hear(k, side), rot: o.lean < 0 ? 4 : 0 });
  const [A, B] = pair(ch, turn ? lis(0) : spk(0), turn ? spk(1) : lis(1), o.gap);
  return [A, B];
}
function talkFriendly(t0, ch) { const t = t0 % 6; return { poses: talkSeq(t, ch, { T: 1.5, gap: 250, lean: 6, say: t => mouth(t), hear: k => k > .3 && k < .7 ? 'k:happy' : 'k:standard' }).map(P => still(t, P)), back: table(0, 690, 200) + cup(-60, 690) + cup(70, 690), cam: 0 }; }
function talkArgue(t0, ch) { const t = t0 % 6, ps = talkSeq(t, ch, { T: 1.0, gap: 215, lean: 14, say: () => (Math.floor(t * 10) % 2 ? 'rage' : 'k:angry'), hear: () => 'k:angry' });
  ps.forEach(P => { if (P.rot > 4) P.hands = [null, { f: .95, d: .05, bow: .1 }]; });   // the speaker points at the other
  return { poses: ps, cam: 0 }; }
function talkWhisper(t0, ch) { const t = t0 % 6;   // one leans in and whispers, the other's eyes go wide, then both look around
  const lean = track([[0, 0], [.6, 1, 'io'], [2.2, 1], [2.6, 0, 'io']], t), wow = t > 2.2 && t < 3.6;
  const ps = pair(ch, { rot: 14 * lean, hands: [null, { wx: 30 - 120 * (1 - lean), wy: 260 + 200 * (1 - lean), bow: .7 }], face: t < 2.3 ? 'sus' : 'k:smirk', head: 6 * lean },
    { face: wow ? 'jawdrop' : t > 3.6 && t < 4.6 ? 'sus' : 'k:standard', head: t > 3.6 && t < 4.6 ? -8 : 0, dir: t > 3.8 && t < 4.3 ? 1 : -1 }, 185);
  return { poses: ps.map(P => still(t, P)), cam: 0 }; }
export const talk = { title: 'TALK  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'Friendly chat', blurb: 'turn-taking, gestures, the listener smiles and nods', pose: talkFriendly },
  { key: 'B', name: 'Argument', blurb: 'lean in, point, faces go red', pose: talkArgue },
  { key: 'C', name: 'Secret', blurb: 'whispers in the ear, eyes go wide, both look around', pose: talkWhisper },
] };
export { st, still, arc, pair, cash, box, cup, table, pillow, bag, disc, mouth };   // shared with act_interact2.mjs
