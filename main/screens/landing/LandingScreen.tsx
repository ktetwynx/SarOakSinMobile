import React, {useCallback, useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BooksScreen} from '../books/BooksScreen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootTabParamList} from '../../route/StackParamsTypes';
import ProfileScreen from '../profile/ProfileScreen';
import {ThemeContext} from '../../utility/ThemeProvider';
import LyricsScreen from '../lyrics/LyricsScreen';
import {GeneralColor} from '../../utility/Themes';
import {Linking, View} from 'react-native';
import {checkVersion} from 'react-native-check-version';
import Route from '../../route/Route';
import {NeedUpdateDialog} from '../../components/NeedUpdateDialog';

const Tab = createBottomTabNavigator<RootTabParamList>();
export function LandingScreen() {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [isShowNeedUpdate, setIsShowNeedUpdate] = useState<boolean>(false);

  useEffect(() => {
    checkVersionForApp();
  }, []);

  const checkVersionForApp = async () => {
    const version = await checkVersion();
    console.log('checkVersionForApp', version.needsUpdate);
    if (version.needsUpdate) {
      setStoreUrl(version.url);
      setIsShowNeedUpdate(true);
    }
  };

  const clickedUpdate = useCallback(() => {
    if (storeUrl != '' && storeUrl != null) {
      Linking.canOpenURL(storeUrl).then(isSupported => {
        if (isSupported) {
          Linking.openURL(storeUrl);
        }
      });
    }
  }, [storeUrl]);

  return (
    <View style={{width: '100%', height: '100%'}}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            position: 'absolute',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            backgroundColor: theme.backgroundColor1,
            borderTopWidth: 0,
            overflow: 'hidden',
          },
        }}
        initialRouteName="BooksScreen">
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({color, focused}) => (
              <FontAwesome
                name="book"
                size={30}
                color={
                  focused ? GeneralColor.app_theme : theme.backgroundColor3
                }
                style={{alignSelf: 'center'}}
              />
            ),
          }}
          name="BooksScreen"
          component={BooksScreen}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({color, focused}) => (
              <Entypo
                name="folder-music"
                size={30}
                color={
                  focused ? GeneralColor.app_theme : theme.backgroundColor3
                }
                style={{alignSelf: 'center'}}
              />
            ),
          }}
          name="LyricsScreen"
          component={LyricsScreen}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({color, focused}) => (
              <MaterialCommunityIcons
                name="account-circle"
                size={30}
                color={
                  focused ? GeneralColor.app_theme : theme.backgroundColor3
                }
                style={{alignSelf: 'center'}}
              />
            ),
          }}
          name="ProfileScreen"
          component={ProfileScreen}
        />
      </Tab.Navigator>
      <NeedUpdateDialog
        clickedUpdate={clickedUpdate}
        isVisible={isShowNeedUpdate}
        text={'Update Available!'}
      />
    </View>
  );
}
