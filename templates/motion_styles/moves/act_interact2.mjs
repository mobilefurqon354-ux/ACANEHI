// INTERACTION MOVES, PART 2 (V1.2, 2026-11-21). Same API and studio-motion rules as act_interact.mjs:
// notice -> anticipation -> snap -> overshoot -> settle -> DEAD STILL; props in a hand, on a gravity arc, or resting on something.
// point, open (door), knock, climbover (wall/fence), cards (seated at a table), shove, catch, duck (hide/cower),
// frisk (pat-down), unlock (key in a lock), salute, pull (lever/rope), highfive, escort (guard walks a prisoner).
// Preview: node render.mjs moves/act_interact2.mjs#knock out/knock.png --still 0.5,1.5,2.5
import { G, track, reachDrop, cycle } from '../rig.mjs';
import { st, still, arc, pair, cash, box, cup, table } from './act_interact.mjs';
const sin = Math.sin, PI = Math.PI, INK = '#2a1a1f', clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), shake = (t, a, f = 40) => a * sin(t * f);

// ---------- set pieces (world coords) ----------
const DX = 230, DW = 190, DT = 230;   // door hinge x (left edge), width, top
const door = (open = 0, knob = true) => { const w = DW * Math.cos(open * PI / 2.2), sk = 40 * sin(open * PI / 2.2);
  return `<rect x="${DX - 18}" y="${DT - 18}" width="${DW + 36}" height="${G - DT + 18}" fill="#3a2a24" stroke="${INK}" stroke-width="10"/><rect x="${DX}" y="${DT}" width="${DW}" height="${G - DT}" fill="#141016"/>` +
    `<path d="M${DX},${DT} L${DX + w},${DT - sk} L${DX + w},${G + sk * .3} L${DX},${G} Z" fill="#9b6a45" stroke="${INK}" stroke-width="10"/>` +
    (knob ? `<circle cx="${DX + w * .16}" cy="${600 - sk * .4}" r="13" fill="#e6c25a" stroke="${INK}" stroke-width="6"/><rect x="${DX + w * .14 - 8}" y="${640 - sk * .4}" width="16" height="26" rx="4" fill="#222" />` : '') +
    `<path d="M${DX + w * .55},${DT + 90} L${DX + w * .55},${DT + 300}" stroke="#7d5234" stroke-width="8" opacity="${open < .9 ? 1 : 0}"/>`; };
const KNOB = [DX + DW * .16, 600];
const WX = 150, WT = 560;              // wall centre x and top
const wall = () => `<rect x="${WX - 40}" y="${WT}" width="80" height="${G - WT}" fill="#b9b2a4" stroke="${INK}" stroke-width="11"/>` + [0, 1, 2, 3, 4].map(i => `<path d="M${WX - 40},${WT + 60 + i * 85} L${WX + 40},${WT + 60 + i * 85}" stroke="#8f887b" stroke-width="6"/>`).join('') + `<rect x="${WX - 52}" y="${WT - 14}" width="104" height="22" rx="6" fill="#d3ccbd" stroke="${INK}" stroke-width="9"/>`;
const crate = (x = 190, h = 330) => `<rect x="${x - 120}" y="${G - h}" width="240" height="${h}" rx="10" fill="#b77a3f" stroke="${INK}" stroke-width="12"/><path d="M${x - 110},${G - h + 14} L${x + 110},${G - 14} M${x - 110},${G - h / 2} L${x + 110},${G - h / 2}" stroke="#8a5a2c" stroke-width="11"/>`;
const stool = (x) => `<rect x="${x - 70}" y="822" width="140" height="22" rx="10" fill="#4b525c" stroke="${INK}" stroke-width="10"/><rect x="${x - 12}" y="844" width="24" height="${G - 844}" fill="#3a4049"/>`;
const card = (x, y, a = 0, face = true) => `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-22" y="-32" width="44" height="64" rx="6" fill="${face ? '#fff' : '#c44'}" stroke="${INK}" stroke-width="6"/>${face ? '<text x="0" y="10" text-anchor="middle" font-family="Arial Black" font-size="28" fill="#c22">A</text>' : ''}</g>`;
const keyS = (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><circle cx="-24" cy="0" r="16" fill="none" stroke="#e6c25a" stroke-width="9"/><path d="M-8,0 L34,0 M24,0 L24,12 M32,0 L32,10" stroke="#e6c25a" stroke-width="8" stroke-linecap="round"/></g>`;
const lever = (a) => `<rect x="190" y="${G - 220}" width="120" height="220" rx="10" fill="#5c6470" stroke="${INK}" stroke-width="11"/><g transform="translate(250,${G - 200}) rotate(${a})"><path d="M0,0 L0,-260" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="M0,0 L0,-260" stroke="#c9ced6" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="-270" r="30" fill="#d23b3b" stroke="${INK}" stroke-width="9"/></g>`;
const LEV = a => [250 + 270 * sin(a * PI / 180), G - 200 - 270 * Math.cos(a * PI / 180)];
const ball = (x, y, a = 0) => `<g transform="translate(${x},${y}) rotate(${a})"><circle r="32" fill="#f08a3c" stroke="${INK}" stroke-width="8"/><path d="M-32,0 Q0,-14 32,0 M0,-32 Q12,0 0,32" stroke="${INK}" stroke-width="5" fill="none"/></g>`;
const lines = (x, y, n = 3) => Array.from({ length: n }, (_, i) => `<path d="M${x + 20 * i},${y - 40 - 14 * i} l${16 + 6 * i},${-20}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`).join('');
const base = (o) => { const P = { view: 'side', dir: 1, x: 0, rot: 0, feet: [{ x: -40 }, { x: 40 }], hands: [null, null], head: 0, face: 'k:standard', ...o }; return P; };

// ================= POINT: points at something / someone =================
function pointThere(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.5, 0], [.6, -.15, 'io'], [.75, 1.06, 'out'], [.9, 1, 'io'], [2.6, 1], [3.0, 0, 'io']], t);
  return still(t, st(ch, base({ rot: -4 * u, hands: [null, u > .05 ? { f: .3 + .72 * u, d: .5 - .65 * u, bow: .08 } : null], head: -6 * u, face: t < .55 ? 'k:standard' : t < 2.8 ? 'k:open' : 'k:standard' }))); }
