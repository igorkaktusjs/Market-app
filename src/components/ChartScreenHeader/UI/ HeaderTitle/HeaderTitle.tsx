import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { HeaderTitleProps } from './types';

import { useColorScheme } from 'react-native';

const HeaderTitle: React.FC<HeaderTitleProps> = ({
  text,
  style,
  ...rest
}) => {

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text
      style={[
        styles.title,
        { color: isDark ? '#FFF' : '#111' },
        style,
      ]}
      accessibilityRole="header"
      numberOfLines={1}
      ellipsizeMode="tail"
      {...rest}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 16
    }
})

export default HeaderTitle;
