import { StyleSheet, View, Image} from 'react-native'
import React from 'react';
import { LogoProps } from './types';

const Logo: React.FC<LogoProps> = ({
  source,
  alt = 'App logo',
  style,
  containerStyle,
  accessibilityLabel,
  ...rest

})  => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image 
        source={source}
        style={[styles.logo,style]}
        accessibilityLabel={accessibilityLabel || alt}
        accessibilityRole="image"
        {...rest}/>
    </View>
  )
}

export default Logo

const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo:{
      width: 40,
      height: 40,
      resizeMode: 'contain',
    }
})