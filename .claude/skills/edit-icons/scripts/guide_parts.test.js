const fs = require('fs');

const source = fs.readFileSync(`${__dirname}/guide_parts.jsx`, 'utf8');

function expect(value, message) {
  if (!value) throw new Error(message);
}

function createFixture(options = {}) {
  let output = '';
  let copies = 0;
  let saves = 0;
  let activations = 0;
  const document = { typename: 'Document', saved: options.saved !== false, fullName: { fsName: 'fixture.ai' }, groupItems: [], symbols: [] };
  const layer = name => ({ typename: 'Layer', name, locked: false, parent: document });
  const append = (parent, item) => { item.parent = parent; parent.pageItems.push(item); return item; };
  const remove = item => {
    item.parent.pageItems.splice(item.parent.pageItems.indexOf(item), 1);
    if (options.strictDeletes) Object.defineProperty(item, 'locked', { get() { throw new Error('deleted lock read'); }, set() { throw new Error('deleted lock write'); } });
  };
  const symbol = (definition, failTranslate) => {
    const item = {
      typename: 'SymbolItem', name: '', symbol: definition, locked: false,
      geometricBounds: definition.bounds.slice(),
    };
    item.translate = (x, y) => {
      if (failTranslate) throw new Error('injected translate failure');
      item.translatedAfterRotate = item.rotation;
      item.geometricBounds = [item.geometricBounds[0] + x, item.geometricBounds[1] + y, item.geometricBounds[2] + x, item.geometricBounds[3] + y];
    };
    item.rotate = degrees => { item.rotation = degrees; };
    item.remove = () => remove(item);
    return item;
  };
  const group = (name, owner) => {
    const item = { typename: 'GroupItem', name, layer: owner, parent: owner, locked: false, pageItems: [], geometricBounds: [0, 0, 0, 0] };
    item.groupItems = { add() { return append(item, group('', owner)); } };
    item.symbolItems = { add(definition) { return append(item, symbol(definition, options.failTranslate)); } };
    item.remove = () => remove(item);
    return item;
  };
  const guideLayer = layer('06 Construction guides');
  const gridLayer = layer('08 Coordinate grids - 2px');
  const guide = group('guide-info', guideLayer);
  const grid = group('grid-info', gridLayer);
  const primary = { name: 'LISM / Circle R0.75 / #a66a08', bounds: [-0.75, 0.75, 0.75, -0.75] };
  const circleSet = { name: 'LISM / Circle R0.75 + Center / #a66a08', bounds: [-0.75, 0.75, 0.75, -0.75] };
  const center = { name: 'LISM / Center / #a66a08', bounds: [-0.3, 0.3, 0.3, -0.3] };
  if (options.withFrame !== false) append(grid, { typename: 'PathItem', name: 'coordinate-frame', geometricBounds: [0, 24, 24, 0] });
  if (options.symbolGrid) append(grid, symbol(primary, false));
  document.groupItems = [guide, grid];
  document.symbols = [primary, circleSet, center];
  document.saveAs = file => { saves++; document.fullName = { fsName: file.fsName }; document.saved = true; };
  document.close = () => {};
  document.activate = () => { activations++; };

  global.File = function File(path) {
    this.fsName = path;
    this.open = () => true;
    this.write = value => { output = value; };
    this.close = () => {};
    this.copy = () => { copies++; return true; };
  };
  global.IllustratorSaveOptions = function IllustratorSaveOptions() {};
  global.ElementPlacement = { PLACEATEND: 0 };
  global.SaveOptions = { DONOTSAVECHANGES: 0 };
  global.app = { documents: [document], open: () => document, redraw: () => {} };

  return { document, guide, grid, group, append, primary, circleSet, center, report: () => JSON.parse(output), result(config) { global.config = config; return eval(source); }, copies: () => copies, saves: () => saves, activations: () => activations, symbol };
}

function config(fixture, extra = {}) {
  return Object.assign({
    action: 'place', source: 'fixture.ai', result: 'result.json', icon: 'info', symbol: fixture.primary.name,
    withCenter: false, rotate: 0, part: 'ring-at-1-2', x: 3, y: 4, apply: true, allowUnsaved: false,
    backup: 'live.ai', diskBackup: 'disk.ai',
  }, extra);
}

{
  const fixture = createFixture({ saved: false });
  const result = fixture.result(config(fixture));
  expect(result.indexOf('ERROR:') === 0, 'unsaved apply should stop');
  expect(fixture.copies() === 0 && fixture.saves() === 0 && fixture.activations() === 1, 'unsaved apply must activate before stopping without back up or save');
}

