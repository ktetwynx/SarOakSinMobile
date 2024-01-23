import React, {useContext, useEffect} from 'react';
import {View, Text, TouchableOpacity, Platform, ViewStyle} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {TextView} from './TextView';
import * as Animatable from 'react-native-animatable';
import i18n from '../language/i18n';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';

interface Props {
  clickedViewMore: Function;
  style: ViewStyle;
  borderRadius: number;
  animation: string;
}

export function ViewMoreButton1(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [label, setLabel] = React.useState({
    viewMore: i18n.t('view_more'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        viewMore: i18n.t('view_more'),
      });
    });
    return unsubscribe;
  }, []);

  return (
    <Animatable.View
      animation={props.animation}
      duration={800}
      useNativeDriver={true}
      style={props.style}>
      <TouchableOpacity
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
        onPress={() => props.clickedViewMore()}>
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
            flexDirection: 'row',
          }}>
          <TextView
            numberOfLines={2}
            text={label.viewMore}
            textStyle={{
              marginRight: 4,
              color: GeneralColor.white,
              fontWeight: 'bold',
              fontSize: 14,
              maxWidth: 55,
            }}
          />
          <AntDesign
            name="caretright"
            size={15}
            color={GeneralColor.app_theme}
            style={{alignSelf: 'center'}}
          />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}