function pointYou(t0, ch) { const t = t0 % 6, j = t > .6 && t < 2.8 ? Math.max(0, sin((t - .6) * 16)) : 0, u = track([[0, 0], [.5, 1, 'out'], [3.0, 1], [3.3, 0, 'io']], t);
  return still(t, st(ch, base({ x: 18 * j, rot: 10 * u + 6 * j, hands: [{ f: .2, d: .7 }, u > .05 ? { f: .5 + .5 * u + .1 * j, d: .3 - .3 * u, bow: .08 } : null], head: 4 * j, face: t < 3.1 ? (j > .5 ? 'rage' : 'k:angry') : 'k:standard' }))); }
function pointNervous(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.8, .6, 'io'], [1.4, .6], [1.6, 0, 'in'], [2.4, 0], [2.9, .4, 'io'], [3.2, 0, 'in']], t);
  return still(t, st(ch, base({ rot: -3, hands: [{ f: .4, d: .35, bow: .7 }, u > .05 ? { f: .4 + .5 * u, d: .3 - .25 * u + shake(t, .02), bow: .2 } : { f: .35, d: .35, bow: .7 }], head: 6, face: 'awkward' }))); }
export const point = { title: 'POINT  ·  side', dur: 6, styles: [
  { key: 'A', name: 'There it is!', blurb: 'wind-up, snap point, holds, lowers', pose: pointThere },
  { key: 'B', name: 'YOU!', blurb: 'angry jabbing finger, leans in', pose: pointYou },
  { key: 'C', name: 'Nervous', blurb: 'half points, pulls it back, tries again', pose: pointNervous },
] };

// ================= OPEN: opens a door (knob) =================
const atDoor = (o) => base({ x: DX - 120, feet: [{ x: DX - 160 }, { x: DX - 90 }], ...o });
function openWalk(t0, ch) { const t = t0 % 6, op = track([[0, 0], [.6, 0], [.75, -.04, 'io'], [1.3, 1, 'io']], t), w = t > 1.5 ? clamp((t - 1.5) / 1.6) : 0;
  if (w > 0) { const c = cycle(t - 1.5, { T: .42, S: 120, x0: DX - 120 }); return { ...st(ch, base({ x: c.bx, feet: c.feet, face: 'k:happy' })), back: door(1), cam: DX }; }
  const k = [KNOB[0] + DW * .9 * op * .6, KNOB[1]]; return still(t, { ...st(ch, atDoor({ rot: 6 * op, hands: [null, { wx: k[0], wy: k[1], bow: .5 }], face: 'k:standard' })), back: door(op), cam: DX }); }
function openStuck(t0, ch) { const t = t0 % 6, y = t < 3.4 ? Math.max(0, sin(t * 7)) : 0, op = t < 3.4 ? .06 * y : track([[3.4, 0], [3.5, 1, 'out']], t), fall = t > 3.4 ? track([[3.4, 0], [3.7, 1, 'out']], t) : 0;
  const P = atDoor({ x: DX - 120 - 30 * y - 120 * fall, rot: -16 * y - 30 * fall, hands: fall ? [{ f: .6, d: -.4 }, { f: .7, d: -.5 }] : [{ wx: KNOB[0] - 30, wy: KNOB[1] + 10, bow: .5 }, { wx: KNOB[0], wy: KNOB[1], bow: .5 }], face: t < 3.4 ? 'strain' : 'jawdrop', feet: [{ x: DX - 170 - 120 * fall }, { x: DX - 80 - 120 * fall }] });
  return still(t, { ...st(ch, P), back: door(op), cam: DX }); }
function openPeek(t0, ch) { const t = t0 % 6, op = track([[0, 0], [.8, .18, 'io'], [3.6, .18], [4.0, 0, 'io']], t), lean = track([[0, 0], [1.0, 1, 'io'], [3.4, 1], [3.8, 0, 'io']], t);
  return still(t, { ...st(ch, atDoor({ rot: 14 * lean, x: DX - 120 + 30 * lean, hands: [null, { wx: KNOB[0] + 20 * op, wy: KNOB[1], bow: .5 }], head: 8 * lean, face: lean > .5 ? 'sus' : 'k:standard' })), back: door(op), cam: DX }); }
export const open = { title: 'OPEN A DOOR  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Open and go', blurb: 'turns the knob, swings it, walks through', pose: openWalk },
  { key: 'B', name: 'Stuck door', blurb: 'yank, yank, it gives, falls back', pose: openStuck },
  { key: 'C', name: 'Peek', blurb: 'opens a crack, leans in, peeks', pose: openPeek },
] };

