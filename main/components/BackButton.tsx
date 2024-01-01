import React, {useContext} from 'react';
import {TouchableOpacity, View} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';
export interface AppProps {
  clickedGoBack: Function;
  style?: any;
}

export function BackButton(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <TouchableOpacity
      style={{
        backgroundColor: GeneralColor.app_theme,
        width: 38,
        height: 38,
        borderRadius: 30,
        justifyContent: 'center',
        alignContent: 'center',
        borderWidth: 3,
        borderColor: GeneralColor.white,
        ...props.style,
      }}
      onPress={() => props.clickedGoBack()}>
      <Octicons
        name="arrow-left"
        size={25}
        style={{alignSelf: 'center'}}
        color={GeneralColor.white}
      />
    </TouchableOpacity>
  );
}
