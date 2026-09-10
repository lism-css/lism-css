function near(a, b) {
  return Math.abs(a - b) <= 0.01;
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

function documentAtPath() {
  var target = new File(config.aiPath).fsName;
  for (var i = 0; i < app.documents.length; i++) {
    var candidate = app.documents[i];
    try {
      if (candidate.fullName.fsName === target) return candidate;
    } catch (error) {
      // Unsaved documents have no fullName.
    }
  }
  return null;
}

function findDocument() {
  var document = documentAtPath();
  if (!document) throw new Error('Open the target document first: ' + config.aiPath);
  app.activeDocument = document;
  return document;
}

function saveDocument(document) {
  var options = new IllustratorSaveOptions();
  options.pdfCompatible = false;
  options.compressed = true;
  document.saveAs(new File(config.aiPath), options);
}

function findGroup(document, id) {
  var found = null;
  for (var i = 0; i < document.groupItems.length; i++) {
    var group = document.groupItems[i];
    if (group.name !== id) continue;
    if (found) throw new Error('Duplicate group: ' + id);
    found = group;
  }
  return found;
}

function pathsIn(container) {
  var paths = [];
  function visit(item) {
    if (item.typename === 'PathItem') {
      paths.push(item);
    } else if (item.typename === 'CompoundPathItem') {
      for (var p = 0; p < item.pathItems.length; p++) visit(item.pathItems[p]);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) visit(item.pageItems[i]);
    }
  }
  visit(container);
  return paths;
}

function sameRect(actual, expected) {
  for (var i = 0; i < 4; i++) if (!near(actual[i], expected[i])) return false;
  return true;
}

function verifyArtboards(document) {
  if (document.artboards.length !== config.icons.length) throw new Error('Unexpected artboard count: ' + document.artboards.length);
  for (var i = 0; i < config.icons.length; i++) {
    var icon = config.icons[i];
    var artboard = document.artboards[i];
    if (artboard.name !== icon.id || !sameRect(artboard.artboardRect, icon.rect)) throw new Error('Unexpected artboard: ' + icon.id);
  }
}

function verifyGroup(group, icon) {
  if (!group || group.parent.typename !== 'Layer' || !sameRect(group.geometricBounds, icon.rect)) {
    throw new Error('Missing or misplaced group: ' + icon.id);
  }
}

function isCircle(path, diameter) {
  if (!path.closed || path.pathPoints.length !== 4) return false;
  var bounds = path.geometricBounds;
  if (!near(bounds[2] - bounds[0], diameter) || !near(bounds[1] - bounds[3], diameter)) return false;
  var cx = (bounds[0] + bounds[2]) / 2;
  var cy = (bounds[1] + bounds[3]) / 2;
  var radius = diameter / 2;
  var handle = radius * 0.55228475;
  var sides = [false, false, false, false];
  for (var i = 0; i < 4; i++) {
    var point = path.pathPoints[i];
    var x = point.anchor[0] - cx;
    var y = point.anchor[1] - cy;
    var vertical = near(x, 0) && near(Math.abs(y), radius);
    var horizontal = near(y, 0) && near(Math.abs(x), radius);
    if (!vertical && !horizontal) return false;
    var side;
    // ExtendScript evaluates chained ternaries differently; keep this branch explicit.
    if (vertical) {
      side = y > 0 ? 0 : 1;
    } else {
      side = x > 0 ? 2 : 3;
    }
    if (sides[side]) return false;
    sides[side] = true;
    var a = point.leftDirection;
    var b = point.rightDirection;
    var axis = vertical ? 0 : 1;
    var other = 1 - axis;
    if (!near(a[other], point.anchor[other]) || !near(b[other], point.anchor[other])) return false;
    if (!near(Math.abs(a[axis] - point.anchor[axis]), handle) || !near(Math.abs(b[axis] - point.anchor[axis]), handle)) return false;
    if ((a[axis] - point.anchor[axis]) * (b[axis] - point.anchor[axis]) >= 0) return false;
  }
  return true;
}

function dotState(group) {
  var paths = pathsIn(group);
  var original = [];
  var converted = [];
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (path.filled && !path.stroked && isCircle(path, 2.25)) original.push(path);
    if (!path.filled && path.stroked && isCircle(path, 0.75) && near(path.strokeWidth, 1.5)) converted.push(path);
  }
  return { original: original, converted: converted };
}

function verifyDocument(document, allowOriginalDots) {
  verifyArtboards(document);
  var rootCount = 0;
  for (var j = 0; j < document.pageItems.length; j++) {
    var item = document.pageItems[j];
    if (item.parent.typename !== 'Layer') continue;
    if (item.typename !== 'GroupItem') throw new Error('Unexpected artwork outside icon groups');
    rootCount++;
  }
  if (rootCount !== config.icons.length) throw new Error('Unexpected top-level group count: ' + rootCount);
  var totalDots = 0;
  var expectedTotal = 0;
  for (var i = 0; i < config.icons.length; i++) {
    var icon = config.icons[i];
    var group = findGroup(document, icon.id);
    verifyGroup(group, icon);
    var dots = dotState(group);
    var expected = config.expectedDots[icon.id] || 0;
    var paths = pathsIn(group);
    var strokes = 0;
    var fills = 0;
    for (var p = 0; p < paths.length; p++) {
      if (paths[p].stroked) {
        strokes++;
        if (!near(paths[p].strokeWidth, 1.5)) throw new Error('Unexpected stroke width: ' + icon.id);
      }
      if (paths[p].filled && !(allowOriginalDots && !paths[p].stroked && isCircle(paths[p], 2.25))) fills++;
    }
    var hasLineData = strokes > 0 || (allowOriginalDots && dots.original.length > 0);
    var invalidFillStroke = false;
    if (icon.mixed) {
      invalidFillStroke = strokes === 0 || fills === 0;
    } else if (icon.fill) {
      invalidFillStroke = strokes > 0 || fills === 0;
    } else {
      invalidFillStroke = !hasLineData || fills > 0;
    }
    if (invalidFillStroke) {
      throw new Error(
        'Unexpected fill/stroke: ' + icon.id + ' (strokes=' + strokes + ', fills=' + fills + ', originalDots=' + dots.original.length + ')'
      );
    }
    if ((!allowOriginalDots && dots.original.length) || dots.original.length + dots.converted.length !== expected) {
      throw new Error('Unexpected dots: ' + icon.id);
    }
    totalDots += dots.original.length + dots.converted.length;
    expectedTotal += expected;
  }
  if (totalDots !== expectedTotal) throw new Error('Unexpected total dot count');
  log.push('Verified ' + config.icons.length + ' icons, ' + totalDots + ' dots');
}