// ================= KNOCK: knocks on a door =================
const knockHand = (k, hard = 0) => ({ wx: DX - 6 + 40 * (1 - k), wy: 470 + 20 * hard, bow: .6 });
function knockPolite(t0, ch) { const t = t0 % 6, ks = [.8, 1.05, 1.3], k = ks.reduce((m, a) => Math.max(m, t > a - .1 && t < a + .1 ? 1 - Math.abs(t - a) / .1 : 0), 0), up = track([[0, 0], [.5, 1, 'io'], [1.6, 1], [1.9, 0, 'io']], t);
  return still(t, { ...st(ch, atDoor({ x: DX - 150, feet: [{ x: DX - 190 }, { x: DX - 120 }], hands: [null, up > .05 ? knockHand(k) : null], face: t < 2 ? 'k:standard' : 'k:happy' })), back: door(0) + (k > .7 ? lines(DX + 20, 470) : ''), cam: DX }); }
function knockPound(t0, ch) { const t = t0 % 6, b = t > .4 && t < 3.6 ? Math.max(0, sin((t - .4) * 14)) : 0, sh = b > .9 ? 4 : 0;
  return { ...st(ch, atDoor({ x: DX - 150, rot: 10 * b, feet: [{ x: DX - 200 }, { x: DX - 110 }], hands: [{ wx: DX - 10 + 50 * (1 - b), wy: 520, bow: .6 }, { wx: DX - 6 + 50 * b, wy: 450, bow: .6 }], face: 'k:angry' })), back: `<g transform="translate(${sh},0)">${door(0)}</g>` + (b > .85 ? lines(DX + 20, 450, 4) : ''), cam: DX }; }
function knockSurprise(t0, ch) { const t = t0 % 6, k = t > .6 && t < 1.2 ? Math.max(0, sin((t - .6) * 16)) : 0, op = track([[0, 0], [1.6, 0], [1.75, 1, 'out']], t), jump = track([[1.6, 0], [1.75, 1, 'out'], [2.4, 1], [2.9, 0, 'io']], t);
  return still(t, { ...st(ch, atDoor({ x: DX - 150 - 90 * jump, y: -60 * jump * (t < 1.9 ? 1 : 0), rot: -12 * jump, feet: [{ x: DX - 190 - 90 * jump, lift: 60 * jump * (t < 1.9 ? 1 : 0) }, { x: DX - 120 - 90 * jump, lift: 60 * jump * (t < 1.9 ? 1 : 0) }], hands: jump > .1 ? [{ f: .6, d: -.3 }, { f: .7, d: -.4 }] : [null, t > .4 && t < 1.4 ? knockHand(k) : null], face: jump > .1 ? 'jawdrop' : 'k:standard' }), -80), back: door(op), cam: DX - 40 }); }
export const knock = { title: 'KNOCK  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Polite', blurb: 'three neat knocks, waits, smiles', pose: knockPolite },
  { key: 'B', name: 'Pounding', blurb: 'both fists, the door shakes', pose: knockPound },
  { key: 'C', name: 'Surprise', blurb: 'knocks, the door flies open, jumps back', pose: knockSurprise },
] };

// ================= CLIMBOVER: climbs over a wall / fence =================
// c: 0 run-up, 1 hands on top, 2 belly on top, 3 legs over, 4 dropped on the far side
function overPose(c, ch, o = {}) {
  const lift = c < 1 ? 0 : c < 2 ? (c - 1) * 130 : c < 3 ? 130 + 30 * (c - 2) : 160 * (4 - c);   // hips rise to the wall top, never above it
  const x = c < 1 ? WX - 220 + 120 * c : c < 3 ? WX - 100 + 100 * (c - 1) : WX + 100 + 60 * (c - 3);
  const P = base({ x, y: -lift, rot: c < 1 ? 0 : c < 3 ? 40 * Math.min(1, c - 1) : 40 * (4 - c), feet: [{ x: x - 40, lift: c > 1 ? lift + 60 * Math.min(1, c - 1) : 0 }, { x: x + 40, lift: c > 1 ? lift + 160 * Math.min(1, c - 1) * (c < 3.4 ? 1 : 0) : 0, knee: 1 }],
    hands: c >= .8 && c < 3.2 ? [{ wx: WX - 25, wy: WT - 10, bow: .5 }, { wx: WX + 25, wy: WT - 10, bow: .5 }] : [null, null], face: o.face || 'strain', head: o.head || 0, ...o.P });
  return P;
}
const overOut = (P, t) => still(t, { ...P, back: '', front: wall(), cam: WX });
function overVault(t0, ch) { const t = t0 % 6, c = track([[0, 0], [.5, 1, 'io'], [.8, 2, 'out'], [1.1, 3, 'io'], [1.4, 4, 'in'], [1.5, 4]], t), land = t > 1.4 && t < 1.7 ? 50 * sin((t - 1.4) * 10) : 0;
  const P = overPose(c, ch, { face: t < 1.5 ? 'k:smirk' : 'k:happy' }); P.y += land; return overOut(P, t); }
function overStruggle(t0, ch) { const t = t0 % 6, c = track([[0, 0], [.6, 1, 'io'], [2.6, 2, 'io'], [3.6, 3, 'io'], [4.2, 4, 'in']], t), fl = t > .9 && t < 2.6 ? sin(t * 14) : 0;
  const P = overPose(c, ch, { face: t < 4.2 ? 'strain' : 'tired' }); P.feet = P.feet.map((f, i) => ({ ...f, lift: f.lift + 40 * fl * (i ? 1 : -1) })); return overOut(P, t); }
function overStuck(t0, ch) { const t = t0 % 6, c = track([[0, 0], [.6, 1, 'io'], [1.4, 2.4, 'io'], [3.2, 2.4], [3.5, 4, 'in']], t), tee = t > 1.4 && t < 3.2 ? sin(t * 5) * 14 : 0;
  const P = overPose(c, ch, { face: t < 1.4 ? 'strain' : t < 3.2 ? 'awkward' : t < 4 ? 'jawdrop' : 'tired' }); P.rot += tee; if (t > 3.5) { P.rot = 70 * Math.exp(-(t - 3.5) * 3); P.y += 60; } return overOut(P, t); }
