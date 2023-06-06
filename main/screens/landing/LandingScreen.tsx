import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BooksScreen} from '../books/BooksScreen';
import {SafeAreaView} from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootTabParamList} from '../../route/StackParamsTypes';
import ProfileScreen from '../profile/ProfileScreen';
import {ThemeContext} from '../../utility/ThemeProvider';
import LyricsScreen from '../lyrics/LyricsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
export function LandingScreen() {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    // <SafeAreaView
    //   edges={['top']}
    //   style={{flex: 1, backgroundColor: theme.backgroundColor}}>
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.backgroundColor1,
        },
      }}
      initialRouteName="BooksScreen">
      <Tab.Screen
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({color}) => (
            <FontAwesome
              name="book"
              size={30}
              color={color}
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
          tabBarIcon: ({color}) => (
            <Entypo
              name="folder-music"
              size={30}
              color={color}
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
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={30}
              color={color}
              style={{alignSelf: 'center'}}
            />
          ),
        }}
        name="ProfileScreen"
        component={ProfileScreen}
      />
    </Tab.Navigator>
    // </SafeAreaView>
  );
}
