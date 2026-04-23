import React from 'react';
import { Pressable, Text } from 'react-native';
import { T } from '../tokens';

export default function Chip({ label, active, color = T.blue, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: active ? color + '22' : T.s2,
        borderWidth: 1,
        borderColor: active ? color + '55' : 'transparent',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={{ fontSize: 12, fontFamily: 'DMSans_500Medium', color: active ? color : T.fg3 }}>
        {label}
      </Text>
    </Pressable>
  );
}
