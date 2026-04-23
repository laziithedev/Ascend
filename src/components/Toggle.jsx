import React from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { T } from '../tokens';

export default function Toggle({ value, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.track, { backgroundColor: value ? T.teal : T.s3, borderColor: value ? T.teal : 'rgba(255,255,255,0.08)' }]}
    >
      <Animated.View style={[styles.thumb, { left: value ? 21 : 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