export const climbover = { title: 'CLIMB OVER A WALL  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Vault', blurb: 'hands on top, swings over, lands', pose: overVault },
  { key: 'B', name: 'Struggle', blurb: 'hangs, legs kick, slowly over', pose: overStruggle },
  { key: 'C', name: 'Stuck on top', blurb: 'teeters on the top, flops over', pose: overStuck },
] };

// ================= CARDS: seated at a table, playing cards =================
const SEAT = 822 - 640 + 8;
const seated = (x, dir, o) => base({ dir, x, y: SEAT, feet: [{ x: x + dir * 60, thigh: 6, mix: 1 }, { x: x + dir * 100, thigh: 2, mix: 1 }], ...o });
const cardsScene = (pile = 0) => stool(-230) + stool(230) + table(0, 650, 300) + card(-10, 640, 4) + card(14, 640, -6) + Array.from({ length: pile }, (_, i) => card(-30 + 18 * i, 636, -10 + 9 * i, false)).join('');
function cardsCalm(t0, ch) { const t = t0 % 6, play = (k, s) => track([[s, 0], [s + .3, 1, 'io'], [s + .5, 1], [s + .8, 0, 'io']], k);
  const a = play(t, .6), b = play(t, 2.4), poses = [seated(-230, 1, { hands: [{ f: .7, d: .5 }, { f: .7 + .3 * a, d: .5 - .1 * a }], held: [{ hand: 0, svg: (x, y) => card(x + 10, y - 20, 10, false) }], face: a > .5 ? 'k:smirk' : 'k:standard' }),
    seated(230, -1, { hands: [{ f: .7, d: .5 }, { f: .7 + .3 * b, d: .5 - .1 * b }], held: [{ hand: 0, svg: (x, y) => card(x - 10, y - 20, -10, false) }], face: t > 2.6 && t < 3.6 ? 'k:happy' : 'k:standard' })];
  return { poses: poses.map(P => still(t, P)), back: cardsScene(t > 3.2 ? 2 : t > .9 ? 1 : 0), cam: 0 }; }
function cardsWin(t0, ch) { const t = t0 % 6, slam = track([[0, 0], [1.4, 0], [1.6, 1, 'out'], [1.75, .2, 'in'], [2.0, .2]], t), cheer = track([[2.0, 0], [2.3, 1, 'out'], [3.6, 1], [4.0, 0, 'io']], t);
  const poses = [seated(-230, 1, { y: SEAT - 50 * cheer, rot: -8 * cheer, hands: cheer > .1 ? [{ f: .5, d: -.6 }, { f: .7, d: -.7 }] : [{ f: .7, d: .5 }, { f: .5 + .5 * slam, d: .6 - .5 * slam + .4 * (slam > .9 ? 0 : 0) }], face: cheer > .1 ? 'k:happy' : 'k:smirk' }),
    seated(230, -1, { rot: -6 * cheer, hands: [{ f: .7, d: .5 }, { f: .7, d: .5 }], face: t > 1.7 ? 'k:sad' : 'k:standard', head: t > 1.7 ? 8 : 0 })];
  return { poses: poses.map(P => still(t, P)), back: cardsScene(2) + (t > 1.6 ? card(-40, 636, 0) + card(-4, 636, 8) + card(30, 636, -8) : ''), cam: 0 }; }
function cardsCheat(t0, ch) { const t = t0 % 6, look = t > .8 && t < 2.6, slip = track([[1.0, 0], [1.4, 1, 'io'], [1.9, 1], [2.2, 0, 'io']], t), caught = t > 3.2;
  const poses = [seated(-230, 1, { hands: [{ f: .7, d: .5 }, { f: .2 + .3 * (1 - slip), d: .9 - .4 * (1 - slip), bow: .7 }], held: slip > .5 ? [{ hand: 1, svg: (x, y) => card(x, y, 30) }] : [], face: caught ? 'awkward' : 'sus', head: caught ? 6 : 0 }),
    seated(230, -1, { dir: look ? 1 : -1, hands: [{ f: .7, d: .5 }, caught ? { f: 1, d: .05, bow: .1 } : { f: .7, d: .5 }], face: caught ? 'k:angry' : 'k:standard', head: look ? -6 : 0 })];
  return { poses: poses.map(P => still(t, P)), back: cardsScene(1), cam: 0 }; }
export const cards = { title: 'PLAY CARDS  ·  two seated', dur: 6, styles: [
  { key: 'A', name: 'Calm game', blurb: 'each plays a card in turn', pose: cardsCalm },
  { key: 'B', name: 'Winner', blurb: 'slams the hand down, cheers; the other sulks', pose: cardsWin },
  { key: 'C', name: 'Cheater', blurb: 'slips a card from the sleeve, gets caught', pose: cardsCheat },
] };

// ================= SHOVE: one character shoves another =================
function shoveSeq(t, ch, o) { const hit = track([[0, 0], [o.t0, -.2, 'io'], [o.t0 + .12, 1, 'out'], [o.t0 + .5, 1], [o.t0 + .9, 0, 'io']], t), back = track([[0, 0], [o.t0 + .1, 0], [o.t0 + .35, 1, 'out']], t);
  const [A, B] = pair(ch, { rot: 14 * hit, x: -250 + 40 * clamp(hit), hands: o.hA(hit), face: o.fa }, { rot: -18 * back * Math.exp(-(t - o.t0 - .35) * 2 * (t > o.t0 + .35)), x: 250 + o.dist * back, face: back > .2 ? o.fb : 'k:standard' });
  B.feet = B.feet.map(f => ({ ...f, x: f.x + o.dist * back })); A.feet = A.feet.map(f => ({ ...f, x: f.x + 30 * clamp(hit) }));
  return { poses: [A, B].map(P => still(t, P)), cam: 60 }; }
