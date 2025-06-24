import { ImageProps, ImageSourcePropType, StyleProp, ViewStyle, ImageStyle } from 'react-native';

export interface LogoProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  alt?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ImageStyle>;
}
