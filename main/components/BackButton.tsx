import React, {useContext} from 'react';
import {TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
      style={{alignSelf: 'flex-start'}}
      onPress={() => props.clickedGoBack()}>
      <Ionicons
        name="ios-arrow-back-circle-sharp"
        size={40}
        color={GeneralColor.app_theme}
        style={props.style != null ? props.style : {alignSelf: 'center'}}
      />
    </TouchableOpacity>
  );
}
