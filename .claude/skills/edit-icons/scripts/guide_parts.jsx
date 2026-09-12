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
    if (item.typename === 'SymbolItem') {
      result.push(item);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) symbols(item.pageItems[i], result);
    }
  }
  function localOrigin(grid) {
    var frames = [];
    namedPaths(grid, 'coordinate-frame', frames);
    if (frames.length > 1) throw Error('Duplicate coordinate frame');
    if (!frames.length) {
      var gridSymbols = [];
      symbols(grid, gridSymbols);
      if (gridSymbols.length) throw Error('Missing coordinate frame for symbol grid');
    }
    if (frames.length && (frames[0].filled || frames[0].stroked || frames[0].clipping)) throw Error('Coordinate frame must be transparent and non-clipping');
    var bounds = (frames.length ? frames[0] : grid).geometricBounds;
    if (changed(bounds[2] - bounds[0], 24) || changed(bounds[1] - bounds[3], 24)) throw Error('Invalid 24px coordinate frame');
    return [bounds[0], bounds[1]];
  }
  var groupIndex = null;
  function findGroup(doc, groupName, layerName) {
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
    if (matches.length !== 1) throw Error((matches.length ? 'Duplicate ' : 'Missing ') + groupName);
    return matches[0];
  }
  function findSymbol(doc, symbolName) {
    var matches = [];
    for (var i = 0; i < doc.symbols.length; i++) if (doc.symbols[i].name === symbolName) matches.push(doc.symbols[i]);
    if (matches.length !== 1) throw Error((matches.length ? 'Duplicate symbol ' : 'Missing symbol ') + symbolName);
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
  function findCategory(guide, categoryName) {
    var matches = [], items = directItems(guide);
    for (var i = 0; i < items.length; i++) if (items[i].typename === 'GroupItem' && items[i].name === categoryName) matches.push(items[i]);
    if (matches.length > 1) throw Error('Duplicate guide category ' + categoryName);
    return matches.length ? matches[0] : null;
  }
  function categoryForSymbol(symbolName) {
    if (symbolName.indexOf('LISM / Frame ') === 0) return 'reference-frames';
    if (symbolName.indexOf('LISM / Circle ') === 0) return 'reference-circles';
    if (symbolName.indexOf('LISM / Contact ') === 0) return 'contact-points';
    if (symbolName.indexOf('LISM / Center ') === 0) return 'arc-centers';
    return 'construction';
  }
  function circleSetName(symbolName) {
    var pieces = symbolName.split(' / ');
    if (pieces.length !== 3 || pieces[0] !== 'LISM' || !/^Circle R\d+(?:\.\d+)?$/.test(pieces[1]) || !pieces[2]) return null;
    return 'LISM / ' + pieces[1] + ' + Center / ' + pieces[2];
  }
  function coordinateToken(value) {
    var rounded = String(round(value));
    if (rounded.charAt(0) === '-') rounded = 'm' + rounded.slice(1);
    return rounded.replace('.', 'p');
  }
  function coordinatePartName(partName, x, y) {
    var match = /^(.*)-at-(m?\d+(?:p\d+)?)-(m?\d+(?:p\d+)?)$/.exec(partName);
    if (!match) return partName;
    return match[1] + '-at-' + coordinateToken(x) + '-' + coordinateToken(y);
  }
  function validatePart(part) {
    if (!part) return [];
    var items = directItems(part);
    for (var i = 0; i < items.length; i++) if (items[i].typename !== 'SymbolItem') throw Error('Guide part contains a non-symbol item: ' + part.name);
    return items;
  }
  function symbolCenter(item) {
    var bounds = item.geometricBounds;
    return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
  }
  function unlock(item, locks, recordItem) {
    var chain = [], current = item, i, known;
    while (current && current.typename !== 'Document') { chain.push(current); current = current.parent; }
    for (i = chain.length - 1; i >= 0; i--) {
      current = chain[i]; known = false;
      for (var j = 0; j < locks.length; j++) if (locks[j].item === current) known = true;
      if (!known) {
        if (recordItem !== false || current !== item) locks.push({ item: current, locked: current.locked });
        if (current.locked) current.locked = false;
      }
    }
  }
  function restoreLocks(locks) {
    var firstError = null;
    for (var i = locks.length - 1; i >= 0; i--) {
      try { locks[i].item.locked = locks[i].locked; } catch (error) { if (!firstError) firstError = error; }
    }
    if (firstError) throw firstError;
  }
  function restoreItemLocks(items, values) {
    var firstError = null;
    for (var i = 0; i < values.length; i++) {
      try { items[i].locked = values[i]; } catch (error) { if (!firstError) firstError = error; }
    }
    if (firstError) throw firstError;
  }
  function addAtCenter(part, definition, target, instanceName, rotate, added) {
    var item = part.symbolItems.add(definition);
    added.push(item);
    item.name = instanceName;
    if (rotate) item.rotate(rotate);
    var center = symbolCenter(item);
    item.translate(target[0] - center[0], target[1] - center[1]);
  }
  function instanceName(symbolName) {
    var pieces = symbolName.split(' / ');
    return pieces.length > 1 ? pieces[1] : symbolName;
  }
  var doc = null, target = null, backupReady = false, locks = [], locksRestored = false, saveOptions = null;
  var part = null, partWasCreated = false, partNameBefore = null, category = null, categoryWasCreated = false, added = [], oldRemoved = 0, oldLocks = [];
  try {
    target = new File(config.source).fsName;
    for (var i = 0; i < app.documents.length; i++) {
      try { if (app.documents[i].fullName.fsName === target) doc = app.documents[i]; } catch (ignore) {}
    }
    if (!doc) doc = app.open(new File(target));

    if (config.action === 'list') {
      var symbolNames = [];
      for (i = 0; i < doc.symbols.length; i++) {
        var symbolName = doc.symbols[i].name;
        if (symbolName.indexOf('LISM / ') === 0 && (!config.match || symbolName.indexOf(config.match) !== -1)) symbolNames.push(symbolName);
      }
      symbolNames.sort();
      write({ mode: 'list', saved: doc.saved, symbols: symbolNames });
      return 'LISM_OK: listed ' + symbolNames.length + ' symbols';
    }
    if (config.apply) {
      doc.activate();
      app.redraw();
    }

    if (config.action === 'copy') {
      var fromGuide = findGroup(doc, 'guide-' + config.from, '06 Construction guides');
      var toGuide = findGroup(doc, 'guide-' + config.to, '06 Construction guides');
      var fromText = findGroup(doc, 'text-' + config.from, '04 Labels and dimensions');
      var toText = findGroup(doc, 'text-' + config.to, '04 Labels and dimensions');
      var fromOrigin = localOrigin(findGroup(doc, 'grid-' + config.from, '08 Coordinate grids - 2px'));
      var toOrigin = localOrigin(findGroup(doc, 'grid-' + config.to, '08 Coordinate grids - 2px'));
      var delta = [toOrigin[0] - fromOrigin[0], toOrigin[1] - fromOrigin[1]];
      var fromLabel = 0;
      for (i = 0; i < fromText.textFrames.length; i++) if (fromText.textFrames[i].contents === config.from) fromLabel++;
      if (fromLabel !== 1) throw Error('Source name label not found: text-' + config.from);
      var plan = [], fromItems = directItems(fromGuide);
      function partsIn(group, result) {
        var items = directItems(group);
        for (var n = 0; n < items.length; n++) if (items[n].typename === 'GroupItem' && items[n].name.indexOf('part-') === 0) result.push(items[n]);
      }
      for (i = 0; i < fromItems.length; i++) {
        var fromItem = fromItems[i];
        if (fromItem.typename === 'GroupItem' && fromItem.name.indexOf('part-') === 0) {
          if (config.onlyMissing && findPart(toGuide, fromItem.name)) continue;
          plan.push({ item: fromItem, category: null, label: fromItem.name });
        } else if (fromItem.typename === 'GroupItem' && fromItem.name) {
          var toCategory = findCategory(toGuide, fromItem.name);
          if (config.onlyMissing && toCategory) {
            var categoryParts = []; partsIn(fromItem, categoryParts);
            for (var n = 0; n < categoryParts.length; n++) if (!findPart(toGuide, categoryParts[n].name)) plan.push({ item: categoryParts[n], category: fromItem.name, label: fromItem.name + '/' + categoryParts[n].name });
          } else plan.push({ item: fromItem, category: null, label: fromItem.name + '/*' });
        } else if (!config.onlyMissing) plan.push({ item: fromItem, category: null, label: fromItem.name || fromItem.typename });
      }
      var planned = []; for (i = 0; i < plan.length; i++) planned.push(plan[i].label);
      var toItems = directItems(toGuide), toTextItems = directItems(toText);
      var report = {
        mode: config.apply ? 'apply' : 'check', saved: doc.saved, from: config.from, to: config.to, onlyMissing: config.onlyMissing,
        copies: planned, replacesGuideItems: config.onlyMissing ? 0 : toItems.length,
        replacesTextItems: config.onlyMissing ? 0 : toTextItems.length, copiesTextItems: config.onlyMissing ? 0 : directItems(fromText).length
      };
      if (!config.apply) { write(report); return 'LISM_OK: checked guide copy'; }
      if (!doc.saved && !config.allowUnsaved) throw Error('Document has unsaved changes; rerun with --allow-unsaved');
      saveOptions = new IllustratorSaveOptions(); saveOptions.pdfCompatible = false; saveOptions.compressed = true;
      if (!new File(target).copy(config.diskBackup)) throw Error('Cannot back up saved file');
      doc.saveAs(new File(config.backup), saveOptions); backupReady = true;
      unlock(toGuide, locks); unlock(toText, locks);
      if (!config.onlyMissing) {
        for (i = toItems.length - 1; i >= 0; i--) { unlock(toItems[i], locks, false); toItems[i].remove(); }
        for (i = toTextItems.length - 1; i >= 0; i--) { unlock(toTextItems[i], locks, false); toTextItems[i].remove(); }
        var textCopies = directItems(fromText), renamed = 0;
        for (i = 0; i < textCopies.length; i++) {
          var textCopy = textCopies[i].duplicate(toText, ElementPlacement.PLACEATEND);
          textCopy.translate(delta[0], delta[1]);
          if (textCopy.typename === 'TextFrame' && textCopy.contents === config.from) { textCopy.contents = config.to; renamed++; }
        }
        if (renamed !== 1) throw Error('Name label copy failed');
      }
      for (i = 0; i < plan.length; i++) {
        var destination = toGuide;
        if (plan[i].category) {
          destination = findCategory(toGuide, plan[i].category);
          if (!destination) { destination = toGuide.groupItems.add(); destination.name = plan[i].category; }
        }
        var copied = plan[i].item.duplicate(destination, ElementPlacement.PLACEATEND);
        copied.translate(delta[0], delta[1]);
      }
      restoreLocks(locks); locksRestored = true;
      app.redraw();
      doc.saveAs(new File(target), saveOptions);
      report.saved = doc.saved; report.backup = config.backup; report.diskBackup = config.diskBackup;
      write(report);
      return 'LISM_OK: copied guide ' + config.from + ' to ' + config.to;
    }

    var guide = findGroup(doc, 'guide-' + config.icon, '06 Construction guides');
    var grid = findGroup(doc, 'grid-' + config.icon, '08 Coordinate grids - 2px');
    var origin = localOrigin(grid), requestedPartName = 'part-' + config.part;
    var targetPartName = coordinatePartName(requestedPartName, config.x, config.y);
    part = findPart(guide, requestedPartName);
    if (targetPartName !== requestedPartName) {
      var targetPart = findPart(guide, targetPartName);
      if (targetPart && targetPart !== part) throw Error('Guide part name already exists: ' + targetPartName);
    }
    var existingItems = validatePart(part), resolvedSymbolName = config.symbol;
    if (config.withCenter) {
      resolvedSymbolName = circleSetName(config.symbol);
      if (!resolvedSymbolName) throw Error('--with-center requires a standalone LISM / Circle symbol');
    }
    var primary = findSymbol(doc, resolvedSymbolName);
    if (primary.name.indexOf('LISM / Grid ') === 0) throw Error('Grid symbols cannot be placed in guide parts');
    var targetCenter = [round(origin[0] + config.x), round(origin[1] - config.y)];
    var plannedNames = [primary.name];
    var categoryName = categoryForSymbol(primary.name);
    var report = {
      mode: config.apply ? 'apply' : 'check', saved: doc.saved, icon: config.icon,
      part: requestedPartName, newPart: targetPartName, category: part ? part.parent.name : categoryName,
      center: [round(config.x), round(config.y)], rotate: round(config.rotate), symbols: plannedNames, existingSymbols: existingItems.length, changed: true
    };
    if (!config.apply) { write(report); return 'LISM_OK: checked guide part'; }
    if (!doc.saved && !config.allowUnsaved) throw Error('Document has unsaved changes; rerun with --allow-unsaved');

    saveOptions = new IllustratorSaveOptions(); saveOptions.pdfCompatible = false; saveOptions.compressed = true;
    if (!new File(target).copy(config.diskBackup)) throw Error('Cannot back up saved file');
    doc.saveAs(new File(config.backup), saveOptions); backupReady = true;
    unlock(guide, locks);
    if (!part) {
      category = findCategory(guide, categoryName);
      if (!category) { category = guide.groupItems.add(); category.name = categoryName; categoryWasCreated = true; }
      if (!categoryWasCreated) unlock(category, locks);
      part = category.groupItems.add(); part.name = targetPartName; partWasCreated = true;
    } else {
      partNameBefore = part.name;
      unlock(part, locks);
      if (part.name !== targetPartName) part.name = targetPartName;
    }
    for (i = 0; i < existingItems.length; i++) {
      oldLocks.push(existingItems[i].locked);
      unlock(existingItems[i], locks, false);
    }
    addAtCenter(part, primary, targetCenter, instanceName(primary.name), config.rotate, added);
    for (i = 0; i < existingItems.length; i++) { existingItems[i].remove(); oldRemoved++; }
    restoreLocks(locks); locksRestored = true;
    app.redraw();
    doc.saveAs(new File(target), saveOptions);
    report.saved = doc.saved; report.replacedSymbols = existingItems.length; report.part = part.name; report.newPart = part.name;
    report.backup = config.backup; report.diskBackup = config.diskBackup;
    write(report);
    return 'LISM_OK: placed guide part';
  } catch (error) {
    var rollbackError = null;
    if (backupReady) {
      try {
        if (!locksRestored && part && !oldRemoved) {
          var manualError = null;
          try { for (var i = added.length - 1; i >= 0; i--) added[i].remove(); } catch (removeAddedError) { manualError = removeAddedError; }
          try { restoreItemLocks(existingItems, oldLocks); } catch (itemLockError) { if (!manualError) manualError = itemLockError; }
          try {
            if (partWasCreated) {
              part.remove();
              if (categoryWasCreated) category.remove();
            } else if (partNameBefore !== null) part.name = partNameBefore;
          } catch (partRestoreError) { if (!manualError) manualError = partRestoreError; }
          try { restoreLocks(locks); } catch (parentLockError) { if (!manualError) manualError = parentLockError; }
          if (manualError) throw manualError;
          doc.saveAs(new File(target), saveOptions);
        } else {
          try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (ignoreClose) {}
          doc = app.open(new File(config.backup));
          doc.saveAs(new File(target), saveOptions);
        }
      } catch (rollback) { rollbackError = String(rollback); }
    }
    write({ error: String(error), line: error.line, rollbackError: rollbackError, backupReady: backupReady, backup: backupReady ? config.backup : null, diskBackup: backupReady ? config.diskBackup : null });
    return 'ERROR: guide part failed; inspect result and backup before retrying';
  }
}());
