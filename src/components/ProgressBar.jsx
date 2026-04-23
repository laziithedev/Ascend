import React from 'react';
import { View, StyleSheet } from 'react-native';
import { T } from '../tokens';

export default function ProgressBar({ value = 0, color = T.blue, height = 6, glow = false }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[
        styles.fill,
        { width: `${pct}%`, backgroundColor: color, height },
        glow && { shadowColor: color, shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#252540',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
