// Tiny JSON storage helper. Uses AsyncStorage when it's installed, otherwise
// falls back to memory (data then only lives while the app is open).
//   npx expo install @react-native-async-storage/async-storage
let AsyncStorage = null;
try {
  const mod = require('@react-native-async-storage/async-storage');
  AsyncStorage = mod.default || mod;
} catch (e) {
  AsyncStorage = null;
}

const memory = {};

export async function loadJSON(key, fallback) {
  try {
    const raw = AsyncStorage ? await AsyncStorage.getItem(key) : memory[key];
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    const raw = JSON.stringify(value);
    if (AsyncStorage) await AsyncStorage.setItem(key, raw);
    else memory[key] = raw;
  } catch (e) {
    // ignore write errors; the app keeps working from state
  }
}