const shoveHard = (t0, ch) => shoveSeq(t0 % 6, ch, { t0: .8, dist: 220, fa: 'k:angry', fb: 'jawdrop', hA: h => [{ f: .4 + .55 * clamp(h), d: .4 - .2 * clamp(h) }, { f: .45 + .55 * clamp(h), d: .35 - .2 * clamp(h) }] });
const shoveChest = (t0, ch) => shoveSeq(t0 % 6, ch, { t0: 1.0, dist: 90, fa: 'k:smirk', fb: 'k:angry', hA: () => [{ f: .1, d: .7 }, { f: .1, d: .7 }] });
const shovePoke = (t0, ch) => shoveSeq(t0 % 6, ch, { t0: 1.2, dist: 40, fa: 'k:smirk', fb: 'awkward', hA: h => [null, { f: .5 + .5 * clamp(h), d: .2, bow: .08 }] });
export const shove = { title: 'SHOVE  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'Hard shove', blurb: 'both hands, the other stumbles far back', pose: shoveHard },
  { key: 'B', name: 'Chest bump', blurb: 'chest out, bumps the other back a step', pose: shoveChest },
  { key: 'C', name: 'Finger poke', blurb: 'one poke, the other wobbles back', pose: shovePoke },
] };

// ================= CATCH: one throws, the other catches =================
function catchSeq(t, ch, o) { const thr = track([[0, 0], [.5, -1, 'io'], [.7, 1, 'out'], [1.0, .6, 'io'], [1.4, 0, 'io']], t), tf = .7, p0 = [-200, 430], v = [560, -820];
  const fly = t > tf && t < o.tc, [bx, by, ba] = fly ? arc(t, tf, p0, v, G - 32) : [0, 0, 0];
  const A = { hands: [null, { f: .5 + .45 * thr, d: .5 - .7 * Math.max(0, thr) + .2 * Math.max(0, -thr), bow: .4 }], held: t < tf ? [{ hand: 1, svg: (x, y) => ball(x + 20, y) }] : [], rot: 8 * thr, face: 'k:happy' };
  const B = o.B(t, fly, [bx, by]); return { poses: pair(ch, A, B).map(P => still(t, P)), back: fly ? ball(bx, by, ba * 3) : (o.extra ? o.extra(t) : ''), cam: 0 }; }
const catchClean = (t0, ch) => catchSeq(t0 % 6, ch, { tc: 1.25, B: (t, fly, b) => ({ hands: [t > .9 ? { wx: 150, wy: 440, bow: .5 } : null, t > .9 ? { wx: 170, wy: 420, bow: .5 } : null], held: t >= 1.25 ? [{ hand: 1, svg: (x, y) => ball(x - 14, y) }] : [], rot: t > 1.25 && t < 1.5 ? 6 : 0, face: t > 1.3 ? 'k:smirk' : 'k:standard' }) });
const catchFumble = (t0, ch) => { const t = t0 % 6; return catchSeq(t, ch, { tc: 3.2, B: (t, fly, b) => ({ x: 250 + 20 * sin(t * 9) * (t > 1 && t < 3.2), hands: t > .9 ? [{ wx: b[0] - 30 || 150, wy: (b[1] || 440) + 20, bow: .5 }, { wx: b[0] + 10 || 170, wy: (b[1] || 440) + 30, bow: .5 }] : [null, null], held: t >= 3.2 ? [{ hand: 1, svg: (x, y) => ball(x - 14, y) }] : [], face: t < 3.2 ? 'awkward' : 'k:happy' }),
  extra: () => '' }); };
function catchMiss(t0, ch) { const t = t0 % 6, r = catchSeq(t, ch, { tc: 1.32, B: (t) => ({ hands: [t > 1 && t < 1.6 ? { wx: 120, wy: 560, bow: .5 } : null, t > 1 && t < 1.6 ? { wx: 150, wy: 560, bow: .5 } : null], rot: t > 1.32 ? -14 * Math.exp(-(t - 1.32) * 3) : 0, face: t > 1.32 ? (t < 2.6 ? 'jawdrop' : 'k:angry') : 'k:standard', head: t > 1.32 && t < 1.6 ? -10 : 0 }) });
  if (t > 1.32) { const [x, y, a] = arc(t, 1.32, [250, 120], [260, -380], G - 32); r.back = ball(x, y, a) + (t < 1.7 ? lines(230, 110, 3) : ''); } return r; }
export const catchIt = { title: 'THROW AND CATCH  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'Clean catch', blurb: 'wind-up, arc, caught, smug', pose: catchClean },
  { key: 'B', name: 'Fumble', blurb: 'juggles it, almost drops it, got it', pose: catchFumble },
  { key: 'C', name: 'Bonk', blurb: 'misses, it bounces off the head', pose: catchMiss },
] };

