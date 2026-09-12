const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, 'layout_studies.jsx'), 'utf8');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'layout_studies.json'), 'utf8'));
const roleLayers = {
  text: '04 Labels and dimensions', stroke: '05 Study strokes',
  fill: '07 Study fills', guide: '06 Construction guides', grid: '08 Coordinate grids - 2px',
};

function fixture() {
  const doc = {
    typename: 'Document', groupItems: [], saved: true, fullName: { fsName: '/fixture.ai' },
    saveCalls: [], saveAs(file) { this.saveCalls.push(file.fsName); this.fullName = file; this.saved = true; },
  };
  const layers = {};
  function layer(role) {
    return layers[role] ||= { typename: 'Layer', parent: doc, locked: true, name: roleLayers[role] || role };
  }
  function item(type, name, parent, bounds) {
    const obj = {
      typename: type, name, parent, locked: false, _b: bounds, pageItems: [],
      get layer() { let p = this.parent; while (p.typename !== 'Layer') p = p.parent; return p; },
      get geometricBounds() {
        if (this.closed && this.pathPoints) {
          return [Math.min(...this.pathPoints.map(p => p.anchor[0])), Math.max(...this.pathPoints.map(p => p.anchor[1])),
            Math.max(...this.pathPoints.map(p => p.anchor[0])), Math.min(...this.pathPoints.map(p => p.anchor[1]))];
        }
        return this._b.slice();
      },
      get visibleBounds() { return this.geometricBounds; },
      translate(dx, dy) {
        let p = this;
        while (p.typename !== 'Document') { assert.equal(p.locked, false, 'translation requires unlocked ancestors'); p = p.parent; }
        this._b = [this._b[0] + dx, this._b[1] + dy, this._b[2] + dx, this._b[3] + dy];
      },
    };
    return obj;
  }
  for (let n = 1; n <= 10; n++) {
    const sid = String(n).padStart(2, '0'), x = n % 2 ? 18 : 234, y = 378 - Math.floor((n - 1) / 2) * 140;
    for (const role of Object.keys(roleLayers)) {
      const group = item('GroupItem', `Geometry ${sid} - Test / ${role}`, layer(role), []);
      doc.groupItems.push(group);
      for (let k = 0; k < 5; k++) {
        const gx = x + k % 4 * 48, gy = y - Math.floor(k / 4) * 52;
        const bounds = role === 'text' ? [gx, gy + 3, gx + 38, gy - 40] : [gx, gy, gx + 24, gy - 24];
        const leaf = item('GroupItem', `${role}-icon-${sid}-${k}`, group, bounds);
        group.pageItems.push(leaf); doc.groupItems.push(leaf);
      }
      if (role === 'text') {
        const title = item('TextFrame', `title-${sid}`, group, [x - 6, y + 22, x + 30, y + 16]);
        title.contents = 'Test'; group.pageItems.push(title);
        const count = item('TextFrame', `count-${sid}`, group, [x + 100, y + 22, x + 120, y + 16]);
        count.contents = '99 icons'; group.pageItems.push(count);
      }
    }
  }
  const paper = item('GroupItem', 'Geometry - Construction studies / paper', layer('paper'), []);
  doc.groupItems.push(paper);
  const bg = item('PathItem', 'paper', paper, [-1, 428, 431, -446]);
  bg.closed = true;
  bg.pathPoints = [[-1, 428], [431, 428], [431, -446], [-1, -446]].map(a => ({ anchor: a.slice(), leftDirection: a.slice(), rightDirection: a.slice() }));
  paper.pageItems.push(bg);
  for (let col = 0; col < 2; col++) {
    const ids = settings.regularColumns[col].concat(settings.fillColumns[col]);
    for (let row = 0; row < ids.length; row++) {
      const x = 11 + col * 216, y = 389 - row * 120;
      const line = item('PathItem', `section-divider-${ids[row]}`, paper, [x, y, x + 192, y]);
      line.closed = false; line.pathPoints = [{ anchor: [x, y] }, { anchor: [x + 192, y] }]; paper.pageItems.push(line);
    }
  }
  const globalLine = item('PathItem', 'global-divider', paper, [11, 404, 419, 404]);
  globalLine.closed = false; globalLine.pathPoints = [{ anchor: [11, 404] }, { anchor: [419, 404] }]; paper.pageItems.push(globalLine);
  let output, redraws = 0;
  function File(filePath) { this.fsName = filePath; this.open = () => true; this.write = s => { output = s; }; this.close = () => {}; this.copy = () => true; }
  const ctx = vm.createContext({
    app: { documents: [doc], redraw() { redraws++; } }, File, IllustratorSaveOptions: function () {},
    config: { settings, source: '/fixture.ai', result: '/result', backup: '/backup', diskBackup: '/disk', apply: false, allowUnsaved: false },
  });
  const find = name => doc.groupItems.find(g => g.name === name) || paper.pageItems.find(g => g.name === name);
  function run(apply = false, allowUnsaved = false) {
    ctx.config.apply = apply; ctx.config.allowUnsaved = allowUnsaved;
    vm.runInContext(source, ctx); return JSON.parse(output);
  }
  function snapshot() { return doc.groupItems.map(g => [g.name, g._b.slice(), g.locked]); }
  return { doc, layers, paper, find, run, item, snapshot, globalLine, get redraws() { return redraws; } };
}

