(function () {
  var staging = null, addedBoard = null, committed = false;
  try {
    var doc = null, i, j;
    for (i = 0; i < app.documents.length; i++) if (app.documents[i].fullName.fsName === config.source) doc = app.documents[i];
    if (!doc) doc = app.open(new File(config.source));
    doc.activate();
    app.redraw();
    var boardName = 'Symbols - Edit library', layerName = '10 Symbol edit library';
    var board = null, previous = null, right = -1e9, top = -1e9;
    for (i = 0; i < doc.artboards.length; i++) {
      var ab = doc.artboards[i];
      if (ab.name === boardName) {
        if (board) throw Error('Duplicate library artboard');
        board = ab;
      } else {
        right = Math.max(right, ab.artboardRect[2]);
        top = Math.max(top, ab.artboardRect[1]);
      }
    }
    for (i = 0; i < doc.layers.length; i++) if (doc.layers[i].name === layerName) {
      if (previous) throw Error('Duplicate library layer');
      previous = doc.layers[i];
    }
    // Study artwork can extend outside the original artboards.
    for (i = 0; i < doc.pageItems.length; i++) {
      var item = doc.pageItems[i];
      if (item.layer === previous || item.parent.typename !== 'Layer' || item.hidden) continue;
      right = Math.max(right, item.visibleBounds[2]);
    }
    var categories = [
      {title: 'Circles', symbols: []}, {title: 'Circle + center', symbols: []},
      {title: 'Frames', symbols: []}, {title: 'Centers', symbols: []},
      {title: 'Contact points', symbols: []}, {title: 'Coordinate grid', symbols: []},
      {title: 'Other shared guides', symbols: []}
    ];
    var names = {}, count = 0;
    for (i = 0; i < doc.symbols.length; i++) {
      var symbol = doc.symbols[i], label = symbol.name;
      if (label.indexOf('LISM / ') !== 0) continue;
      if (names['$' + label]) throw Error('Duplicate symbol name: ' + label);
      names['$' + label] = true;
      var category = 6;
      if (label.indexOf('LISM / Circle ') === 0) { category = 0; if (label.indexOf(' + Center / ') !== -1) category = 1; }
      else if (label.indexOf('LISM / Frame ') === 0) category = 2;
      else if (label.indexOf('LISM / Center / ') === 0) category = 3;
      else if (label.indexOf('LISM / Contact / ') === 0) category = 4;
      else if (label.indexOf('LISM / Grid ') === 0) category = 5;
      var number = label.match(/[0-9]+(?:\.[0-9]+)?/);
      var numeric = 0;
      if (number) numeric = Number(number[0]);
      categories[category].symbols.push({symbol: symbol, label: label, numeric: numeric});
      count++;
    }
    if (!count) throw Error('No shared guide symbols');
    var present = {}, missing = 0, obsolete = 0, duplicate = 0;
    if (previous) for (i = 0; i < previous.symbolItems.length; i++) {
      var key = '$' + previous.symbolItems[i].symbol.name;
      if (present[key]) duplicate++;
      present[key] = true;
      if (!names[key]) obsolete++;
    }
    for (var key in names) if (names.hasOwnProperty(key) && !present[key]) missing++;
    function write(message) {
      var file = new File(config.result); file.encoding = 'UTF-8';
      if (!file.open('w')) throw Error('Cannot write result');
      file.write(message); file.close();
    }
    if (!config.apply) {
      write('symbols=' + count + ' missing=' + missing + ' obsolete=' + obsolete + ' duplicates=' + duplicate + ' board=' + Boolean(board) + ' layer=' + Boolean(previous));
      return 'LISM_OK: checked symbol library';
    }
    if (!doc.saved) throw Error('Save the design document before rebuilding the library');
    for (i = 0; i < doc.pageItems.length; i++) if (doc.pageItems[i].isIsolated) throw Error('Exit isolation or symbol editing mode first');
    if (!new File(config.source).copy(config.backup)) throw Error('Cannot back up source');
    var left = right + 48;
    if (board) { left = board.artboardRect[0]; top = board.artboardRect[1]; }
    var width = 240, padding = 12, columns = 6, cellWidth = 36;
    staging = doc.layers.add(); staging.name = '__symbol-library-staging';
    var labels = staging.groupItems.add(); labels.name = 'Library labels';
    function color(hex) {
      var c = new RGBColor(); c.red = parseInt(hex.slice(1, 3), 16); c.green = parseInt(hex.slice(3, 5), 16); c.blue = parseInt(hex.slice(5, 7), 16); return c;
    }
    function text(value, x, y, size, hex) {
      var t = labels.textFrames.add(); t.contents = value;
      t.textRange.characterAttributes.size = size; t.textRange.characterAttributes.fillColor = color(hex);
      var bounds = t.visibleBounds;
      t.translate(x - bounds[0], y - bounds[1]);
      return t;
    }
    text('LISM / Symbol edit library', left + padding, top - 10, 8, '#2b303c');
    text('Original size / Double-click to edit / Esc to return', left + padding, top - 23, 3, '#687080');
    var y = top - 32;
    for (i = 0; i < categories.length; i++) {
      var section = categories[i]; if (!section.symbols.length) continue;
      // ExtendScript can leave object arrays unchanged with Array.sort callbacks.
      for (var sortIndex = 1; sortIndex < section.symbols.length; sortIndex++) {
        var entry = section.symbols[sortIndex], insertAt = sortIndex;
        while (insertAt > 0) {
          var preceding = section.symbols[insertAt - 1];
          if (preceding.numeric < entry.numeric || (preceding.numeric === entry.numeric && preceding.label <= entry.label)) break;
          section.symbols[insertAt] = preceding;
          insertAt--;
        }
        section.symbols[insertAt] = entry;
      }
      var compact = i === 3 || i === 4;
      var heading = text(section.title + ' / ' + section.symbols.length, left + padding, y, 4.5, '#2b303c');
      var ruleY = heading.visibleBounds[3] - 2;
      var rule = labels.pathItems.add(); rule.setEntirePath([[left + padding, ruleY], [left + width - padding, ruleY]]);
      rule.filled = false; rule.stroked = true; rule.strokeWidth = 0.15; rule.strokeColor = color('#dce2eb');
      y = ruleY - 4;
      for (var start = 0; start < section.symbols.length; start += columns) {
        var row = [], artworkHeight = 0;
        for (j = start; j < Math.min(start + columns, section.symbols.length); j++) {
          var sym = section.symbols[j].symbol, preview = staging.symbolItems.add(sym), b = preview.visibleBounds;
          if (!(b[2] > b[0] && b[1] > b[3])) throw Error('Empty symbol: ' + sym.name);
          if (b[2] - b[0] > cellWidth - 4) throw Error('Symbol exceeds column width: ' + sym.name);
          artworkHeight = Math.max(artworkHeight, b[1] - b[3]);
          preview.name = 'Edit / ' + sym.name;
          preview.note = 'Linked editing preview; original size';
          row.push({preview: preview, pieces: sym.name.split(' / ')});
        }
        var rowBottom = y;
        if (compact) artworkHeight = Math.max(artworkHeight, 4);
        for (j = 0; j < row.length; j++) {
          var entry = row[j], x = left + padding + j * cellWidth;
          var cx = x + 16, cy = y - artworkHeight / 2;
          if (compact) cx = x + 3;
          var b = entry.preview.visibleBounds;
          entry.preview.translate(cx - (b[0] + b[2]) / 2, cy - (b[1] + b[3]) / 2);
          rowBottom = Math.min(rowBottom, entry.preview.visibleBounds[3]);
          if (compact) {
            var label = text(entry.pieces[2], x + 8, y, 3, '#687080');
            var lb = label.visibleBounds;
            label.translate(0, cy - (lb[1] + lb[3]) / 2);
            rowBottom = Math.min(rowBottom, label.visibleBounds[3]);
          } else {
            var shortLabel = entry.pieces[1];
            if (i === 1) shortLabel = shortLabel.replace('Circle ', '');
            var label = text(shortLabel, x, y - artworkHeight - 3, 3, '#2b303c');
            var bottom = label.visibleBounds[3];
            if (entry.pieces.length > 2) bottom = text(entry.pieces[2], x, bottom - 1, 2.5, '#687080').visibleBounds[3];
            rowBottom = Math.min(rowBottom, bottom);
          }
        }
        y = rowBottom - 5;
      }
      y -= 3;
    }
    var height = top - y + 4;
    labels.locked = true;
    if (staging.symbolItems.length !== count) throw Error('Incomplete symbol library');
    var rect = [left, top, left + width, top - height];
    if (!board) { addedBoard = doc.artboards.add(rect); board = addedBoard; board.name = boardName; }
    else board.artboardRect = rect;
    if (previous) { previous.locked = false; previous.remove(); }
    staging.name = layerName;
    committed = true;
    doc.selection = null;
    for (i = 0; i < doc.artboards.length; i++) if (doc.artboards[i].name === boardName) doc.artboards.setActiveArtboardIndex(i);
    var view = doc.views[0], viewBounds = view.bounds;
    view.zoom = view.zoom * Math.min((viewBounds[2] - viewBounds[0]) / width, (viewBounds[1] - viewBounds[3]) / height) * 0.94;
    doc.views[0].centerPoint = [left + width / 2, top - height / 2];
    app.redraw();
    var options = new IllustratorSaveOptions(); options.pdfCompatible = false; options.compressed = true;
    doc.saveAs(new File(config.source), options);
    write('Created ' + count + ' linked previews; board=' + boardName + '; saved=' + doc.saved + '\nBackup: ' + config.backup);
    return 'LISM_OK: rebuilt symbol library';
  } catch (error) {
    if (!committed) {
      if (staging) try { staging.locked = false; staging.remove(); } catch (ignored) {}
      if (addedBoard) try { addedBoard.remove(); } catch (ignored) {}
    }
    return 'ERROR: ' + error + ' line=' + error.line + '; inspect document and backup before retrying';
  }
}());
