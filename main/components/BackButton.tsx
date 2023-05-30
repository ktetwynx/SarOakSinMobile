import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ThemeContext} from '../utility/ThemeProvider';
export interface AppProps {
  clickedGoBack: Function;
  style?: ViewStyle;
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
        color={theme.backgroundColor2}
        style={props.style != null ? props.style : {alignSelf: 'center'}}
      />
    </TouchableOpacity>
  );
}