// ================= DUCK: hides behind cover / cowers =================
function duckCover(t0, ch) { const t = t0 % 6, d = track([[0, 0], [.4, 0], [.55, 1.08, 'out'], [.7, 1, 'io'], [3.6, 1], [4.1, 0, 'io']], t);
  return still(t, { ...st(ch, base({ x: 0, y: 330 * d, rot: 14 * d, feet: [{ x: -50, thigh: 40 * d }, { x: 50, knee: 1 }], hands: d > .5 ? [{ f: .2, d: -.7, over: true, bow: .8 }, { f: .3, d: -.8, over: true, bow: .8 }] : [null, null], face: d > .3 ? 'terrified' : 'k:standard' })), front: crate(190), cam: 80 }); }
function duckCower(t0, ch) { const t = t0 % 6, d = track([[0, 0], [.3, 1, 'out'], [4.2, 1], [4.6, 0, 'io']], t), sh = t > .3 && t < 4.2 ? shake(t, 4, 50) : 0;
  return still(t, st(ch, base({ x: sh, y: 260 * d, rot: 22 * d, feet: [{ x: -55 }, { x: 55, knee: 1 }], hands: d > .4 ? [{ f: .1, d: -.75, over: true, bow: .9 }, { f: .15, d: -.8, over: true, bow: .9 }] : [null, null], head: sh, face: d > .3 ? 'terrified' : 'k:standard' }))); }
function duckPeek(t0, ch) { const t = t0 % 6, d = track([[0, 0], [.3, 1, 'out'], [1.4, 1], [1.8, .55, 'io'], [3.2, .55], [3.35, 1, 'in']], t), look = t > 1.8 && t < 3.2 ? (t < 2.5 ? -1 : 1) : 0;
  return still(t, { ...st(ch, base({ y: 330 * d, rot: 10 * d, feet: [{ x: -50 }, { x: 50, knee: 1 }], hands: d < .8 ? [{ wx: 90, wy: G - 330, bow: .6 }, { wx: 120, wy: G - 330, bow: .6 }] : [null, null], head: 8 * look, face: d < .8 ? 'sus' : 'terrified' })), front: crate(190), cam: 80 }); }
export const duck = { title: 'DUCK AND HIDE  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Behind cover', blurb: 'drops behind the crate, covers the head', pose: duckCover },
  { key: 'B', name: 'Cower', blurb: 'crouches and shakes, hands on the head', pose: duckCower },
  { key: 'C', name: 'Peek over', blurb: 'hides, rises, eyes over the top, ducks again', pose: duckPeek },
] };

// ================= FRISK: a guard pats someone down =================
function friskSeq(t, ch, o) { const pat = Math.max(0, sin(t * 12)), lvl = track([[0, 300], [1.2, 300], [2.4, 640, 'io'], [3.4, 760, 'io']], t);
  const G1 = { x: -230, rot: 26, y: 120 + (lvl - 300) * .3, hands: [{ wx: 70 - 20 * pat, wy: lvl, bow: .5 }, { wx: 95 - 20 * pat, wy: lvl + 40, bow: .5 }], face: o.fg(t), dir: 1 };
  const P2 = { view: 'front', hands: [{ lx: -300, ly: 330, bow: .2 }, { lx: 300, ly: 330, bow: .2 }], face: o.fp(t), dir: 1 };   // arms out to the sides, facing us
  const [A, B] = pair(ch, G1, P2, 200); A.x = -230; A.feet = [{ x: -290 }, { x: -190 }]; A.y = Math.max(A.y, reachDrop(ch, A)); B.x = 200; B.feet = [{ x: 160 }, { x: 240 }]; B.y = 0; return [A, B]; }
const friskRoutine = (t0, ch) => { const t = t0 % 6; return { poses: friskSeq(t, ch, { fg: () => 'k:standard', fp: () => 'tired' }).map(P => still(t, P)), cam: 0 }; };
function friskFind(t0, ch) { const t = t0 % 6, ps = friskSeq(Math.min(t, 2.6), ch, { fg: t => t < 2.6 ? 'k:standard' : 'k:smirk', fp: t => 'sus' });
  if (t > 2.6) { const u = track([[2.6, 0], [3.0, 1, 'out'], [3.2, .95, 'io']], t); ps[0].rot = 4; ps[0].y = 0; ps[0].hands = [null, { wx: -120, wy: 560 - 250 * u, bow: .4 }]; ps[0].held = [{ hand: 1, svg: (x, y) => cash(x + 10, y - 10, -15) }]; ps[1].face = 'awkward'; }
  return { poses: ps.map(P => still(t, P)), cam: 0 }; }
function friskTickle(t0, ch) { const t = t0 % 6, ps = friskSeq(t, ch, { fg: t => t < 2 ? 'k:standard' : 'k:angry', fp: t => t < 1.2 ? 'k:standard' : 'k:happy' }); if (t > 1.2) { ps[1].rot = 8 * sin(t * 18); ps[1].head = 6 * sin(t * 22); ps[1].hands = [{ lx: -130, ly: 560, bow: .8 }, { lx: 130, ly: 560, bow: .8 }]; } return { poses: ps, cam: 0 }; }
export const frisk = { title: 'FRISK  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'Routine', blurb: 'pats from chest to legs, bored prisoner', pose: friskRoutine },
  { key: 'B', name: 'Found it', blurb: 'pats, stops, pulls out the hidden cash', pose: friskFind },
  { key: 'C', name: 'Ticklish', blurb: 'the prisoner giggles and squirms', pose: friskTickle },
] };

// ================= UNLOCK: a key in a lock (door) =================
const LOCK = [DX + DW * .14, 653];
function unlockSeq(t, ch, o) { const turn = o.turn(t), op = o.open ? o.open(t) : 0;
  return still(t, { ...st(ch, atDoor({ rot: 10, hands: [null, { wx: LOCK[0] - 30, wy: LOCK[1], bow: .4 }], held: [{ hand: 1, svg: (x, y) => keyS(x + 34, y, turn) }], head: 8, face: o.face(t) })), back: door(op), cam: DX }); }
