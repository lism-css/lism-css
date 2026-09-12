function near(a, b) {
  return Math.abs(a - b) <= 0.001;
}

function writeLog(message) {
  var file = new File(config.logPath);
  file.encoding = 'UTF-8';
  if (!file.open('w')) throw new Error('Cannot open log: ' + file.error);
  try {
    if (!file.write(message)) throw new Error('Cannot write log: ' + file.error);
  } finally {
    file.close();
  }
}

function documentAtPath(filePath) {
  var target = new File(filePath).fsName;
  for (var i = 0; i < app.documents.length; i++) {
    var candidate = app.documents[i];
    try {
      if (candidate.fullName.fsName === target) return candidate;
    } catch (error) {}
  }
  return null;
}

function openDocument(filePath) {
  var document = documentAtPath(filePath);
  if (document) return document;
  var file = new File(filePath);
  if (!file.exists) throw new Error('Document not found: ' + filePath);
  return app.open(file);
}

function saveDocument(document, filePath) {
  var options = new IllustratorSaveOptions();
  options.pdfCompatible = false;
  options.compressed = true;
  document.saveAs(new File(filePath), options);
}

function checkName(id, used) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Use a lowercase kebab-case icon name: ' + id);
  var key = '$' + id.replace(/-/g, '');
  if (used[key]) throw new Error('Duplicate icon name: ' + id);
  used[key] = true;
}

function checkFrame(rect, id) {
  if (!near(rect[2] - rect[0], config.size) || !near(rect[1] - rect[3], config.size)) {
    throw new Error('Icon frame must be 24 x 24: ' + id);
  }
}

function rejectMasterSymbols(group, id) {
  for (var i = 0; i < group.pageItems.length; i++) {
    var child = group.pageItems[i];
    if (child.parent !== group) continue;
    if (child.typename === 'SymbolItem') throw new Error('Symbol in icon master ' + id + ': ' + child.name);
    if (child.typename === 'GroupItem') rejectMasterSymbols(child, id);
  }
}

function sourceIcons(document) {
  var layer = document.layers.getByName(config.masterLayer);
  var result = [];
  var used = {};
  for (var i = 0; i < layer.pageItems.length; i++) {
    var item = layer.pageItems[i];
    if (item.parent !== layer) continue;
    if (item.typename !== 'GroupItem') throw new Error('Put each master in a named group');
    checkName(item.name, used);
    rejectMasterSymbols(item, item.name);
    var rect = item.geometricBounds.slice(0);
    checkFrame(rect, item.name);
    result.push({ id: item.name, group: item, rect: rect });
  }
  if (!result.length) throw new Error('No icon masters');
  result.sort(function (a, b) {
    if (!near(a.rect[1], b.rect[1])) return b.rect[1] - a.rect[1];
    return a.rect[0] - b.rect[0];
  });
  return result;
}

function exportBoards(document) {
  var used = {};
  for (var i = 0; i < document.artboards.length; i++) {
    var board = document.artboards[i];
    checkName(board.name, used);
    checkFrame(board.artboardRect, board.name);
  }
}
