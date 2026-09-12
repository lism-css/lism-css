(function () {
  function stringify(value) {
    if (value === null || typeof value === 'undefined') return 'null';
    if (typeof value === 'string') return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
    if (typeof value !== 'object') return String(value);
    var parts = [], i;
    if (value instanceof Array) { for (i = 0; i < value.length; i++) parts.push(stringify(value[i])); return '[' + parts.join(',') + ']'; }
    for (var key in value) if (value.hasOwnProperty(key)) parts.push(stringify(key) + ':' + stringify(value[key]));
    return '{' + parts.join(',') + '}';
  }
  function write(value) {
    var file = new File(config.result); file.encoding = 'UTF-8';
    if (!file.open('w')) throw Error('Cannot write result');
    file.write(stringify(value)); file.close();
  }
  function round(value) { return Math.round(value * 10000) / 10000; }
  function changed(a, b) { return Math.abs(a - b) > 0.001; }
  function directItems(group) {
    var result = [];
    for (var i = 0; i < group.pageItems.length; i++) if (group.pageItems[i].parent === group) result.push(group.pageItems[i]);
    return result;
  }
  function namedPaths(item, pathName, result) {
    if (item.typename === 'PathItem') {
      if (item.name === pathName) result.push(item);
    } else if (item.typename === 'CompoundPathItem') {
      for (var i = 0; i < item.pathItems.length; i++) namedPaths(item.pathItems[i], pathName, result);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) namedPaths(item.pageItems[i], pathName, result);
    }
  }
  function symbols(item, result) {
    if (item.typename === 'SymbolItem') result.push(item);
    else if (item.typename === 'GroupItem') for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) symbols(item.pageItems[i], result);
  }
  function localOrigin(grid) {
    var frames = [];
    namedPaths(grid, 'coordinate-frame', frames);
    if (frames.length > 1) throw Error('Duplicate coordinate frame in ' + grid.name);
    if (!frames.length) {
      var gridSymbols = []; symbols(grid, gridSymbols);
      if (gridSymbols.length) throw Error('Missing coordinate frame for symbol grid ' + grid.name);
    }
    if (frames.length && (frames[0].filled || frames[0].stroked || frames[0].clipping)) throw Error('Coordinate frame must be transparent and non-clipping: ' + grid.name);
    var bounds = (frames.length ? frames[0] : grid).geometricBounds;
    if (changed(bounds[2] - bounds[0], 24) || changed(bounds[1] - bounds[3], 24)) throw Error('Invalid 24px coordinate frame: ' + grid.name);
    return [bounds[0], bounds[1]];
  }
  var groupIndex = null;
  function findGroups(doc, groupName, layerName) {
    if (!groupIndex) {
      groupIndex = {};
      for (var n = 0; n < doc.groupItems.length; n++) {
        var candidate = doc.groupItems[n], key = '$' + candidate.name;
        if (!groupIndex[key]) groupIndex[key] = [];
        groupIndex[key].push(candidate);
      }
    }
    var matches = [], candidates = groupIndex['$' + groupName] || [];
    for (var i = 0; i < candidates.length; i++) if (candidates[i].layer.name === layerName) matches.push(candidates[i]);
    return matches;
  }
  function findGroup(doc, groupName, layerName) {
    var matches = findGroups(doc, groupName, layerName);
    if (matches.length !== 1) throw Error((matches.length ? 'Duplicate ' : 'Missing ') + groupName);
    return matches[0];
  }
  function findPart(guide, partName) {
    var matches = [];
    function visit(group) {
      var items = directItems(group);
      for (var i = 0; i < items.length; i++) if (items[i].typename === 'GroupItem') {
        if (items[i].name === partName) matches.push(items[i]);
        visit(items[i]);
      }
    }
    visit(guide);
    if (matches.length > 1) throw Error('Duplicate guide part ' + partName);
    return matches.length ? matches[0] : null;
  }
  function paintedPaths(item, result) {
    if (item.typename === 'PathItem') {
      if (item.filled || item.stroked) result.push(item);
    } else if (item.typename === 'CompoundPathItem') {
      for (var i = 0; i < item.pathItems.length; i++) paintedPaths(item.pathItems[i], result);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) paintedPaths(item.pageItems[i], result);
    }
  }
  function cloneColor(color) {
    if (color.typename !== 'RGBColor') throw Error('Study color must be RGB');
    var result = new RGBColor(); result.red = color.red; result.green = color.green; result.blue = color.blue;
    return result;
  }
  function unlock(item, locks) {
    var chain = [], current = item, i, known;
    while (current && current.typename !== 'Document') { chain.push(current); current = current.parent; }
    for (i = chain.length - 1; i >= 0; i--) {
      current = chain[i]; known = false;
      for (var j = 0; j < locks.length; j++) if (locks[j].item === current) known = true;
      if (!known) { locks.push({ item: current, locked: current.locked }); if (current.locked) current.locked = false; }
    }
  }
  function restoreLocks(locks) {
    var firstError = null;
    for (var i = locks.length - 1; i >= 0; i--) {
      try { locks[i].item.locked = locks[i].locked; } catch (error) { if (!firstError) firstError = error; }
    }
    if (firstError) throw firstError;
  }
  var roleLayers = { text: '04 Labels and dimensions', stroke: '05 Study strokes', guide: '06 Construction guides', fill: '07 Study fills', grid: '08 Coordinate grids - 2px' };
  var masterLayer = '01 Editable masters - 24px';
  var doc = null, target = null, backupReady = false, locks = [], saveOptions = null;
  try {
    target = new File(config.source).fsName;
    for (var i = 0; i < app.documents.length; i++) {
      try { if (app.documents[i].fullName.fsName === target) doc = app.documents[i]; } catch (ignore) {}
    }
    if (!doc) doc = app.open(new File(target));
    if (config.apply) { doc.activate(); app.redraw(); }

    var icon = config.icon, studyRole = /-fill$/.test(icon) ? 'fill' : 'stroke';
    var master = findGroup(doc, icon, masterLayer), masterBounds = master.geometricBounds;
    if (changed(masterBounds[2] - masterBounds[0], 24) || changed(masterBounds[1] - masterBounds[3], 24)) throw Error('Master frame must be 24 x 24: ' + icon);
    var masterSymbols = []; symbols(master, masterSymbols);
    if (masterSymbols.length) throw Error('Master contains symbols: ' + icon);
    var masterOrigin = [masterBounds[0], masterBounds[1]];
    for (var role in roleLayers) if (roleLayers.hasOwnProperty(role)) {
      if (findGroups(doc, role + '-' + icon, roleLayers[role]).length) throw Error('Study already exists: ' + role + '-' + icon);
    }

    var sections = {};
    for (i = 0; i < doc.groupItems.length; i++) {
      var g = doc.groupItems[i];
      if (g.parent.typename !== 'Layer') continue;
      var match = /^Geometry (\d\d) - (.*) \/ (text|stroke|fill|guide|grid)$/.exec(g.name);
      if (!match) continue;
      if (!sections[match[1]]) sections[match[1]] = { id: match[1], title: match[2], groups: {} };
      if (sections[match[1]].groups[match[3]]) throw Error('Duplicate section role ' + match[1] + '/' + match[3]);
      sections[match[1]].groups[match[3]] = g;
    }
    var section = sections[config.section];
    if (!section || !section.groups.grid || !section.groups.text) throw Error('Missing section ' + config.section);
    var gridItems = directItems(section.groups.grid), sectionGrids = [];
    for (i = 0; i < gridItems.length; i++) {
      if (gridItems[i].typename !== 'GroupItem' || gridItems[i].name.indexOf('grid-') !== 0) throw Error('Unexpected grid section item ' + gridItems[i].name);
      var origin = localOrigin(gridItems[i]);
      sectionGrids.push({ id: gridItems[i].name.slice(5), grid: gridItems[i], x: origin[0], y: origin[1] });
    }
    if (!sectionGrids.length) throw Error('Empty section ' + config.section);
    sectionGrids.sort(function (a, b) { if (Math.abs(a.y - b.y) > 1) return b.y - a.y; return a.x - b.x; });
    var reference = null;
    if (config.after) {
      for (i = 0; i < sectionGrids.length; i++) if (sectionGrids[i].id === config.after) reference = sectionGrids[i];
      if (!reference) throw Error('--after icon is not in section ' + config.section + ': ' + config.after);
    } else reference = sectionGrids[sectionGrids.length - 1];
    var referenceOrigin = [reference.x, reference.y];
    var referenceText = findGroup(doc, 'text-' + reference.id, roleLayers.text);
    var referenceGuide = findGroups(doc, 'guide-' + reference.id, roleLayers.guide);
    var referenceLabel = null;
    for (i = 0; i < referenceText.textFrames.length; i++) if (referenceText.textFrames[i].contents === reference.id) referenceLabel = referenceText.textFrames[i];
    if (!referenceLabel) throw Error('Reference name label not found: text-' + reference.id);
    var otherRole = studyRole === 'fill' ? 'stroke' : 'fill';
    var referenceStudy = findGroups(doc, studyRole + '-' + reference.id, roleLayers[studyRole]);
    if (!referenceStudy.length) referenceStudy = findGroups(doc, otherRole + '-' + reference.id, roleLayers[otherRole]);
    var studyColor = null;
    if (referenceStudy.length) {
      var painted = []; paintedPaths(referenceStudy[0], painted);
      if (painted.length) studyColor = cloneColor(painted[0].stroked ? painted[0].strokeColor : painted[0].fillColor);
    }
    if (!studyColor) { studyColor = new RGBColor(); studyColor.red = 15; studyColor.green = 120; studyColor.blue = 240; }

    var sourceGuide = null, sourceText = null, sourceOrigin = null, sourceLabel = null;
    if (config.from) {
      sourceGuide = findGroup(doc, 'guide-' + config.from, roleLayers.guide);
      sourceText = findGroup(doc, 'text-' + config.from, roleLayers.text);
      sourceOrigin = localOrigin(findGroup(doc, 'grid-' + config.from, roleLayers.grid));
      for (i = 0; i < sourceText.textFrames.length; i++) if (sourceText.textFrames[i].contents === config.from) sourceLabel = sourceText.textFrames[i];
      if (!sourceLabel) throw Error('Source name label not found: text-' + config.from);
    }
    var newOrigin;
    if (config.after) newOrigin = [reference.x + 24, reference.y];
    else {
      var left = Infinity, bottom = Infinity;
      for (i = 0; i < sectionGrids.length; i++) { left = Math.min(left, sectionGrids[i].x); bottom = Math.min(bottom, sectionGrids[i].y); }
      newOrigin = [left, bottom - 52];
    }
    var frameTemplate = referenceGuide.length ? findPart(referenceGuide[0], 'part-frame-24x24') : null;
    var report = {
      mode: config.apply ? 'apply' : 'check', saved: doc.saved, icon: icon, section: config.section, sectionTitle: section.title,
      reference: reference.id, from: config.from || null, studyRole: studyRole, createStudyGroup: !section.groups[studyRole],
      copiesFrame: !!frameTemplate, studyColor: [studyColor.red, studyColor.green, studyColor.blue],
      provisionalOrigin: [round(newOrigin[0]), round(newOrigin[1])], next: 'layout_studies.py --check then --apply'
    };
    if (!config.apply) { write(report); return 'LISM_OK: checked new study'; }
    if (!doc.saved && !config.allowUnsaved) throw Error('Document has unsaved changes; rerun with --allow-unsaved');

    saveOptions = new IllustratorSaveOptions(); saveOptions.pdfCompatible = false; saveOptions.compressed = true;
    if (!new File(target).copy(config.diskBackup)) throw Error('Cannot back up saved file');
    doc.saveAs(new File(config.backup), saveOptions); backupReady = true;

    var studyGroup = section.groups[studyRole];
    if (!studyGroup) {
      var layer = doc.layers.getByName(roleLayers[studyRole]);
      unlock(layer, locks);
      studyGroup = layer.groupItems.add(); studyGroup.name = 'Geometry ' + section.id + ' - ' + section.title + ' / ' + studyRole;
    }
    if (!section.groups.guide) {
      var guideLayer = doc.layers.getByName(roleLayers.guide);
      unlock(guideLayer, locks);
      section.groups.guide = guideLayer.groupItems.add(); section.groups.guide.name = 'Geometry ' + section.id + ' - ' + section.title + ' / guide';
    }
    var targets = [section.groups.grid, section.groups.text, section.groups.guide, studyGroup];
    for (i = 0; i < targets.length; i++) unlock(targets[i], locks);
    function shift(item, from) { item.translate(newOrigin[0] - from[0], newOrigin[1] - from[1]); }

    var grid = reference.grid.duplicate(section.groups.grid, ElementPlacement.PLACEATEND);
    grid.name = 'grid-' + icon; shift(grid, referenceOrigin);

    var text;
    if (sourceText) {
      text = sourceText.duplicate(section.groups.text, ElementPlacement.PLACEATEND); text.name = 'text-' + icon; shift(text, sourceOrigin);
      var renamed = 0;
      for (i = 0; i < text.textFrames.length; i++) if (text.textFrames[i].contents === config.from) { text.textFrames[i].contents = icon; renamed++; }
      if (renamed !== 1) throw Error('Name label copy failed');
    } else {
      text = section.groups.text.groupItems.add(); text.name = 'text-' + icon;
      var label = referenceLabel.duplicate(text, ElementPlacement.PLACEATEND); label.contents = icon; shift(text, referenceOrigin);
    }

    var study = master.duplicate(studyGroup, ElementPlacement.PLACEATEND);
    study.name = studyRole + '-' + icon; study.opacity = 35; shift(study, masterOrigin);
    var studyPaths = []; paintedPaths(study, studyPaths);
    for (i = 0; i < studyPaths.length; i++) {
      if (studyPaths[i].stroked) studyPaths[i].strokeColor = cloneColor(studyColor);
      if (studyPaths[i].filled) studyPaths[i].fillColor = cloneColor(studyColor);
    }

    var guide;
    if (sourceGuide) { guide = sourceGuide.duplicate(section.groups.guide, ElementPlacement.PLACEATEND); guide.name = 'guide-' + icon; shift(guide, sourceOrigin); }
    else {
      guide = section.groups.guide.groupItems.add(); guide.name = 'guide-' + icon;
      if (frameTemplate) {
        var category = guide.groupItems.add(); category.name = 'reference-frames';
        var frame = frameTemplate.duplicate(category, ElementPlacement.PLACEATEND); shift(frame, referenceOrigin);
      }
    }
    restoreLocks(locks);
    app.redraw();
    doc.saveAs(new File(target), saveOptions);
    report.saved = doc.saved; report.created = [grid.name, text.name, study.name, guide.name];
    report.backup = config.backup; report.diskBackup = config.diskBackup;
    write(report);
    return 'LISM_OK: created study ' + icon;
  } catch (error) {
    var rollbackError = null;
    if (backupReady) {
      try {
        try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (ignoreClose) {}
        doc = app.open(new File(config.backup));
        doc.saveAs(new File(target), saveOptions);
      } catch (rollback) { rollbackError = String(rollback); }
    }
    write({ error: String(error), line: error.line, rollbackError: rollbackError, backupReady: backupReady, backup: backupReady ? config.backup : null, diskBackup: backupReady ? config.diskBackup : null });
    return 'ERROR: new study failed; inspect result and backup before retrying';
  }
}());
