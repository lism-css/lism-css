var doc = findDocument();
verifyArtboards(doc);

function repairRoundedFrame(group, id) {
  if (id !== 'calendar' && id !== 'lock' && id !== 'lock-open') return;
  var height = id === 'calendar' ? 16.5 : 12;
  var paths = pathsIn(group);
  var candidates = [];
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var bounds = path.geometricBounds;
    if (path.closed && path.stroked && near(bounds[2] - bounds[0], 16.5) && near(bounds[1] - bounds[3], height)) candidates.push(path);
  }
  if (candidates.length !== 1) throw new Error('Rounded frame is not unique: ' + id);
  var original = candidates[0];
  var rect = original.geometricBounds;
  // Illustrator may retain the raw SVG's rx=8 after resize; rebuild at 8 * 24 / 256.
  var replacement = group.pathItems.roundedRectangle(rect[1], rect[0], 16.5, height, 0.75, 0.75);
  replacement.filled = original.filled;
  if (original.filled) replacement.fillColor = original.fillColor;
  replacement.stroked = original.stroked;
  replacement.strokeWidth = original.strokeWidth;
  replacement.strokeColor = original.strokeColor;
  replacement.strokeCap = original.strokeCap;
  replacement.strokeJoin = original.strokeJoin;
  replacement.strokeMiterLimit = original.strokeMiterLimit;
  replacement.strokeDashes = original.strokeDashes;
  replacement.strokeDashOffset = original.strokeDashOffset;
  replacement.strokeOverprint = original.strokeOverprint;
  replacement.opacity = original.opacity;
  replacement.move(original, ElementPlacement.PLACEBEFORE);
  original.remove();
}

// Validate the whole batch before importing any SVG.
for (var i = 0; i < config.items.length; i++) {
  var icon = config.items[i];
  var existing = findGroup(doc, icon.id);
  if (existing) verifyGroup(existing, icon);
  else if (!new File(config.rawDir + '/' + icon.id + '.svg').exists) throw new Error('Missing raw SVG: ' + icon.id);
}
for (var i = 0; i < config.items.length; i++) {
  var icon = config.items[i];
  if (findGroup(doc, icon.id)) {
    log.push('Skipped existing group: ' + icon.id);
    continue;
  }
  doc.artboards.setActiveArtboardIndex(icon.index);
  var group = doc.groupItems.createFromFile(new File(config.rawDir + '/' + icon.id + '.svg'));
  try {
    var scale = (config.size / icon.grid) * 100;
    if (scale !== 100) group.resize(scale, scale, true, true, true, true, scale, Transformation.TOPLEFT);
    group.position = [icon.rect[0], icon.rect[1]];
    group.name = icon.id;
    repairRoundedFrame(group, icon.id);
    verifyGroup(group, icon);
    log.push('Placed ' + icon.id);
  } catch (error) {
    group.remove();
    throw error;
  }
}
saveDocument(doc);
