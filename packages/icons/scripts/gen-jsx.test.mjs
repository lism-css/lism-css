import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { generateJsx } from './gen-jsx.mjs';

const common = await readFile(new URL('./ai/common.jsx', import.meta.url), 'utf8');
const context = vm.createContext({ config: { masterLayer: 'Masters', size: 24 } });
vm.runInContext(common, context);

test('source discovery follows named masters regardless of count or canvas position', () => {
  const layer = { pageItems: [] };
  const document = { layers: { getByName: () => layer } };
  const icon = (name, x, y) => ({ parent: layer, typename: 'GroupItem', name, pageItems: [], geometricBounds: [x, y, x + 24, y - 24] });
  layer.pageItems = [icon('first', -300, 100)];
  assert.deepEqual(
    Array.from(context.sourceIcons(document), ({ id }) => id),
    ['first']
  );
  layer.pageItems.push(icon('second', -200, 100), icon('third', -300, -200));
  assert.deepEqual(
    Array.from(context.sourceIcons(document), ({ id }) => id),
    ['first', 'second', 'third']
  );
  layer.pageItems.shift();
  assert.deepEqual(
    Array.from(context.sourceIcons(document), ({ id }) => id),
    ['second', 'third']
  );
});

test('source discovery rejects symbols even inside nested master groups', () => {
  const layer = { pageItems: [] };
  const master = { parent: layer, typename: 'GroupItem', name: 'test-icon', pageItems: [], geometricBounds: [0, 24, 24, 0] };
  const nested = { parent: master, typename: 'GroupItem', pageItems: [] };
  const symbol = { parent: nested, typename: 'SymbolItem', name: 'guide-circle' };
  layer.pageItems.push(master);
  master.pageItems.push(nested);
  nested.pageItems.push(symbol);
  const document = { layers: { getByName: () => layer } };
  assert.throws(() => context.sourceIcons(document), /Symbol in icon master test-icon/);
  nested.pageItems = [{ parent: nested, typename: 'PathItem' }];
  assert.doesNotThrow(() => context.sourceIcons(document));
});

test('export accepts free board positions but rejects invalid dimensions and colliding names', () => {
  const board = (name, x) => ({ name, artboardRect: [x, 24, x + 24, 0] });
  assert.doesNotThrow(() => context.exportBoards({ artboards: [board('new-icon', 500), board('other', -70)] }));
  assert.throws(() => context.exportBoards({ artboards: [board('same', 0), board('same', 100)] }), /Duplicate/);
  assert.throws(() => context.exportBoards({ artboards: [board('new-icon', 0), board('newicon', 100)] }), /Duplicate/);
  assert.throws(() => context.exportBoards({ artboards: [board('../outside', 0)] }), /kebab-case/);
  assert.throws(() => context.exportBoards({ artboards: [{ name: 'wrong', artboardRect: [0, 48, 24, 0] }] }), /24 x 24/);
});

test('generator refuses to overwrite the design and emits executable scripts', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'lism-jsx-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourcePath = join(root, 'source.ai');
  assert.throws(() => generateJsx(root, { sourcePath, aiPath: sourcePath }), /different files/);
  generateJsx(root, { sourcePath, aiPath: join(root, 'output.ai') });
  for (const file of ['01-sync.jsx', '02-export.jsx']) new vm.Script(await readFile(join(root, file), 'utf8'));
});
