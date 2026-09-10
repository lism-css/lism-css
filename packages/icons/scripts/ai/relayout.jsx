var doc = findDocument();
if (!doc.saved) throw new Error('Save the document before rearranging artboards');
if (doc.artboards.length !== config.icons.length) throw new Error('Unexpected artboard count');
var desired = config.icons;
var previous = [];
var groups = [];
for (var i = 0; i < doc.artboards.length; i++) {
  var board = doc.artboards[i];
  var definition = null;
  for (var j = 0; j < desired.length; j++) {
    if (desired[j].id === board.name) definition = desired[j];
  }
  if (!definition) throw new Error('Unknown artboard: ' + board.name);
  for (var k = 0; k < previous.length; k++) {
    if (previous[k].id === board.name) throw new Error('Duplicate artboard: ' + board.name);
  }
  previous.push({ id: board.name, rect: board.artboardRect.slice(0), fill: definition.fill, mixed: definition.mixed });
}
config.icons = previous;
try {
  verifyDocument(doc);
} finally {
  config.icons = desired;
}
for (var i = 0; i < desired.length; i++) groups.push(findGroup(doc, desired[i].id));
var backup = new File(config.backupPath);
if (backup.exists) throw new Error('Backup already exists: ' + backup.fsName);
if (!new File(config.aiPath).copy(backup.fsName)) throw new Error('Cannot back up the document');
var oldActive = doc.artboards[doc.artboards.getActiveArtboardIndex()].name;
var moved = [];
try {
  for (var i = 0; i < desired.length; i++) {
    var group = groups[i];
    var bounds = group.geometricBounds;
    var dx = desired[i].rect[0] - bounds[0];
    var dy = desired[i].rect[1] - bounds[1];
    group.translate(dx, dy);
    moved.push({ group: group, dx: dx, dy: dy });
  }
  for (var i = 0; i < desired.length; i++) {
    doc.artboards[i].name = desired[i].id;
    doc.artboards[i].artboardRect = desired[i].rect;
    if (desired[i].id === oldActive) doc.artboards.setActiveArtboardIndex(i);
  }
  verifyDocument(doc);
  saveDocument(doc);
} catch (error) {
  for (var i = moved.length - 1; i >= 0; i--) moved[i].group.translate(-moved[i].dx, -moved[i].dy);
  for (var i = 0; i < previous.length; i++) {
    doc.artboards[i].name = previous[i].id;
    doc.artboards[i].artboardRect = previous[i].rect;
    if (previous[i].id === oldActive) doc.artboards.setActiveArtboardIndex(i);
  }
  throw error;
}
log.push('Rearranged and saved ' + desired.length + ' artboards; backup: ' + backup.fsName);
