import React from 'react';
import { Image, Platform, StyleSheet, Text, TextInput } from 'react-native';

// Plus Jakarta Sans — friendly, modern, geometric. Static weights.
export const fontAssets = {
  'PlusJakartaSans-Regular': require('../../assets/fonts/PlusJakartaSans-400.ttf'),
  'PlusJakartaSans-Medium': require('../../assets/fonts/PlusJakartaSans-500.ttf'),
  'PlusJakartaSans-SemiBold': require('../../assets/fonts/PlusJakartaSans-600.ttf'),
  'PlusJakartaSans-Bold': require('../../assets/fonts/PlusJakartaSans-700.ttf'),
  'PlusJakartaSans-ExtraBold': require('../../assets/fonts/PlusJakartaSans-800.ttf')
};

export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold'
};

// Deliberately one tier lighter than nominal weight: the UI was reading as
// "shouty"/AI-bold. Regular dominant, Medium secondary, SemiBold heaviest.
const weightToFamily: Record<string, string> = {
  '100': fonts.regular,
  '200': fonts.regular,
  '300': fonts.regular,
  '400': fonts.regular,
  '500': fonts.regular,
  normal: fonts.regular,
  '600': fonts.medium,
  '700': fonts.semibold,
  '800': fonts.semibold,
  '900': fonts.semibold,
  bold: fonts.semibold
};

let applied = false;

export function applyBrandFont() {
  if (applied) return;
  applied = true;
  if (Platform.OS === 'web') {
    injectWebFont();
    return;
  }
  patchNative(Text as any);
  patchNative(TextInput as any);
}

/**
 * Web: react-native-web hard-codes a system font stack on text and the native
 * `Text.render` patch never runs (memo/forwardRef internals differ). So we
 * register one `Interlance` family whose weight slots point at lighter faces
 * (same one-tier-down map) and force it globally with `!important`.
 */
function injectWebFont() {
  try {
    // Expo Metro web serves project assets from this relative path; used as a
    // fallback because Image.resolveAssetSource throws on .ttf on web.
    const base = '/assets/?unstable_path=.%2Fassets%2Ffonts/';
    const uri = (m: any, file: string) => {
      try {
        const s = Image.resolveAssetSource(m);
        if (s && s.uri) return s.uri;
      } catch {
        /* fall through */
      }
      return base + file;
    };
    const r400 = uri(fontAssets['PlusJakartaSans-Regular'], 'PlusJakartaSans-400.ttf');
    const r500 = uri(fontAssets['PlusJakartaSans-Medium'], 'PlusJakartaSans-500.ttf');
    const r600 = uri(fontAssets['PlusJakartaSans-SemiBold'], 'PlusJakartaSans-600.ttf');
    const faces: { w: number; src: string }[] = [
      { w: 300, src: r400 },
      { w: 400, src: r400 },
      { w: 500, src: r400 }, // 500 -> Regular
      { w: 600, src: r500 }, // 600 -> Medium
      { w: 700, src: r600 }, // 700 -> SemiBold
      { w: 800, src: r600 }, // 800 -> SemiBold (cap)
      { w: 900, src: r600 }
    ];
    const css =
      faces
        .map(
          (f) =>
            `@font-face{font-family:'Interlance';font-style:normal;font-weight:${f.w};font-display:swap;src:url("${f.src}") format('truetype');}`
        )
        .join('\n') +
      `\n*{font-family:'Interlance',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif !important;}`;
    const el = document.createElement('style');
    el.setAttribute('data-interlance-font', '');
    el.appendChild(document.createTextNode(css));
    document.head.appendChild(el);
  } catch {
    /* no-op */
  }
}

function patchNative(Comp: any) {
  const holder =
    typeof Comp?.render === 'function'
      ? Comp
      : typeof Comp?.type?.render === 'function'
        ? Comp.type
        : null;
  if (holder) {
    const orig = holder.render;
    holder.render = function render(...args: any[]) {
      const el = orig.apply(this, args);
      const flat = (StyleSheet.flatten(el.props.style) || {}) as any;
      const family = weightToFamily[String(flat.fontWeight)] || fonts.regular;
      return React.cloneElement(el, { style: [el.props.style, { fontFamily: family, fontWeight: 'normal' }] });
    };
    return;
  }
  Comp.defaultProps = Comp.defaultProps || {};
  Comp.defaultProps.style = [{ fontFamily: fonts.regular }, Comp.defaultProps.style];
}
