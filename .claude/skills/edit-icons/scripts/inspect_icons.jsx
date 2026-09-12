(function () {
  function stringify(value) {
    if (value === null) return 'null';
    if (typeof value === 'string') return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/[\x00-\x1f]/g, function (c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4); }) + '"';
    if (typeof value !== 'object') return String(value);
    var parts = [], i;
    if (value instanceof Array) {
      for (i = 0; i < value.length; i++) parts.push(stringify(value[i]));
      return '[' + parts.join(',') + ']';
    }
    for (var key in value) if (value.hasOwnProperty(key)) parts.push(stringify(key) + ':' + stringify(value[key]));
    return '{' + parts.join(',') + '}';
  }
  function round(n) { return Math.round(n * 10000) / 10000; }
  function local(point, origin) { return [round(point[0] - origin[0]), round(origin[1] - point[1])]; }
  function paths(item, result) {
    if (item.typename === 'PathItem') {
      if (item.filled || item.stroked) result.push(item);
    } else if (item.typename === 'CompoundPathItem') {
      for (var i = 0; i < item.pathItems.length; i++) paths(item.pathItems[i], result);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) paths(item.pageItems[i], result);
    }
  }
  function symbols(item, result) {
    if (item.typename === 'SymbolItem') {
      result.push(item);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) symbols(item.pageItems[i], result);
    }
  }
  function namedPaths(item, name, result) {
    if (item.typename === 'PathItem') {
      if (item.name === name) result.push(item);
    } else if (item.typename === 'CompoundPathItem') {
      for (var i = 0; i < item.pathItems.length; i++) namedPaths(item.pathItems[i], name, result);
    } else if (item.typename === 'GroupItem') {
      for (var i = 0; i < item.pageItems.length; i++) if (item.pageItems[i].parent === item) namedPaths(item.pageItems[i], name, result);
    }
  }
  function localBounds(bounds, origin) {
    if (!origin) return null;
    return local([bounds[0], bounds[1]], origin).concat(local([bounds[2], bounds[3]], origin));
  }
  function symbolGeometry(item, origin) {
    return {
      name: item.symbol.name,
      geometricBounds: localBounds(item.geometricBounds, origin),
      visibleBounds: localBounds(item.visibleBounds, origin)
    };
  }
  function nearestPartName(item) {
    var current = item.parent;
    while (current && current.typename !== 'Document') {
      if (current.typename === 'GroupItem' && current.name.indexOf('part-') === 0) return current.name;
      current = current.parent;
    }
    return null;
  }
  function symbolInfo(item, origin) {
    var info = symbolGeometry(item, origin);
    info.instanceName = item.name;
    info.partName = nearestPartName(item);
    return info;
  }
  try {
    var target = new File(config.source).fsName, doc = null;
    for (var i = 0; i < app.documents.length; i++) {
      try { if (app.documents[i].fullName.fsName === target) doc = app.documents[i]; } catch (e) {}
    }
    if (!doc) doc = app.open(new File(target));
    var prefixes = { master: '', light: 'gallery-light-', bold: 'gallery-bold-', 'study-stroke': 'stroke-', 'study-fill': 'fill-', guides: 'guide-', labels: 'text-', grid: 'grid-' };
    var layers = { master: '01 Editable masters - 24px', light: '03 Gallery icons', bold: '03 Gallery icons', 'study-stroke': '05 Study strokes', 'study-fill': '07 Study fills', guides: '06 Construction guides', labels: '04 Labels and dimensions', grid: '08 Coordinate grids - 2px' };
    var wanted = {}, index = {};
    for (var i = 0; i < config.icons.length; i++) for (var role in prefixes) wanted['$' + prefixes[role] + config.icons[i]] = true;
    for (var i = 0; i < doc.groupItems.length; i++) {
      var g = doc.groupItems[i], key = '$' + g.name;
      if (!wanted[key]) continue;
      if (!index[key]) index[key] = [];
      index[key].push(g);
    }
    function find(id, role) {
      var candidates = index['$' + prefixes[role] + id] || [], matches = [];
      for (var i = 0; i < candidates.length; i++) if (candidates[i].layer.name === layers[role]) matches.push(candidates[i]);
      return matches;
    }
    function origin(id, role, g) {
      var frame = g;
      if (role !== 'master' && role !== 'light' && role !== 'bold') {
        var grids = find(id, 'grid');
        if (grids.length !== 1) return null;
        var coordinateFrames = [];
        namedPaths(grids[0], 'coordinate-frame', coordinateFrames);
        if (coordinateFrames.length > 1) return null;
        if (!coordinateFrames.length) {
          var gridSymbols = []; symbols(grids[0], gridSymbols);
          if (gridSymbols.length) return null;
        }
        if (coordinateFrames.length && (coordinateFrames[0].filled || coordinateFrames[0].stroked || coordinateFrames[0].clipping)) return null;
        frame = coordinateFrames.length ? coordinateFrames[0] : grids[0];
      }
      var b = frame.geometricBounds;
      if (Math.abs(b[2] - b[0] - 24) > 0.001 || Math.abs(b[1] - b[3] - 24) > 0.001) return null;
      return [b[0], b[1]];
    }
    function inspect(id, role, g) {
      var list = [], symbolItems = [], o = origin(id, role, g), widths = {}, total = 0, shapes = [], details = [], bounds = null, symbolDetails = [];
      paths(g, list);
      symbols(g, symbolItems);
      for (var i = 0; i < list.length; i++) {
        var p = list[i], nodes = [], b = p.visibleBounds;
        total += p.pathPoints.length;
        if (p.stroked) widths['$' + round(p.strokeWidth)] = round(p.strokeWidth);
        if (!bounds) bounds = b.slice(0);
        else { bounds[0] = Math.min(bounds[0], b[0]); bounds[1] = Math.max(bounds[1], b[1]); bounds[2] = Math.max(bounds[2], b[2]); bounds[3] = Math.min(bounds[3], b[3]); }
        if (o) {
          for (var j = 0; j < p.pathPoints.length; j++) {
            var q = p.pathPoints[j];
            nodes.push([local(q.anchor, o), local(q.leftDirection, o), local(q.rightDirection, o)]);
          }
          shapes.push(stringify([p.closed, p.filled, nodes]));
          if (config.points) details.push({ path: i, name: p.name, closed: p.closed, filled: p.filled, nodes: nodes });
        }
      }
      for (var i = 0; i < symbolItems.length; i++) {
        var symbol = symbolInfo(symbolItems[i], o);
        var b = symbolItems[i].visibleBounds;
        if (!bounds) bounds = b.slice(0);
        else { bounds[0] = Math.min(bounds[0], b[0]); bounds[1] = Math.max(bounds[1], b[1]); bounds[2] = Math.max(bounds[2], b[2]); bounds[3] = Math.min(bounds[3], b[3]); }
        symbolDetails.push(symbol);
      }
      shapes.sort();
      var values = []; for (var key in widths) if (widths.hasOwnProperty(key)) values.push(widths[key]); values.sort();
      var summary = { paths: list.length, points: total, widths: values, opacity: round(g.opacity) };
      if (bounds && o) summary.inkBounds = local([bounds[0], bounds[1]], o).concat(local([bounds[2], bounds[3]], o));
      if (role === 'labels') { summary.text = []; for (var i = 0; i < g.textFrames.length; i++) summary.text.push(g.textFrames[i].contents); }
      if (symbolDetails.length) summary.symbols = symbolDetails;
      if (config.points) { summary.coordinates = details; if (!o) summary.coordinateError = 'No unique 24px coordinate frame'; }
      return { summary: summary, shape: symbolItems.length ? null : (o ? stringify(shapes) : null) };
    }
    var report = { saved: doc.saved, icons: [] };
    for (var i = 0; i < config.icons.length; i++) {
      var id = config.icons[i], item = { icon: id, roles: {}, copies: {} }, master = find(id, 'master'), base = null;
      if (master.length === 1) base = inspect(id, 'master', master[0]);
      for (var r = 0; r < config.roles.length; r++) {
        var role = config.roles[r], matches = find(id, role);
        if (matches.length !== 1) { item.roles[role] = { status: matches.length ? 'duplicate' : 'missing', count: matches.length }; continue; }
        var data = role === 'master' ? base : inspect(id, role, matches[0]);
        item.roles[role] = data.summary;
        if (role === 'light' || role === 'bold' || role === 'study-stroke' || role === 'study-fill') {
          item.copies[role] = { sameGeometry: base && base.shape && data.shape ? base.shape === data.shape : null };
          if (role === 'light' || role === 'bold') {
            var expected = role === 'light' ? 1 : 2;
            item.copies[role].expectedStrokeWidth = data.summary.widths.length === 1 && data.summary.widths[0] === expected;
          }
        }
      }
      report.icons.push(item);
    }
    var file = new File(config.result); file.encoding = 'UTF-8';
    if (!file.open('w')) throw new Error('Cannot write inspection report');
    file.write(stringify(report)); file.close();
    return 'LISM_OK: inspected ' + report.icons.length + ' icons';
  } catch (error) { return 'ERROR: ' + error + ' line=' + error.line; }
}());
