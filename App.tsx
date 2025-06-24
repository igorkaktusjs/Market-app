import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';


import ChartScreen from './src/screen/ChartScreen';
import { store } from './src/store'; 



export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <ChartScreen />
      </SafeAreaView>
    </Provider>
  </GestureHandlerRootView>
  );
}
