import * as React from 'react';
import {View, Text, TouchableOpacity, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface Props {
  clickedIcon: Function;
  style: ViewStyle;
  iconSize: number;
  borderRadius: number;
  iconName: string;
  iconMarginRight: number;
  iconMarginLeft: number;
  animation: string;
}

export function IconButton(props: Props) {
  const [animationForInOut, setAnimationForInOut] = React.useState(
    props.animation,
  );
  return (
    <Animatable.View
      animation={props.animation}
      duration={800}
      useNativeDriver={true}
      style={props.style}>
      <TouchableOpacity
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
        onPress={() => props.clickedIcon()}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: GeneralColor.black,
            opacity: 0.7,
            position: 'absolute',
            borderRadius: props.borderRadius,
          }}
        />
        <View
          style={{
            width: '90%',
            height: '90%',
            position: 'absolute',
            borderRadius: props.borderRadius,
          }}
        />
        <FontAwesome
          style={{
            borderRadius: props.borderRadius,
            marginRight: props.iconMarginRight,
            marginLeft: props.iconMarginLeft,
          }}
          name={props.iconName}
          size={props.iconSize}
          color={GeneralColor.white}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
}
