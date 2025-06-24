import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Logo from '../ChartScreenHeader/UI/Logo/Logo';
import HeaderTitle from '../ChartScreenHeader/UI/ HeaderTitle/HeaderTitle';

const ChartScreenHeader = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111' : '#fff' }]}>
      <Logo
        source={require('../../../assets/AppleLogo.jpg')}
        alt="Apple logo"
        style={styles.logo}
        resizeMode="contain"
      />
      <HeaderTitle
        text="AAPL Market Data"
        style={styles.title}
      />
    </View>
  );
};

export default ChartScreenHeader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  logo: {
    borderRadius: 8,
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 24,
    flex: 1,
    textAlign: 'right',
  },
});
