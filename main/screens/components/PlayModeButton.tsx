import * as React from 'react';
import {View, Text, TouchableOpacity, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface Props {
  clickedPlayLyric: Function;
  style: ViewStyle;
  iconSize: number;
  borderRadius: number;
  borderWidth: number;
}

export function PlayModeButton(props: Props) {
  return (
    <Animatable.View
      iterationCount="infinite"
      animation="swing"
      useNativeDriver={true}
      style={props.style}>
      <TouchableOpacity
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
        onPress={() => props.clickedPlayLyric()}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: GeneralColor.black,
            opacity: 0.3,
            position: 'absolute',
            borderRadius: props.borderRadius,
          }}
        />
        <View
          style={{
            width: '90%',
            height: '90%',
            backgroundColor: GeneralColor.app_theme,
            position: 'absolute',
            borderRadius: props.borderRadius,
            borderWidth: props.borderWidth,
            borderColor: 'white',
          }}
        />
        <AntDesign
          style={{
            borderRadius: props.borderRadius,
            // padding: 5,
            borderColor: 'white',
          }}
          name={'play'}
          size={props.iconSize}
          color={GeneralColor.white}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
}
