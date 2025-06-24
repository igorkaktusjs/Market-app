import React from 'react';
import { StyleSheet, View, ScrollView, Button } from 'react-native';
import ChartScreenHeader from '../components/ChartScreenHeader/ChartScreenHeader';
import DisplayOptions from '../components/DisplayOptions/DisplayOptions';
import MarketChart from '../components/MarketChart/MarketChart'


const ChartScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChartScreenHeader />

        <View style={styles.section}>
            <MarketChart/>
        </View>

        <View style={styles.section}>
          <DisplayOptions />
        </View>

      </ScrollView>
    </View>
  );
};

export default ChartScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    section: {
        
    },
  });