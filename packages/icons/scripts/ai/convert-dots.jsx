var doc = findDocument();
verifyDocument(doc, true);
var pending = [];
var total = 0;
for (var i = 0; i < config.icons.length; i++) {
  var icon = config.icons[i];
  var expected = config.expectedDots[icon.id] || 0;
  var group = findGroup(doc, icon.id);
  verifyGroup(group, icon);
  var state = dotState(group);
  if (state.original.length + state.converted.length !== expected) throw new Error('Dot count mismatch: ' + icon.id);
  total += state.original.length + state.converted.length;
  for (var p = 0; p < state.original.length; p++) pending.push({ group: group, path: state.original[p] });
}
// No mutations occur until every group's original and converted dots pass validation.
for (var i = 0; i < pending.length; i++) {
  var original = pending[i].path;
  var bounds = original.geometricBounds;
  var cx = (bounds[0] + bounds[2]) / 2;
  var cy = (bounds[1] + bounds[3]) / 2;
  var circle = pending[i].group.pathItems.ellipse(cy + 0.375, cx - 0.375, 0.75, 0.75);
  circle.filled = false;
  circle.stroked = true;
  circle.strokeWidth = 1.5;
  circle.strokeColor = original.fillColor;
  circle.strokeCap = StrokeCap.ROUNDENDCAP;
  circle.strokeJoin = StrokeJoin.ROUNDENDJOIN;
  circle.opacity = original.opacity;
  circle.move(original, ElementPlacement.PLACEBEFORE);
  original.remove();
}
verifyDocument(doc);
if (pending.length) saveDocument(doc);
log.push('Converted ' + pending.length + ' dots; total ' + total);
