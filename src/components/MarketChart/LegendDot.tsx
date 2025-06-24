import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface LegendDotProps {
  label: string;
  color: string;
}

const LegendDot: React.FC<LegendDotProps> = ({ label, color }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

export default LegendDot;

export const styles = StyleSheet.create({
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
  },
});