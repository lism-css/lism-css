var source = openDocument(config.sourcePath);
if (!source.saved) throw new Error('Save the design document before syncing');
var icons = sourceIcons(source);
var existing = documentAtPath(config.aiPath);
if (existing && !existing.saved) throw new Error('The output document has unsaved changes');
var target = new File(config.aiPath);
var backup = new File(config.backupPath);
if (backup.exists) throw new Error('Use a fresh work directory; backup already exists');
if (target.exists && !target.copy(backup.fsName)) throw new Error('Cannot back up the output document');
var staging = new File(config.stagingPath);
if (staging.exists) throw new Error('Use a fresh work directory; staging file already exists');
var output = app.documents.add(DocumentColorSpace.RGB, config.size, config.size);
try {
  saveDocument(output, config.stagingPath);
  output.layers[0].name = 'Icons';
  for (var i = 0; i < icons.length; i++) {
    var icon = icons[i];
    var left = (i % config.columns) * (config.size + config.gap);
    var top = config.size - Math.floor(i / config.columns) * (config.size + config.gap);
    var rect = [left, top, left + config.size, top - config.size];
    var board = i === 0 ? output.artboards[0] : output.artboards.add(rect);
    board.artboardRect = rect;
    board.name = icon.id;
    var copied = icon.group.duplicate(output.layers[0], ElementPlacement.PLACEATEND);
    var bounds = copied.geometricBounds;
    copied.translate(left - bounds[0], top - bounds[1]);
    copied.name = icon.id;
    // The artboard supplies the export frame; rotated transparent frames need not enter the SVG.
    for (var p = copied.pathItems.length - 1; p >= 0; p--) {
      var path = copied.pathItems[p];
      var frame = path.geometricBounds;
      if (!path.filled && !path.stroked && !path.clipping && near(frame[0], left) && near(frame[1], top) && near(frame[2], left + config.size) && near(frame[3], top - config.size)) path.remove();
    }
  }
  exportBoards(output);
  if (existing) existing.close(SaveOptions.DONOTSAVECHANGES);
  saveDocument(output, config.aiPath);
  log.push('Synced ' + icons.length + ' icon masters to the output document');
} catch (error) {
  output.close(SaveOptions.DONOTSAVECHANGES);
  throw error;
}