function assertUnchangedPlan(f) {
  const result = f.run(true);
  assert.equal(result.movedItems, 0); assert.equal(result.countLabels, 0);
  assert.equal(result.dividerMoves, 0); assert.equal(result.dividerNames, 0); assert.equal(result.backgroundChanged, false);
}

test('check is read-only; apply is idempotent, restores locks and redraws', () => {
  const f = fixture(), before = f.snapshot();
  assert(f.run().movedIcons > 0); assert.deepEqual(f.snapshot(), before); assert.equal(f.doc.saveCalls.length, 0);
  assert.equal(f.run(true).mode, 'apply'); assert(f.redraws > 0);
  assert(Object.values(f.layers).every(l => l.locked)); assertUnchangedPlan(f);
  assert.deepEqual(f.globalLine._b, [11, 404, 419, 404]);
});

test('removing the first icon column preserves divider anchors and heading x', () => {
  const f = fixture(); f.run(true);
  const heading = f.find('Geometry 01 - Test / text').pageItems.find(g => g.name === 'title-01'), oldX = heading._b[0];
  for (const role of Object.keys(roleLayers)) for (const k of [0, 4]) {
    const g = f.find(`${role}-icon-01-${k}`);
    g.parent.pageItems.splice(g.parent.pageItems.indexOf(g), 1); f.doc.groupItems.splice(f.doc.groupItems.indexOf(g), 1);
  }
  assert.equal(f.run(true).mode, 'apply');
  assert.equal(f.find('grid-icon-01-1').geometricBounds[0], 18);
  assert.equal(heading.geometricBounds[0], oldX); assert.equal(f.find('section-divider-01').geometricBounds[0], 11);
  assertUnchangedPlan(f);
});

for (const role of Object.keys(roleLayers)) test(`duplicate ${role} is rejected before backup`, () => {
  const f = fixture(), original = f.find(`${role}-icon-01-0`);
  const duplicate = f.item('GroupItem', original.name, original.parent, original._b.slice());
  original.parent.pageItems.push(duplicate); f.doc.groupItems.push(duplicate);
  assert.match(f.run(true).error, new RegExp(`Duplicate ${role}`)); assert.equal(f.doc.saveCalls.length, 0);
});

test('orphan role outside its section is rejected', () => {
  const f = fixture(), g = f.find('guide-icon-01-0');
  g.parent.pageItems.splice(g.parent.pageItems.indexOf(g), 1); g.parent = f.layers.guide;
  assert.match(f.run(true).error, /Orphan study role/); assert.equal(f.doc.saveCalls.length, 0);
});

