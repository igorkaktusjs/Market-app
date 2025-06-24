import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ResetZoomButtonProps { 
  style?: ViewStyle;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const ResetZoomButton: React.FC<ResetZoomButtonProps> = ({ title, style, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        style,
        disabled && styles.buttonDisabled
      ]}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default ResetZoomButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
     
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    backgroundColor: '#171A1F',
  },
  buttonDisabled: {
    backgroundColor: '#9095A1',
  },
  text: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 14,
  },
  textDisabled: {
    color: '#fff',
    opacity: 0.5, 
  },
});
