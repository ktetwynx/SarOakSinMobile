import React, {useEffect, useState} from 'react';
import {StyleSheet, useColorScheme} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import store, {persistor} from './main/redux';
import Route from './main/route/Route';
import ThemeProvider from './main/utility/ThemeProvider';
import SplashScreen from 'react-native-splash-screen';
import mobileAds, {MaxAdContentRating} from 'react-native-google-mobile-ads';
import {PersistGate} from 'redux-persist/integration/react';

const linking: any = {
  prefixes: ['saroaksin://'],
  config: {
    initialRouteName: 'LandingScreen',
    screens: {
      LandingScreen: {
        path: 'landingScreen',
      },
      BookDetailScreen: {
        path: 'bookDetailScreen/:bookId',
      },
      AlbumScreen: {
        path: 'albumScreen/:albumId',
      },
      AuthorScreen: {
        path: 'authorScreen/:authorType/:authorId',
      },
      LyricTextScreen: {
        path: 'lyricTextScreen/:currentPlayModeIndex/:isComeFromLyricScreen/:lyricTextId',
      },
    },
  },
};

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      initApp();
    }, 1000);
  }, []);

  const initApp = async () => {
    await mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: true,
        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: true,
        // An array of test device IDs to allow.
        testDeviceIdentifiers: ['EMULATOR'],
      })
      .then(() => {
        console.log('Request config successfully set!');
      });
    const adapterStatuses = await mobileAds().initialize();
    console.log(adapterStatuses);
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ThemeProvider>
          {/* fallback={<LoadingScreen />} */}
          <NavigationContainer linking={linking}>
            <Route />
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