const unlockOk = (t0, ch) => { const t = t0 % 6; return unlockSeq(t, ch, { turn: t => track([[0, 0], [.8, 0], [1.1, 90, 'out'], [1.2, 85]], t), open: t => track([[1.4, 0], [2.2, .7, 'io']], t), face: t => t < 1.2 ? 'k:standard' : 'k:happy' }); };
const unlockWrong = (t0, ch) => { const t = t0 % 6; return unlockSeq(t, ch, { turn: t => t < 3.4 ? 18 * sin(t * 16) : 0, face: t => t < 3.4 ? 'strain' : 'k:angry' }); };
const unlockPick = (t0, ch) => { const t = t0 % 6; return unlockSeq(t, ch, { turn: t => t < 3 ? 8 * sin(t * 30) : track([[3, 0], [3.2, 90, 'out']], t), open: t => track([[3.4, 0], [4.0, .25, 'io']], t), face: t => t < 3.2 ? 'sus' : 'k:smirk' }); };
export const unlock = { title: 'UNLOCK  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Click', blurb: 'key in, turn, click, the door swings', pose: unlockOk },
  { key: 'B', name: 'Wrong key', blurb: 'jiggles and jiggles, gives up angry', pose: unlockWrong },
  { key: 'C', name: 'Lock pick', blurb: 'tiny fiddling, click, a sly crack open', pose: unlockPick },
] };

// ================= SALUTE =================
const saluteHand = (u, P = 0) => (u < .05 ? { f: 0, d: .9 } : { wx: P + 40 + 70 * u, wy: 600 - 480 * u, over: u > .6, bow: .9 });   // fingertips end at the brow
function saluteSharp(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.5, 0], [.62, 1.08, 'out'], [.75, 1, 'io'], [2.6, 1], [2.75, 0, 'in']], t), chest = track([[.4, 0], [.6, 1, 'out']], t);
  return still(t, st(ch, base({ rot: -5 * chest, feet: [{ x: -14 }, { x: 14 }], hands: [{ f: 0, d: .9 }, saluteHand(clamp(u, 0, 1.1))], head: -4 * chest, face: 'k:standard' }))); }
function saluteLazy(t0, ch) { const t = t0 % 6, u = track([[0, 0], [1.4, .7, 'io'], [2.8, .7], [3.6, 0, 'io']], t);
  return still(t, st(ch, base({ rot: 8, hands: [{ f: .1, d: .9 }, saluteHand(u)], head: 10, face: 'tired' }))); }
function saluteOverdo(t0, ch) { const t = t0 % 6, u = track([[0, 0], [.4, 0], [.5, 1.3, 'out'], [.6, 1, 'io']], t), hit = t > .5 && t < 1.2;
  return still(t, st(ch, base({ rot: hit ? 10 * Math.exp(-(t - .5) * 5) : -4, hands: [{ f: 0, d: .9 }, saluteHand(clamp(u, 0, 1.2))], head: hit ? 14 * sin((t - .5) * 20) * Math.exp(-(t - .5) * 4) : 0, face: hit ? 'jawdrop' : t > 1.2 ? 'awkward' : 'k:standard' }))); }
export const salute = { title: 'SALUTE  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Sharp', blurb: 'heels together, snap salute, holds, snaps down', pose: saluteSharp },
  { key: 'B', name: 'Lazy', blurb: 'half a salute, slouched', pose: saluteLazy },
  { key: 'C', name: 'Overdone', blurb: 'snaps so hard it bonks the head', pose: saluteOverdo },
] };

// ================= PULL: pulls a lever / rope =================
function pullLever(t0, ch, o) { const t = t0 % 6, a = o.a(t), h = LEV(a);
  const P = base({ x: 30, rot: o.rot(t, a), feet: [{ x: -20 }, { x: 70, knee: 1 }], hands: o.free && o.free(t) ? [{ f: .6, d: -.4 }, { f: .7, d: -.5 }] : [{ wx: h[0] - 20, wy: h[1] + 10, bow: .5 }, { wx: h[0] + 6, wy: h[1], bow: .5 }], face: o.face(t) });
  P.y = Math.max(reachDrop(ch, P), o.y ? o.y(t) : 0); return still(t, { ...P, back: lever(a) + (o.extra ? o.extra(t) : ''), cam: 140 }); }
const pullOk = (t0, ch) => pullLever(t0, ch, { a: t => track([[0, -10], [.6, -16, 'io'], [1.0, 40, 'out'], [1.15, 36, 'io']], t), rot: (t, a) => (a + 10) * .35, face: t => t < 1 ? 'strain' : 'k:happy' });
const pullHeavy = (t0, ch) => pullLever(t0, ch, { a: t => track([[0, -10], [3.0, 30, 'io'], [3.2, 40, 'in']], t) + (t < 3 ? shake(t, 1.5) : 0), rot: (t) => 30 + shake(t, 3, 30) * (t < 3), y: t => t < 3 ? 120 : 40, face: t => t < 3.2 ? 'strain' : 'tired' });
const pullBreak = (t0, ch) => { const t = t0 % 6; return pullLever(t0, ch, { a: t => track([[0, -10], [1.2, 6, 'io']], t), rot: t => t < 1.4 ? 24 : 24 - 60 * Math.min(1, (t - 1.4) * 3), y: t => t < 1.4 ? 80 : 80 + 260 * Math.min(1, (t - 1.4) * 3), free: t => t > 1.4, face: t => t < 1.4 ? 'strain' : 'jawdrop', extra: t => t > 1.4 ? `<g transform="translate(${-60},${G - 60}) rotate(-70)"><path d="M0,0 L0,-200" stroke="#c9ced6" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="-210" r="30" fill="#d23b3b" stroke="${INK}" stroke-width="9"/></g>` : '' }); };
export const pull = { title: 'PULL A LEVER  ·  side', dur: 6, styles: [
  { key: 'A', name: 'Yank', blurb: 'grips, leans back, snaps it down', pose: pullOk },
  { key: 'B', name: 'Too stiff', blurb: 'hangs on it, shaking, it finally gives', pose: pullHeavy },
  { key: 'C', name: 'Snaps off', blurb: 'the handle breaks, falls on the bottom', pose: pullBreak },
] };

