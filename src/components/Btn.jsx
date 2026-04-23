import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { T } from '../tokens';

const sizes = {
  sm: { fontSize: 11, paddingHorizontal: 12, paddingVertical: 6,  borderRadius: 7  },
  md: { fontSize: 13, paddingHorizontal: 18, paddingVertical: 9,  borderRadius: 8  },
  lg: { fontSize: 15, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 10 },
};

const variants = {
  primary:   { bg: T.blue,        color: '#fff',  border: null },
  secondary: { bg: T.s2,          color: T.fg1,   border: 'rgba(255,255,255,0.10)' },
  ghost:     { bg: 'transparent', color: T.blue,  border: T.blue },
  teal:      { bg: T.teal,        color: T.bg,    border: null },
  gold:      { bg: T.gold,        color: T.bg,    border: null },
  danger:    { bg: 'transparent', color: T.error, border: T.error },
  subtle:    { bg: T.blue + '1A', color: T.blue,  border: null },
};

export default function Btn({ variant = 'primary', size = 'md', children, onPress, full, style, disabled }) {
  const v = variants[variant];
  const s = sizes[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={!disabled ? handlePress : undefined}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderRadius: s.borderRadius, paddingHorizontal: s.paddingHorizontal, paddingVertical: s.paddingVertical },
        v.border && { borderWidth: 1, borderColor: v.border },
        full && { width: '100%' },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize: s.fontSize, color: v.color }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
  },
});
