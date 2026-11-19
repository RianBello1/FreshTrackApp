// Design tokens. Screens read colors through useTheme() so dark mode works everywhere.
export const lightColors = {
  bg: '#F5F8F4', surface: '#FFFFFF', primary: '#16A34A', primaryDark: '#0F3D22', primaryMid: '#15803D',
  primarySoft: '#DCFCE7', text: '#10201A', textMuted: '#6B7C72', border: '#E3EBE4', inputBg: '#F1F5F1',
  warning: '#B45309', warningSoft: '#FEF3C7', danger: '#DC2626', dangerSoft: '#FEE2E2', white: '#FFFFFF',
  heroText: '#A7D8B6', overlay: 'rgba(8,24,15,0.55)',
};

export const darkColors = {
  bg: '#09120D', surface: '#121E17', primary: '#22C55E', primaryDark: '#0C2217', primaryMid: '#4ADE80',
  primarySoft: '#173323', text: '#E6F2EA', textMuted: '#8BA195', border: '#223329', inputBg: '#1A2920',
  warning: '#FBBF24', warningSoft: '#3B2F0E', danger: '#F87171', dangerSoft: '#3C1D1F', white: '#FFFFFF',
  heroText: '#8FC9A2', overlay: 'rgba(0,0,0,0.65)',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

// Items that expire within this many days count as "expiring".
export const EXPIRING_DAYS = 3;

export function makeShadow(isDark) {
  return {
    card: {
      shadowColor: isDark ? '#000' : '#0F3D22', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.07, shadowRadius: 14, elevation: isDark ? 2 : 3,
    },
    float: {
      shadowColor: isDark ? '#000' : '#0F3D22', shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.5 : 0.28, shadowRadius: 18, elevation: 8,
    },
  };
}

// Icon + tint per food category. bg is the color with low alpha so it works in light and dark.
export function categoryStyle(category = '') {
  const c = (category || '').toLowerCase();
  const make = (icon, color) => ({ icon, color, bg: color + '26' });
  if (c.includes('veg')) return make('leaf', '#16A34A');
  if (c.includes('fruit')) return make('nutrition', '#E11D48');
  if (c.includes('dairy') || c.includes('egg')) return make('water', '#2563EB');
  if (c.includes('seafood') || c.includes('fish') || c.includes('shell')) return make('fish', '#0891B2');
  if (c.includes('protein') || c.includes('meat') || c.includes('beef') || c.includes('chicken') || c.includes('pork') || c.includes('lamb'))
    return make('restaurant', '#C2410C');
  if (c.includes('dessert') || c.includes('sweet')) return make('ice-cream', '#C026D3');
  if (c.includes('breakfast')) return make('cafe', '#EA580C');
  if (c.includes('salad')) return make('leaf', '#65A30D');
  if (c.includes('pasta')) return make('pizza', '#D97706');
  return make('basket', '#0F766E');
}

export function freshness(daysLeft, colors) {
  if (daysLeft <= 0)
    return { key: 'today', label: daysLeft < 0 ? 'Expired' : 'Expires today', color: colors.danger, bg: colors.dangerSoft, icon: 'alert-circle' };
  if (daysLeft <= EXPIRING_DAYS)
    return { key: 'soon', label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`, color: colors.warning, bg: colors.warningSoft, icon: 'time' };
  return { key: 'fresh', label: 'Fresh', color: colors.primaryMid, bg: colors.primarySoft, icon: 'checkmark-circle' };
}

export function isPlaceholderImage(uri) {
  return !uri || uri.includes('placeholder.com');
}
