import * as React from 'react';
import {View, Text, TouchableOpacity, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface Props {
  clickedImage: Function;
  style: ViewStyle;
  iconSize: number;
  borderRadius: number;
  borderWidth: number;
  animationObject: {iterationCount: number | 'infinite'; animation: string};
  //   iterationCount: number | 'infinite';
  //   animation: string;
}

export function ImageModeButton(props: Props) {
  const [animationObjectForSwing, setAnimationObjectForSwing] = React.useState(
    props.animationObject,
  );

  React.useEffect(() => {
    setAnimationObjectForSwing(props.animationObject);
  }, [props]);

  return (
    <Animatable.View
      iterationCount={animationObjectForSwing.iterationCount}
      // onAnimationEnd={() => {
      //   animationObjectForSwing.animation == 'fadeInUp' &&
      //     setAnimationObjectForSwing({
      //       animation: 'swing',
      //       iterationCount: 'infinite',
      //     });
      // }}
      animation={animationObjectForSwing.animation}
      useNativeDriver={true}
      style={props.style}>
      <TouchableOpacity
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
        onPress={() => props.clickedImage()}>
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
        <FontAwesome
          style={{
            borderRadius: props.borderRadius,
            // padding: 5,
            borderColor: 'white',
          }}
          name={'image'}
          size={props.iconSize}
          color={GeneralColor.white}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
}
