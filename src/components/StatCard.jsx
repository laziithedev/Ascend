import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { T } from '../tokens';

export default function StatCard({ value, label, delta, deltaUp, color = T.blue }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {delta && (
        <View style={styles.deltaRow}>
          {deltaUp
            ? <TrendingUp size={10} color={T.teal} />
            : <TrendingDown size={10} color={T.error} />
          }
          <Text style={[styles.delta, { color: deltaUp ? T.teal : T.error }]}>{delta}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.s1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
  },
  value: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 4,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: T.fg3,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },
  delta: {
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
  },
});
