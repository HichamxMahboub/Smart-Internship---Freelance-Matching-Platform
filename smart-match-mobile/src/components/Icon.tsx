import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Pure-RN icon set (no SVG / vector-icons dependency available).
 * Icons are composed from filled View primitives so they tint cleanly
 * and stay crisp on any platform. `bg` is the colour used for negative
 * space details (defaults to white — the colour of the surface behind).
 */
export type IconName =
  | 'home'
  | 'briefcase'
  | 'document'
  | 'bookmark'
  | 'chat'
  | 'bell'
  | 'user'
  | 'building'
  | 'search'
  | 'plus'
  | 'sparkles'
  | 'star'
  | 'check'
  | 'send'
  | 'chevron-right'
  | 'chevron-left'
  | 'logout'
  | 'location'
  | 'clock'
  | 'edit'
  | 'close'
  | 'filter'
  | 'globe'
  | 'shield'
  | 'mail';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  bg?: string;
}

export function Icon({ name, size = 24, color = colors.text, bg = colors.white }: Props) {
  const s = size;
  const stroke = Math.max(2, Math.round(s * 0.1));
  const box = { width: s, height: s, alignItems: 'center' as const, justifyContent: 'center' as const };

  const bar = (w: number, h: number, extra?: object) => (
    <View style={[{ width: w, height: h, backgroundColor: color, borderRadius: stroke }, extra]} />
  );

  switch (name) {
    case 'home': {
      const base = s * 0.52;
      return (
        <View style={box}>
          {/* roof */}
          <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.5, borderRightWidth: s * 0.5, borderBottomWidth: s * 0.4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
          {/* body */}
          <View style={{ width: base, height: base * 0.78, backgroundColor: color, borderBottomLeftRadius: stroke, borderBottomRightRadius: stroke, marginTop: -1, alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* door */}
            <View style={{ width: base * 0.3, height: base * 0.42, backgroundColor: bg, borderTopLeftRadius: stroke, borderTopRightRadius: stroke }} />
          </View>
        </View>
      );
    }
    case 'briefcase': {
      const w = s * 0.86;
      const h = s * 0.6;
      const handleW = s * 0.34;
      return (
        <View style={box}>
          {/* handle */}
          <View style={{ width: handleW, height: s * 0.18, borderWidth: stroke, borderColor: color, borderTopLeftRadius: stroke * 1.4, borderTopRightRadius: stroke * 1.4, borderBottomWidth: 0, marginBottom: -1 }} />
          {/* body */}
          <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke * 1.4, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: w, height: stroke * 1.6, backgroundColor: bg }}>
              <View style={{ position: 'absolute', alignSelf: 'center', top: -stroke * 0.4, width: s * 0.16, height: stroke * 2.4, borderRadius: stroke, backgroundColor: color }} />
            </View>
          </View>
        </View>
      );
    }
    case 'document': {
      const w = s * 0.66;
      const h = s * 0.84;
      return (
        <View style={box}>
          <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke * 1.2, paddingHorizontal: w * 0.16, justifyContent: 'center', gap: stroke * 0.9 }}>
            {[0.82, 0.82, 0.55].map((f, i) => (
              <View key={i} style={{ width: w * 0.68 * f, height: stroke, backgroundColor: bg, borderRadius: stroke }} />
            ))}
          </View>
        </View>
      );
    }
    case 'bookmark': {
      const w = s * 0.58;
      const h = s * 0.82;
      return (
        <View style={box}>
          <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* notch */}
            <View style={{ width: 0, height: 0, borderLeftWidth: w / 2, borderRightWidth: w / 2, borderBottomWidth: h * 0.34, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: bg }} />
          </View>
        </View>
      );
    }
    case 'chat': {
      const w = s * 0.84;
      const h = s * 0.66;
      return (
        <View style={box}>
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke * 1.6, justifyContent: 'center', gap: stroke * 0.7, paddingHorizontal: w * 0.18 }}>
              {[0.7, 0.45].map((f, i) => (
                <View key={i} style={{ width: w * f, height: stroke, backgroundColor: bg, borderRadius: stroke }} />
              ))}
            </View>
            <View style={{ width: 0, height: 0, borderTopWidth: s * 0.2, borderRightWidth: s * 0.22, borderTopColor: color, borderRightColor: 'transparent', marginLeft: w * 0.16, marginTop: -1 }} />
          </View>
        </View>
      );
    }
    case 'bell': {
      const w = s * 0.62;
      return (
        <View style={box}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: w, height: s * 0.56, backgroundColor: color, borderTopLeftRadius: w, borderTopRightRadius: w, borderBottomLeftRadius: stroke, borderBottomRightRadius: stroke }} />
            <View style={{ width: w * 1.32, height: stroke * 1.2, backgroundColor: color, borderRadius: stroke, marginTop: 1 }} />
            <View style={{ width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08, backgroundColor: color, marginTop: 1 }} />
          </View>
        </View>
      );
    }
    case 'user': {
      const head = s * 0.36;
      const body = s * 0.62;
      return (
        <View style={box}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: head, height: head, borderRadius: head / 2, backgroundColor: color }} />
            <View style={{ width: body, height: body * 0.5, borderTopLeftRadius: body, borderTopRightRadius: body, backgroundColor: color, marginTop: s * 0.06 }} />
          </View>
        </View>
      );
    }
    case 'building': {
      const w = s * 0.64;
      const h = s * 0.84;
      return (
        <View style={box}>
          <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke, padding: w * 0.16, flexDirection: 'row', flexWrap: 'wrap', gap: w * 0.12, alignContent: 'flex-start' }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ width: w * 0.18, height: w * 0.18, backgroundColor: bg, borderRadius: 1 }} />
            ))}
          </View>
        </View>
      );
    }
    case 'search': {
      const d = s * 0.56;
      return (
        <View style={box}>
          <View style={{ width: s * 0.86, height: s * 0.86, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <View style={{ width: d, height: d, borderRadius: d / 2, borderWidth: stroke, borderColor: color }} />
            <View style={{ position: 'absolute', right: 0, bottom: 0, width: s * 0.3, height: stroke, backgroundColor: color, borderRadius: stroke, transform: [{ rotate: '45deg' }] }} />
          </View>
        </View>
      );
    }
    case 'plus':
      return (
        <View style={box}>
          {bar(s * 0.72, stroke + 0.5)}
          <View style={{ position: 'absolute' }}>{bar(stroke + 0.5, s * 0.72)}</View>
        </View>
      );
    case 'close':
      return (
        <View style={box}>
          <View style={{ position: 'absolute', transform: [{ rotate: '45deg' }] }}>{bar(s * 0.72, stroke + 0.5)}</View>
          <View style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}>{bar(s * 0.72, stroke + 0.5)}</View>
        </View>
      );
    case 'check':
      // Classic border-corner tick — reliable on web + native (no transformOrigin).
      return (
        <View style={box}>
          <View style={{ width: s * 0.3, height: s * 0.52, borderColor: color, borderRightWidth: stroke, borderBottomWidth: stroke, transform: [{ rotate: '45deg' }], marginTop: -s * 0.06 }} />
        </View>
      );
    case 'chevron-right':
    case 'chevron-left': {
      const right = name === 'chevron-right';
      const len = s * 0.32;
      const edge = right ? { right: 0 } : { left: 0 };
      return (
        <View style={box}>
          <View style={{ width: len, height: len, transform: [{ rotate: `${right ? 45 : -45}deg` }] }}>
            <View style={{ position: 'absolute', top: 0, ...edge, width: stroke, height: len, backgroundColor: color, borderRadius: stroke }} />
            <View style={{ position: 'absolute', top: 0, ...edge, width: len, height: stroke, backgroundColor: color, borderRadius: stroke }} />
          </View>
        </View>
      );
    }
    case 'send': {
      return (
        <View style={box}>
          <View style={{ width: 0, height: 0, borderTopWidth: s * 0.32, borderBottomWidth: s * 0.32, borderLeftWidth: s * 0.62, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color, transform: [{ translateX: s * 0.08 }] }} />
        </View>
      );
    }
    case 'location': {
      const d = s * 0.6;
      return (
        <View style={box}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: d * 0.36, height: d * 0.36, borderRadius: d * 0.18, backgroundColor: bg }} />
            </View>
            <View style={{ width: d * 0.5, height: d * 0.5, backgroundColor: color, transform: [{ rotate: '45deg' }], marginTop: -d * 0.42, borderBottomRightRadius: 2 }} />
          </View>
        </View>
      );
    }
    case 'clock': {
      const d = s * 0.84;
      return (
        <View style={box}>
          <View style={{ width: d, height: d, borderRadius: d / 2, borderWidth: stroke, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: stroke, height: d * 0.26, backgroundColor: color, borderRadius: stroke, position: 'absolute', top: d * 0.18, transformOrigin: 'center bottom' as any }} />
            <View style={{ width: d * 0.22, height: stroke, backgroundColor: color, borderRadius: stroke, position: 'absolute', right: d * 0.22 }} />
          </View>
        </View>
      );
    }
    case 'edit': {
      return (
        <View style={box}>
          <View style={{ width: s * 0.62, height: s * 0.2, backgroundColor: color, borderRadius: stroke, transform: [{ rotate: '-45deg' }] }}>
            <View style={{ position: 'absolute', right: -stroke, top: stroke * 0.4, width: 0, height: 0, borderTopWidth: s * 0.1, borderBottomWidth: s * 0.1, borderLeftWidth: s * 0.12, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} />
          </View>
        </View>
      );
    }
    case 'logout': {
      return (
        <View style={box}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: s * 0.34, height: s * 0.74, borderWidth: stroke, borderColor: color, borderRightWidth: 0, borderTopLeftRadius: stroke, borderBottomLeftRadius: stroke }} />
            <View style={{ marginLeft: -stroke, alignItems: 'center' }}>
              <View style={{ width: s * 0.4, height: stroke, backgroundColor: color, borderRadius: stroke }} />
              <View style={{ position: 'absolute', right: -stroke * 0.5, width: s * 0.2, height: s * 0.2, borderTopWidth: stroke, borderRightWidth: stroke, borderColor: color, transform: [{ rotate: '45deg' }] }} />
            </View>
          </View>
        </View>
      );
    }
    case 'sparkles':
    case 'star': {
      // 4-point sparkle built from two crossed diamonds (reliable, distinctive).
      const big = s * 0.72;
      const small = s * 0.3;
      return (
        <View style={box}>
          <View style={{ width: big, height: big, backgroundColor: color, borderRadius: big * 0.18, transform: [{ rotate: '45deg' }, { scaleX: 0.42 }] }} />
          <View style={{ position: 'absolute', width: big, height: big, backgroundColor: color, borderRadius: big * 0.18, transform: [{ rotate: '45deg' }, { scaleY: 0.42 }] }} />
          {name === 'sparkles' ? (
            <View style={{ position: 'absolute', top: s * 0.04, right: s * 0.06 }}>
              <View style={{ width: small, height: small, backgroundColor: color, borderRadius: small * 0.2, transform: [{ rotate: '45deg' }, { scaleX: 0.4 }] }} />
              <View style={{ position: 'absolute', width: small, height: small, backgroundColor: color, borderRadius: small * 0.2, transform: [{ rotate: '45deg' }, { scaleY: 0.4 }] }} />
            </View>
          ) : null}
        </View>
      );
    }
    case 'filter': {
      return (
        <View style={box}>
          <View style={{ gap: s * 0.16 }}>
            {[0.2, 0.55].map((p, i) => (
              <View key={i} style={{ width: s * 0.72, height: stroke, backgroundColor: color, borderRadius: stroke, justifyContent: 'center' }}>
                <View style={{ width: stroke * 2, height: stroke * 2, borderRadius: stroke, backgroundColor: color, borderWidth: stroke * 0.6, borderColor: bg, marginLeft: s * 0.72 * p }} />
              </View>
            ))}
          </View>
        </View>
      );
    }
    case 'globe': {
      const d = s * 0.84;
      return (
        <View style={box}>
          <View style={{ width: d, height: d, borderRadius: d / 2, borderWidth: stroke, borderColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ width: d, height: stroke, backgroundColor: color }} />
            <View style={{ position: 'absolute', width: d * 0.5, height: d, borderWidth: stroke, borderColor: color, borderRadius: d / 2 }} />
          </View>
        </View>
      );
    }
    case 'shield': {
      const w = s * 0.66;
      return (
        <View style={box}>
          <View style={{ width: w, height: s * 0.5, backgroundColor: color, borderTopLeftRadius: stroke, borderTopRightRadius: stroke }} />
          <View style={{ width: 0, height: 0, borderLeftWidth: w / 2, borderRightWidth: w / 2, borderTopWidth: s * 0.32, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color, marginTop: -1 }} />
        </View>
      );
    }
    case 'mail': {
      const w = s * 0.84;
      const h = s * 0.62;
      return (
        <View style={box}>
          <View style={{ width: w, height: h, backgroundColor: color, borderRadius: stroke, overflow: 'hidden', alignItems: 'center' }}>
            <View style={{ width: w * 0.9, height: w * 0.9, borderTopWidth: stroke, borderRightWidth: stroke, borderColor: bg, transform: [{ rotate: '-45deg' }], marginTop: -w * 0.62 }} />
          </View>
        </View>
      );
    }
    default:
      return <View style={box} />;
  }
}

export const iconStyles = StyleSheet.create({});