// ================= HIGHFIVE: two characters celebrate =================
function fiveSeq(t, ch, o) { const u = track([[0, 0], [.5, 1, 'io'], [o.t0, 1.1, 'out'], [o.t0 + .15, 1, 'io'], [o.t0 + .9, 1], [o.t0 + 1.3, 0, 'io']], t), hit = t > o.t0 - .03 && t < o.t0 + .12;
  const hy = o.hy, gx = o.gx(t, u);
  const ps = pair(ch, { rot: -6 * u, hands: [null, u > .05 ? { wx: -gx, wy: hy, bow: .4 } : null], face: o.fa(t) }, { rot: -6 * u, hands: [null, u > .05 ? { wx: gx, wy: hy, bow: .4 } : null], face: o.fb(t) }, 230);
  return { poses: ps.map(P => still(t, P)), front: hit ? `<circle cx="0" cy="${hy}" r="${40 + 300 * (t - o.t0 + .03)}" fill="none" stroke="#fff3c4" stroke-width="10" opacity=".8"/>` : '', cam: 0 }; }
const fiveHigh = (t0, ch) => fiveSeq(t0 % 6, ch, { t0: .9, hy: 300, gx: (t, u) => 120 - 110 * clamp((t - .5) / .4), fa: () => 'k:happy', fb: () => 'k:happy' });
const fiveFist = (t0, ch) => fiveSeq(t0 % 6, ch, { t0: 1.0, hy: 520, gx: (t) => 120 - 108 * clamp((t - .5) / .5) + (t > 1.1 && t < 1.6 ? 40 * (t - 1.1) * 2 : 0), fa: () => 'k:smirk', fb: () => 'k:smirk' });
const fiveMiss = (t0, ch) => fiveSeq(t0 % 6, ch, { t0: 9, hy: 300, gx: (t) => 120 - 200 * clamp((t - .6) / .4), fa: t => t < 1.1 ? 'k:happy' : 'awkward', fb: t => t < 1.1 ? 'k:happy' : 'awkward' });
export const highfive = { title: 'HIGH FIVE  ·  two characters', dur: 6, styles: [
  { key: 'A', name: 'High five', blurb: 'wind-up, slap with a flash, both grin', pose: fiveHigh },
  { key: 'B', name: 'Fist bump', blurb: 'cool fist bump, hands explode apart', pose: fiveFist },
  { key: 'C', name: 'Miss', blurb: 'both swing, miss each other, awkward', pose: fiveMiss },
] };

// ================= ESCORT: a guard walks a prisoner, holding the arm =================
function escortSeq(t, ch, o) { const cP = cycle(t, { T: o.T, S: o.S, x0: 0 }), cG = cycle(t + o.T * .5, { T: o.T, S: o.S, x0: -470 });
  const pr = base({ x: cP.bx + o.drag(t), feet: cP.feet.map(f => ({ ...f, x: f.x + o.drag(t) })), rot: o.prot(t), hands: [{ f: -.2, d: .9 }, { f: -.25, d: .85 }], face: o.fp(t), head: o.phead ? o.phead(t) : 0 });
  const gd = base({ x: cG.bx, feet: cG.feet, rot: 14, hands: [null, { wx: pr.x - 150, wy: 560, bow: .4 }], face: o.fg(t) });
  pr.y = Math.max(reachDrop(ch, pr), 50 - 40 * sin(PI * cP.p) ** 2); gd.y = Math.max(reachDrop(ch, gd), 50 - 40 * sin(PI * cG.p) ** 2);
  return { poses: [gd, pr], cam: cP.bx - 60 }; }
const escortMarch = (t0, ch) => escortSeq(t0 % 6, ch, { T: .45, S: 110, drag: () => 0, prot: () => 6, fp: () => 'k:sad', phead: () => 8, fg: () => 'k:standard' });
const escortResist = (t0, ch) => escortSeq(t0 % 6, ch, { T: .7, S: 60, drag: t => 10 + 10 * sin(t * 6), prot: t => -12 + 4 * sin(t * 6), fp: () => 'strain', fg: () => 'k:angry' });
const escortProud = (t0, ch) => escortSeq(t0 % 6, ch, { T: .42, S: 130, drag: () => 30, prot: () => -6, fp: () => 'k:smirk', phead: t => -6 + 3 * sin(t * 7), fg: () => 'awkward' });
export const escort = { title: 'ESCORT  ·  guard and prisoner', dur: 6, styles: [
  { key: 'A', name: 'March', blurb: 'guard holds the arm, prisoner head down', pose: escortMarch },
  { key: 'B', name: 'Resists', blurb: 'prisoner leans back, dragged along', pose: escortResist },
  { key: 'C', name: 'Proud prisoner', blurb: 'prisoner struts ahead, guard keeps up', pose: escortProud },
] };
