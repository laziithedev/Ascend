import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { T } from '../tokens';

export default function Badge({ color = T.blue, bg, children, style }) {
  return (
    <View style={[styles.wrap, { backgroundColor: bg || color + '22' }, style]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 9,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
