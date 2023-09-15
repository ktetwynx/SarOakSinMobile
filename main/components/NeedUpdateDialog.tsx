import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Text, TouchableOpacity, Image, Dimensions} from 'react-native';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeOut,
  FadeInDown,
  BounceInUp,
} from 'react-native-reanimated';
import {BounceIn} from 'react-native-reanimated';
import {BounceOut} from 'react-native-reanimated';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';
import {TextView} from './TextView';

export interface AppProps {
  isVisible: boolean;
  text: string;
  clickedUpdate: any;
}

export function NeedUpdateDialog(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const {width, height} = Dimensions.get('screen');

  const clickedUpdate = useCallback(() => {}, []);

  return (
    <Modal
      useNativeDriver={true}
      deviceWidth={width}
      deviceHeight={height}
      hideModalContentWhileAnimating={true}
      animationIn={'bounceIn'}
      animationOut={'bounceOut'}
      hasBackdrop={true}
      onBackdropPress={() => {}}
      isVisible={props.isVisible}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            backgroundColor: theme.backgroundColor,
            width: '80%',
            padding: 12,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 28,
          }}>
          <Image
            style={{
              width: 200,
              height: 200,
              justifyContent: 'center',
              alignItems: 'center',
              resizeMode: 'contain',
            }}
            source={require('../assets/images/need_update.png')}
          />

          <View>
            <TextView
              textStyle={{fontSize: 20, fontWeight: 'bold', marginTop: 30}}
              text={props.text}
            />
          </View>

          <TouchableOpacity
            onPress={props.clickedUpdate}
            style={{
              width: 120,
              height: 40,
              marginTop: 16,
              borderRadius: 50,
              backgroundColor: GeneralColor.app_theme,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextView
              text={'Update'}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: GeneralColor.white,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
