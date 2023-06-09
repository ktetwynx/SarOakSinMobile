import React, {useContext} from 'react';
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

const Tab = createBottomTabNavigator<RootTabParamList>();
export function LandingScreen() {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: theme.backgroundColor1,
          borderTopWidth: 0,
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
              color={focused ? GeneralColor.app_theme : theme.backgroundColor3}
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
              color={focused ? GeneralColor.app_theme : theme.backgroundColor3}
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
              color={focused ? GeneralColor.app_theme : theme.backgroundColor3}
              style={{alignSelf: 'center'}}
            />
          ),
        }}
        name="ProfileScreen"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}
