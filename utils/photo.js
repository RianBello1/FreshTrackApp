import { persistImage } from './files';

// Needs: npx expo install expo-image-picker
async function launch(kind) {
  let IP;
  try { IP = require('expo-image-picker'); } catch (e) { return { error: 'MISSING' }; }
  try {
    let result;
    if (kind === 'camera') {
      const perm = await IP.requestCameraPermissionsAsync();
      if (!perm.granted) return { error: 'DENIED' };
      result = await IP.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3] });
    } else {
      result = await IP.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, aspect: [4, 3] });
    }
    if (result.canceled) return { canceled: true };
    const uri = result.assets && result.assets[0] && result.assets[0].uri;
    if (!uri) return { canceled: true };
    return { uri: await persistImage(uri) };
  } catch (e) {
    return { error: String((e && e.message) || e) };
  }
}

export const takePhoto = () => launch('camera');
export const pickPhoto = () => launch('library');
