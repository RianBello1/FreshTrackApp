// File helpers that work with both the new and legacy expo-file-system APIs.
// Needs: npx expo install expo-file-system
function getFS() { try { return require('expo-file-system'); } catch (e) { return null; } }
function getLegacy() { try { return require('expo-file-system/legacy'); } catch (e) { return null; } }

export async function persistImage(uri) {
  try {
    const FS = getFS();
    if (FS && FS.File && FS.Paths) {
      const ext = ((uri.split('?')[0].split('.').pop() || 'jpg') + '').slice(0, 4);
      const dest = new FS.File(FS.Paths.document, `photo_${Date.now()}.${ext}`);
      new FS.File(uri).copy(dest);
      return dest.uri;
    }
    const L = getLegacy() || FS;
    if (L && L.copyAsync && L.documentDirectory) {
      const to = `${L.documentDirectory}photo_${Date.now()}.jpg`;
      await L.copyAsync({ from: uri, to });
      return to;
    }
  } catch (e) {
    // fall through: keep the original (cache) uri
  }
  return uri;
}

export async function writeTextFile(name, text) {
  const FS = getFS();
  if (FS && FS.File && FS.Paths) {
    const f = new FS.File(FS.Paths.cache, name);
    try { if (f.exists) f.delete(); } catch (e) {}
    f.create();
    f.write(text);
    return f.uri;
  }
  const L = getLegacy() || FS;
  if (!L || !L.writeAsStringAsync) throw new Error('MISSING:expo-file-system');
  const uri = `${L.cacheDirectory}${name}`;
  await L.writeAsStringAsync(uri, text);
  return uri;
}
