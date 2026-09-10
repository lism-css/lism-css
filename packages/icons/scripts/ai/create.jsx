var target = new File(config.aiPath);
if (target.exists || documentAtPath()) throw new Error('Target already exists: ' + config.aiPath);
if (!target.parent.exists) throw new Error('Create the target parent directory first: ' + target.parent.fsName);
var doc = app.documents.add(DocumentColorSpace.RGB, config.size, config.size);
for (var i = 0; i < config.icons.length; i++) {
  var icon = config.icons[i];
  var artboard = i === 0 ? doc.artboards[0] : doc.artboards.add(icon.rect);
  artboard.artboardRect = icon.rect;
  artboard.name = icon.id;
}
saveDocument(doc);
log.push('Created ' + doc.artboards.length + ' artboards');