{
  const fixture = createFixture();
  const category = fixture.group('reference-circles', fixture.guide.layer);
  fixture.append(fixture.guide, category);
  const result = fixture.result(config(fixture, { withCenter: true }));
  const report = fixture.report();
  const part = category.pageItems[0];
  expect(result === 'LISM_OK: placed guide part', 'new category placement should succeed');
  expect(part.name === 'part-ring-at-3-4' && report.newPart === part.name, 'coordinate part name should update');
  expect(part.pageItems.length === 1 && part.pageItems[0].symbol === fixture.circleSet && part.pageItems[0].name === 'Circle R0.75 + Center', 'Circle + Center should place one readable named set instance');
  const bounds = part.pageItems[0].geometricBounds;
  expect((bounds[0] + bounds[2]) / 2 === 3 && (bounds[1] + bounds[3]) / 2 === 20, 'set instance should use the target center');
}

{
  const fixture = createFixture({ withFrame: false, symbolGrid: true });
  const result = fixture.result(config(fixture, { apply: false }));
  expect(result.indexOf('ERROR:') === 0, 'symbol grid must require coordinate-frame');
}

{
  const fixture = createFixture({ strictDeletes: true });
  const category = fixture.group('reference-circles', fixture.guide.layer);
  const part = fixture.group('part-ring', fixture.guide.layer);
  fixture.append(fixture.guide, category);
  fixture.append(category, part);
  fixture.append(part, fixture.symbol(fixture.primary, false));
  fixture.append(part, fixture.symbol(fixture.center, false));
  const result = fixture.result(config(fixture, { part: 'ring' }));
  expect(result === 'LISM_OK: placed guide part', 'existing part replacement should succeed');
  expect(part.pageItems.length === 1 && part.pageItems[0].name === 'Circle R0.75', 'removed instances must not be read for lock restoration');
}

{
  const fixture = createFixture({ failTranslate: true });
  const category = fixture.group('reference-circles', fixture.guide.layer);
  const part = fixture.group('part-ring-at-1-2', fixture.guide.layer);
  const existing = fixture.symbol(fixture.primary, false);
  existing.locked = true;
  fixture.append(fixture.guide, category);
  fixture.append(category, part);
  fixture.append(part, existing);
  const result = fixture.result(config(fixture));
  const report = fixture.report();
  expect(result.indexOf('ERROR:') === 0 && report.rollbackError === null, 'injected placement failure should roll back');
  expect(part.name === 'part-ring-at-1-2' && existing.locked, 'rollback should restore the part name and untouched item lock');
}

{
  const fixture = createFixture();
  const category = fixture.group('reference-circles', fixture.guide.layer);
  const part = fixture.group('part-radius-0p75-at-m1p5-3p75', fixture.guide.layer);
  fixture.append(fixture.guide, category);
  fixture.append(category, part);
  const result = fixture.result(config(fixture, { apply: false, part: 'radius-0p75-at-m1p5-3p75', x: -2.25, y: 4.5 }));
  expect(result === 'LISM_OK: checked guide part' && fixture.report().newPart === 'part-radius-0p75-at-m2p25-4p5', 'at suffix should preserve negative and decimal coordinates');
}

{
  const fixture = createFixture();
  const grid = { name: 'LISM / Grid 24 - step 2 / dotted', bounds: [-12, 12, 12, -12] };
  fixture.document.symbols.push(grid);
  const result = fixture.result(config(fixture, { apply: false, symbol: grid.name }));
  expect(result.indexOf('ERROR:') === 0, 'Grid symbols should be rejected for guide parts');
}

{
  const fixture = createFixture();
  const frame = { name: 'LISM / Frame 18x18 / #a66a08', bounds: [-9, 9, 9, -9] };
  fixture.document.symbols.push(frame);
  const result = fixture.result(config(fixture, { apply: false, symbol: frame.name, withCenter: true }));
  expect(result.indexOf('ERROR:') === 0, '--with-center should reject non-Circle symbols');
}

{
  const fixture = createFixture();
  const category = fixture.group('reference-frames', fixture.guide.layer);
  const frame = { name: 'LISM / Frame 18x18 / #a66a08', bounds: [-9, 9, 9, -9] };
  fixture.append(fixture.guide, category);
  fixture.document.symbols.push(frame);
  const result = fixture.result(config(fixture, { symbol: frame.name, part: 'frame-at-1-2', rotate: 90 }));
  const item = category.pageItems[0].pageItems[0];
  expect(result === 'LISM_OK: placed guide part' && item.rotation === 90 && item.translatedAfterRotate === 90, 'rotation should happen before centering');
}

{
  const fixture = createFixture();
  fixture.grid.pageItems[0].filled = true;
  const result = fixture.result(config(fixture, { apply: false }));
  expect(result.indexOf('ERROR:') === 0, 'coordinate-frame must be transparent');
}

console.log('guide_parts fixtures ok');
