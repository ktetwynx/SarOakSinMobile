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
  isPlaying?: boolean;
  isLyricTextScreen?: boolean;
}

export function PlayModeButton({
  isLyricTextScreen = false,
  isPlaying,
  borderWidth,
  borderRadius,
  iconSize,
  style,
  clickedPlayLyric,
}: Props) {
  return (
    <Animatable.View
      iterationCount={'infinite'}
      animation={isPlaying ? undefined : 'swing'}
      useNativeDriver={true}
      style={style}>
      <TouchableOpacity
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
        onPress={() => clickedPlayLyric()}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: GeneralColor.black,
            opacity: 0.3,
            position: 'absolute',
            borderRadius: borderRadius,
          }}
        />
        <View
          style={{
            width: '90%',
            height: '90%',
            backgroundColor: isLyricTextScreen
              ? isPlaying
                ? GeneralColor.light_grey
                : GeneralColor.green
              : GeneralColor.app_theme,
            position: 'absolute',
            borderRadius: borderRadius,
            borderWidth: borderWidth,
            borderColor: 'white',
          }}
        />
        <AntDesign
          style={{
            borderRadius: borderRadius,
            // padding: 5,
            borderColor: 'white',
          }}
          name={'play'}
          size={iconSize}
          color={GeneralColor.white}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
}
