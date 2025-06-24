import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './style';

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
