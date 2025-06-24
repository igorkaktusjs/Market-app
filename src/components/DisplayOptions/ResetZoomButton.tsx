import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setZoom } from '../../store/displaySlice'; 
import { RootState } from '../../store'; 

interface ZoomButtonProps { 
  style?: ViewStyle;
  title: string;
  onPress: () => void;
}

const ResetZoomButton: React.FC<ZoomButtonProps> = ({title, style }) => {
  const dispatch = useDispatch();
  const zoomed = useSelector((state: RootState) => state.display.zoomed); 

  const handleZoomIn = () => {
    if (zoomed) {
      dispatch(setZoom(true)); 
    }
  };

  return (
    <TouchableOpacity
      onPress={handleZoomIn}
      style={[
        styles.button,
        style,
        zoomed && styles.buttonDisabled 
      ]}
      activeOpacity={0.8}
      disabled={!zoomed} 
    >
      <Text style={[styles.text, zoomed && styles.textDisabled]}>
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
    backgroundColor: '#9095A1', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#171A1F',
  },
  text: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 14,
  },
  textDisabled: {
    color: '#fff', 
  },
});