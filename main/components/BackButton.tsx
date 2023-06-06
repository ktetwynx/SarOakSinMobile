import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ThemeContext} from '../utility/ThemeProvider';
import Animated, {
  FadeOut,
  FadeInDown,
  FadeOutDown,
  SlideInRight,
  SlideOutRight,
  SlideInLeft,
  FadeInLeft,
  BounceIn,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
export interface AppProps {
  clickedGoBack: Function;
  style?: any;
}

export function BackButton(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    // <Animated.View entering={SlideInUp.delay(1000)}>
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
    // </Animated.View>
  );
}
