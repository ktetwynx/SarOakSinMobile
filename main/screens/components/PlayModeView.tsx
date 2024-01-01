import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import {GeneralColor} from '../../utility/Themes';
import {API_URL} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import * as Animatable from 'react-native-animatable';

export interface Props {
  item: any;
  clickedPlayMode: Function;
  viewStyle: ViewStyle;
  imageStyle: ImageStyle;
}

export function PlayModeView(props: Props) {
  const animationForScreen = 'fadeInUp';
  //{flexDirection: 'column', marginRight: 12}
  //{ width: 140, height: 140, backgroundColor: GeneralColor.light_grey, borderRadius: 15}
  return (
    <Animatable.View
      style={props.viewStyle}
      useNativeDriver={true}
      animation={animationForScreen}>
      <TouchableOpacity
        disabled={props.item?.item?.name ? false : true}
        onPress={() => props.clickedPlayMode(props.item)}>
        <Image
          style={props.imageStyle}
          source={{uri: API_URL + props.item.item.imgPath}}
        />
        <TextView
          text={props.item.item.name}
          numberOfLines={2}
          textStyle={{
            textAlign: 'center',
            alignSelf: 'center',
            marginTop: 6,
            fontSize: 16,
            width: 140,
          }}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
}