test('tall first-row labels clear the divider and push subsequent rows down', () => {
  const f = fixture(), label = f.find('text-icon-01-0');
  label._b[1] += 40; label._b[3] -= 80;
  assert.equal(f.run(true).mode, 'apply');
  assert(label.visibleBounds[1] <= f.find('section-divider-01').geometricBounds[1] - settings.firstRowGap + 0.001);
  const next = f.find('text-icon-01-4'); assert(next.visibleBounds[1] <= label.visibleBounds[3] - settings.rowGap + 0.001);
  assertUnchangedPlan(f);
});

test('unsaved apply stops unless explicitly allowed, with live backup', () => {
  const f = fixture(); f.doc.saved = false;
  assert.match(f.run(true).error, /--allow-unsaved/); assert.equal(f.doc.saveCalls.length, 0);
  assert.equal(f.run(true, true).mode, 'apply'); assert.deepEqual(f.doc.saveCalls, ['/backup', '/fixture.ai']);
});

test('partial failure reverses only own moves and restores all layer locks', () => {
  const f = fixture(), before = f.snapshot(), target = f.find('grid-icon-03-0'), translate = target.translate;
  let once = true;
  target.translate = function (dx, dy) { if (once) { once = false; throw Error('injected move failure'); } translate.call(this, dx, dy); };
  const result = f.run(true); assert.match(result.error, /injected/); assert.equal(result.rollbackError, null);
  assert.deepEqual(f.snapshot(), before); assert(Object.values(f.layers).every(l => l.locked));
});

test('rollback failure still restores lock states and retains the backup', () => {
  const f = fixture(), moved = f.find('text-icon-03-0'), translate = moved.translate;
  let calls = 0;
  moved.translate = function (dx, dy) { if (++calls === 2) throw Error('injected rollback failure'); translate.call(this, dx, dy); };
  f.find('grid-icon-03-0').translate = function () { throw Error('injected move failure'); };
  const result = f.run(true);
  assert.match(result.rollbackError, /rollback failure/); assert.equal(result.backup, '/backup');
  assert(Object.values(f.layers).every(l => l.locked)); assert.deepEqual(f.doc.saveCalls, ['/backup']);
});

function addSymbolGrid(f, withFrame = true) {
  const grid = f.find('grid-icon-01-0'), bounds = grid._b.slice();
  const nested = f.item('GroupItem', 'symbol-holder', grid, bounds.slice());
  const symbol = f.item('SymbolItem', 'grid-symbol', nested, bounds.slice());
  nested.pageItems.push(symbol); grid.pageItems.push(nested);
  grid._b = [bounds[0] - 0.06, bounds[1] + 0.06, bounds[2] + 0.06, bounds[3] - 0.06];
  if (!withFrame) return null;
  const frame = f.item('PathItem', 'coordinate-frame', grid, bounds);
  frame.closed = true; frame.filled = false; frame.stroked = false; frame.clipping = false;
  grid.pageItems.push(frame);
  return frame;
}

test('symbol grids require an explicit coordinate-frame, including nested symbols', () => {
  const f = fixture(); addSymbolGrid(f, false);
  assert.match(f.run(true).error, /Missing coordinate-frame icon-01-0/);
  assert.equal(f.doc.saveCalls.length, 0);
});

test('valid coordinate-frame takes precedence over symbol stroke bounds', () => {
  const f = fixture(); addSymbolGrid(f);
  assert.equal(f.run().error, undefined);
});

for (const invalid of ['filled', 'stroked', 'clipping', 'open', 'size']) test(`invalid ${invalid} coordinate-frame stops before backup`, () => {
  const f = fixture(), frame = addSymbolGrid(f);
  if (invalid === 'open') frame.closed = false;
  else if (invalid === 'size') frame._b[2] += 1;
  else frame[invalid] = true;
  assert.match(f.run(true).error, /Invalid (coordinate-frame|grid bounds)/);
  assert.equal(f.doc.saveCalls.length, 0);
});


test('ordinary first-row labels preserve the existing header-to-grid distance', () => {
  const f = fixture(), before = f.find('grid-icon-01-0').geometricBounds[1];
  assert.equal(f.run(true).mode, 'apply');
  assert.equal(f.find('grid-icon-01-0').geometricBounds[1], before);
  assertUnchangedPlan(f);
});
