(function () {
  function stringify(value) {
    if (value === null || typeof value === 'undefined') return 'null';
    if (typeof value === 'string') return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
    if (typeof value !== 'object') return String(value);
    var parts = [], k;
    if (value instanceof Array) { for (k = 0; k < value.length; k++) parts.push(stringify(value[k])); return '[' + parts.join(',') + ']'; }
    for (k in value) if (value.hasOwnProperty(k)) parts.push(stringify(k) + ':' + stringify(value[k]));
    return '{' + parts.join(',') + '}';
  }
  function write(value) { var f = new File(config.result); f.encoding = 'UTF-8'; if (!f.open('w')) throw Error('Cannot write result'); f.write(stringify(value)); f.close(); }
  function round(n) { return Math.round(n * 10000) / 10000; }
  function changed(a, b) { return Math.abs(a - b) > 0.001; }
  function directItems(g) { var a = []; for (var i = 0; i < g.pageItems.length; i++) if (g.pageItems[i].parent === g) a.push(g.pageItems[i]); return a; }
  function containsSymbol(group) {
    var items = directItems(group);
    for (var n = 0; n < items.length; n++) {
      if (items[n].typename === 'SymbolItem') return true;
      if (items[n].typename === 'GroupItem' && containsSymbol(items[n])) return true;
    }
    return false;
  }
  var doc = null, undo = [], locks = [], backupReady = false, report = null;
  try {
    var target = new File(config.source).fsName, i, j, k;
    for (i = 0; i < app.documents.length; i++) { try { if (app.documents[i].fullName.fsName === target) doc = app.documents[i]; } catch (ignore) {} }
    if (!doc) doc = app.open(new File(target));
    if (config.apply && !doc.saved && !config.allowUnsaved) throw Error('Unsaved document; save first or use --allow-unsaved');
    var accepted = [], candidates = [], roleLayers = { text: '04 Labels and dimensions', stroke: '05 Study strokes', fill: '07 Study fills', guide: '06 Construction guides', grid: '08 Coordinate grids - 2px' };
    var settings = config.settings, sections = {}, paper = null, roles = ['text', 'stroke', 'fill', 'guide', 'grid'];
    for (i = 0; i < doc.groupItems.length; i++) {
      var g = doc.groupItems[i];
      var roleMatch = /^(text|stroke|fill|guide|grid)-.+/.exec(g.name);
      if (roleMatch && g.layer.name === roleLayers[roleMatch[1]]) candidates.push(g);
      if (g.parent.typename !== 'Layer') continue;
      var match = /^Geometry (\d\d) - .* \/ (text|stroke|fill|guide|grid)$/.exec(g.name);
      if (match) {
        var sid = match[1], role = match[2];
        if (!sections[sid]) sections[sid] = { id: sid, groups: {}, icons: [], headers: [] };
        if (sections[sid].groups[role]) throw Error('Duplicate section role ' + sid + '/' + role);
        sections[sid].groups[role] = g;
      }
      if (g.name === 'Geometry - Construction studies / paper') { if (paper) throw Error('Duplicate study paper'); paper = g; }
    }
    var configured = {}, sectionIds = [];
    for (i = 0; i < settings.regularColumns.length; i++) for (j = 0; j < settings.regularColumns[i].length; j++) sectionIds.push(settings.regularColumns[i][j]);
    for (i = 0; i < settings.fillColumns.length; i++) sectionIds.push(settings.fillColumns[i]);
    if (settings.regularColumns.length !== 2 || settings.fillColumns.length !== 2 || settings.columns !== 4) throw Error('Expected two section columns and four icon columns');
    for (i = 0; i < sectionIds.length; i++) {
      var sid = sectionIds[i];
      if (configured[sid] || !sections[sid]) throw Error('Missing or duplicate configured section ' + sid);
      configured[sid] = true;
    }
    for (var sid in sections) if (sections.hasOwnProperty(sid) && !configured[sid]) throw Error('Unconfigured section ' + sid);
    var allIds = {};
    for (i = 0; i < sectionIds.length; i++) {
      var section = sections[sectionIds[i]], icons = {}, count = 0;
      if (!section.groups.grid || !section.groups.text) throw Error('Missing grid/text section ' + section.id);
      for (j = 0; j < roles.length; j++) {
        var role = roles[j], group = section.groups[role]; if (!group) continue;
        var items = directItems(group);
        for (k = 0; k < items.length; k++) {
          var item = items[k], prefix = role + '-';
          if (item.typename === 'GroupItem' && item.name.indexOf(prefix) === 0) {
            var id = item.name.slice(prefix.length);
            if (!icons[id]) icons[id] = { id: id, items: [], roles: {} };
            if (icons[id].roles[role]) throw Error('Duplicate ' + role + ' ' + id);
            icons[id].roles[role] = item; accepted.push(item);
            icons[id].items.push(item);
            if (role === 'grid') { if (icons[id].grid) throw Error('Duplicate grid ' + id); icons[id].grid = item; }
            if (role === 'text') icons[id].text = item;
          } else if (role === 'text' && item.typename === 'TextFrame') section.headers.push(item);
          else throw Error('Unexpected direct study item ' + group.name + '/' + item.name);
        }
      }
      section.headerTop = -Infinity; section.headerBottom = Infinity; section.headerLeft = Infinity; section.left = Infinity;
      for (j = 0; j < section.headers.length; j++) {
        var hb = section.headers[j].visibleBounds;
        section.headerTop = Math.max(section.headerTop, hb[1]); section.headerBottom = Math.min(section.headerBottom, hb[3]); section.headerLeft = Math.min(section.headerLeft, hb[0]);
      }
      if (!isFinite(section.headerTop)) throw Error('Missing section heading ' + section.id);
      for (var id in icons) if (icons.hasOwnProperty(id)) {
        var icon = icons[id];
        if (allIds[id] || !icon.grid || !icon.text) throw Error('Duplicate or incomplete study ' + id);
        allIds[id] = true;
        var frame = null, gridItems = directItems(icon.grid);
        for (j = 0; j < gridItems.length; j++) if (gridItems[j].typename === 'PathItem' && gridItems[j].name === 'coordinate-frame') {
          if (frame) throw Error('Duplicate coordinate frame ' + id);
          frame = gridItems[j];
        }
        if (!frame && containsSymbol(icon.grid)) throw Error('Missing coordinate-frame ' + id);
        if (frame && (frame.filled || frame.stroked || frame.clipping || !frame.closed)) throw Error('Invalid coordinate-frame ' + id + ': expected an unpainted, closed, non-clipping frame');
        var b = (frame || icon.grid).geometricBounds;
        if (changed(b[2] - b[0], 24) || changed(b[1] - b[3], 24)) throw Error('Invalid grid bounds ' + id);
        icon.x = b[0]; icon.y = b[1]; icon.above = 0; icon.below = 24;
        for (j = 0; j < icon.items.length; j++) { var bounds = icon.items[j].visibleBounds; icon.above = Math.max(icon.above, bounds[1] - icon.y); icon.below = Math.max(icon.below, icon.y - bounds[3]); }
        section.left = Math.min(section.left, icon.x); section.icons.push(icon); count++;
      }
      if (!count) throw Error('Empty section ' + section.id);
      section.icons.sort(function (a, b) { if (Math.abs(a.y - b.y) > 1) return b.y - a.y; return a.x - b.x; });
    }
    for (i = 0; i < candidates.length; i++) {
      var found = false; for (j = 0; j < accepted.length; j++) if (candidates[i] === accepted[j]) found = true;
      if (!found) throw Error('Orphan study role ' + candidates[i].name);
    }
    if (!paper) throw Error('Missing study background');
    var paperItems = directItems(paper), namedDividers = {};
    for (i = 0; i < paperItems.length; i++) {
      var dm = /^section-divider-(\d\d)$/.exec(paperItems[i].name);
      if (dm) { if (namedDividers[dm[1]]) throw Error('Duplicate section divider ' + dm[1]); namedDividers[dm[1]] = paperItems[i]; }
    }
    var jobs = [], counts = [], renames = [], summaries = [], movedIcons = 0;
    function move(item, dx, dy) { dx = round(dx); dy = round(dy); if (changed(dx, 0) || changed(dy, 0)) jobs.push({ item: item, dx: dx, dy: dy }); }
    function layout(section, left, headerTop) {
      var rows = [], row = [], breaks = {}, i, j;
      for (i = 0; i < settings.breakBefore.length; i++) breaks[settings.breakBefore[i]] = true;
      for (i = 0; i < section.icons.length; i++) {
        var icon = section.icons[i];
        if (row.length && (row.length === settings.columns || breaks[icon.id])) { rows.push(row); row = []; }
        row.push(icon);
      }
      if (row.length) rows.push(row);
      for (i = 0; i < section.headers.length; i++) {
        var header = section.headers[i];
        move(header, left - settings.headerInset - section.headerLeft, headerTop - section.headerTop);
        if (header.typename === 'TextFrame' && /^\d+ icons$/.test(header.contents) && header.contents !== section.icons.length + ' icons') counts.push({ item: header, value: section.icons.length + ' icons' });
      }
      var y = headerTop - settings.headerToGrid, bottom = y, previousY = y;
      for (i = 0; i < rows.length; i++) {
        var above = 0, below = 0;
        for (j = 0; j < rows[i].length; j++) { above = Math.max(above, rows[i][j].above); below = Math.max(below, rows[i][j].below); }
        if (i) y = Math.min(previousY - settings.minimumRowPitch, bottom - settings.rowGap - above);
        else y = Math.min(y, headerTop - Math.max(settings.separatorOffset, section.headerTop - section.headerBottom) - settings.firstRowGap - above);
        for (j = 0; j < rows[i].length; j++) {
          var icon = rows[i][j], dx = left + j * settings.columnPitch - icon.x, dy = y - icon.y;
          if (changed(dx, 0) || changed(dy, 0)) movedIcons++;
          for (var n = 0; n < icon.items.length; n++) move(icon.items[n], dx, dy);
        }
        previousY = y; bottom = y - below;
      }
      summaries.push({ section: section.id, icons: section.icons.length, rows: rows.length, headerTop: round(headerTop), bottom: round(bottom) });
      return bottom;
    }
    var bottoms = [], lefts = [], initialTop = sections[settings.regularColumns[0][0]].headerTop;
    for (i = 0; i < 2; i++) {
      var firstId = settings.regularColumns[i][0], anchorDivider = namedDividers[firstId];
      lefts[i] = anchorDivider ? anchorDivider.geometricBounds[0] + 7 : sections[firstId].headerLeft + settings.headerInset;
      var nextTop = initialTop;
      for (j = 0; j < settings.regularColumns[i].length; j++) {
        bottoms[i] = layout(sections[settings.regularColumns[i][j]], lefts[i], nextTop);
        nextTop = bottoms[i] - settings.sectionGap;
      }
    }
    var fillTop = Math.min(bottoms[0], bottoms[1]) - settings.sectionGap;
    for (i = 0; i < 2; i++) bottoms[i] = layout(sections[settings.fillColumns[i]], lefts[i], fillTop);
    if (!paper) throw Error('Missing study background');
    var background = null;
    for (i = 0; i < paperItems.length; i++) if (paperItems[i].typename === 'PathItem' && paperItems[i].closed && paperItems[i].pathPoints.length === 4) {
      if (background) throw Error('Ambiguous study background'); background = paperItems[i];
    }
    if (!background) throw Error('Missing rectangular study background');
    var dividers = {}, anonymous = [[], []], columnLines = [0, 0], dividerMoves = 0, targetHeaders = {};
    for (i = 0; i < summaries.length; i++) targetHeaders[summaries[i].section] = summaries[i].headerTop;
    for (i = 0; i < paperItems.length; i++) {
      var line = paperItems[i], dividerMatch = /^section-divider-(\d\d)$/.exec(line.name);
      if (dividerMatch) {
        var sid = dividerMatch[1];
        if (!configured[sid] || dividers[sid]) throw Error('Unknown or duplicate section divider ' + sid);
        if (line.typename !== 'PathItem' || line.closed || line.pathPoints.length !== 2 || changed(line.geometricBounds[1], line.geometricBounds[3])) throw Error('Invalid section divider ' + sid);
        dividers[sid] = line;
      }
      if (line.typename !== 'PathItem' || line.closed || line.pathPoints.length !== 2) continue;
      var lb = line.geometricBounds;
      if (changed(lb[1], lb[3]) || changed(lb[2] - lb[0], settings.columns * settings.columnPitch)) continue;
      for (j = 0; j < 2; j++) if (!changed(lb[0], lefts[j] - 7)) {
        columnLines[j]++;
        if (!dividerMatch) anonymous[j].push(line);
      }
    }
    for (i = 0; i < 2; i++) {
      var ordered = settings.regularColumns[i].concat([settings.fillColumns[i]]), missing = [];
      for (j = 0; j < ordered.length; j++) if (!dividers[ordered[j]]) missing.push(ordered[j]);
      if (missing.length) {
        if (columnLines[i] !== ordered.length || anonymous[i].length !== missing.length) throw Error('Ambiguous anonymous section dividers in column ' + i);
        anonymous[i].sort(function (a, b) { return b.geometricBounds[1] - a.geometricBounds[1]; });
        for (j = 0; j < missing.length; j++) {
          dividers[missing[j]] = anonymous[i][j];
          renames.push({ item: anonymous[i][j], value: 'section-divider-' + missing[j] });
        }
      } else if (anonymous[i].length) throw Error('Unexpected extra anonymous section dividers in column ' + i);
      for (j = 0; j < ordered.length; j++) {
        var sid = ordered[j], line = dividers[sid], lb = line.geometricBounds;
        var dx = lefts[i] - 7 - lb[0], dy = targetHeaders[sid] - settings.separatorOffset - lb[1];
        if (changed(dx, 0) || changed(dy, 0)) dividerMoves++;
        move(line, dx, dy);
      }
    }
    var paperBounds = background.geometricBounds, newBottom = round(Math.min(bottoms[0], bottoms[1]) - settings.bottomPadding), bottomPoints = [];
    for (i = 0; i < background.pathPoints.length; i++) if (!changed(background.pathPoints[i].anchor[1], paperBounds[3])) bottomPoints.push(background.pathPoints[i]);
    if (bottomPoints.length !== 2) throw Error('Unsupported study background');
    var resizePaper = changed(newBottom, paperBounds[3]);
    report = { mode: 'check', saved: doc.saved, movedIcons: movedIcons, movedItems: jobs.length, countLabels: counts.length, dividerMoves: dividerMoves, dividerNames: renames.length, backgroundChanged: resizePaper, sections: summaries };
    if (!config.apply || (!jobs.length && !counts.length && !renames.length && !resizePaper)) { if (config.apply) report.mode = 'apply'; write(report); return 'LISM_OK: layout ' + report.mode + '; moved=' + movedIcons; }
    var opt = new IllustratorSaveOptions(); opt.pdfCompatible = false; opt.compressed = true;
    if (!new File(target).copy(config.diskBackup)) throw Error('Cannot back up saved file');
    doc.saveAs(new File(config.backup), opt); backupReady = true;
    function unlock(item) {
      var chain = [], current = item;
      while (current && current.typename !== 'Document') { chain.push(current); current = current.parent; }
      for (var c = chain.length - 1; c >= 0; c--) {
        current = chain[c];
        var known = false;
        for (var n = 0; n < locks.length; n++) if (locks[n].item === current) known = true;
        if (!known) { locks.push({ item: current, locked: current.locked }); if (current.locked) current.locked = false; }
      }
    }
    for (i = 0; i < jobs.length; i++) unlock(jobs[i].item);
    for (i = 0; i < counts.length; i++) unlock(counts[i].item);
    for (i = 0; i < renames.length; i++) unlock(renames[i].item);
    if (resizePaper) unlock(background);
    for (i = 0; i < jobs.length; i++) { var job = jobs[i]; job.item.translate(job.dx, job.dy); undo.push({ kind: 'move', item: job.item, dx: job.dx, dy: job.dy }); }
    for (i = 0; i < counts.length; i++) { undo.push({ kind: 'text', item: counts[i].item, value: counts[i].item.contents }); counts[i].item.contents = counts[i].value; }
    for (i = 0; i < renames.length; i++) { undo.push({ kind: 'name', item: renames[i].item, value: renames[i].item.name }); renames[i].item.name = renames[i].value; }
    if (resizePaper) for (i = 0; i < bottomPoints.length; i++) {
      var p = bottomPoints[i], a = p.anchor, l = p.leftDirection, r = p.rightDirection, delta = newBottom - paperBounds[3];
      undo.push({ kind: 'point', item: p, anchor: a.slice(0), left: l.slice(0), right: r.slice(0) });
      a[1] += delta; l[1] += delta; r[1] += delta; p.anchor = a; p.leftDirection = l; p.rightDirection = r;
    }
    for (i = locks.length - 1; i >= 0; i--) locks[i].item.locked = locks[i].locked;
    app.redraw();
    doc.saveAs(new File(target), opt);
    report.mode = 'apply'; report.saved = doc.saved; report.backup = config.backup; write(report);
    return 'LISM_OK: layout saved; moved=' + movedIcons;
  } catch (error) {
    var rollbackError = null;
    if (backupReady) {
      try {
        for (var n = 0; n < locks.length; n++) locks[n].item.locked = false;
        for (var n = undo.length - 1; n >= 0; n--) {
          var action = undo[n];
          if (action.kind === 'move') action.item.translate(-action.dx, -action.dy);
          else if (action.kind === 'text') action.item.contents = action.value;
          else if (action.kind === 'name') action.item.name = action.value;
          else { action.item.anchor = action.anchor; action.item.leftDirection = action.left; action.item.rightDirection = action.right; }
        }
      } catch (rollback) { rollbackError = String(rollback); }
      for (var n = locks.length - 1; n >= 0; n--) {
        try { locks[n].item.locked = locks[n].locked; } catch (lockError) { rollbackError = (rollbackError || '') + '; lock: ' + String(lockError); }
      }
      if (!rollbackError) {
        try { var opt = new IllustratorSaveOptions(); opt.pdfCompatible = false; opt.compressed = true; app.redraw(); doc.saveAs(new File(config.source), opt); }
        catch (saveError) { rollbackError = String(saveError); }
      }
    }
    write({ error: String(error), line: error.line, rollbackError: rollbackError, backup: backupReady ? config.backup : null, diskBackup: config.diskBackup });
    return 'ERROR: layout failed; inspect result and backup before retrying';
  }
}());
