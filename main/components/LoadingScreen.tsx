import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import {DotIndicator} from 'react-native-indicators';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';

export interface AppProps {}

export function LoadingScreen(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme, updateTheme} = context;
  return (
    <View
      style={{
        zIndex: 100,
        width: '100%',
        height: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        backgroundColor: GeneralColor.black,
      }}>
      <DotIndicator size={8} color={GeneralColor.app_theme} />
    </View>
  );
}
