import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Text} from 'react-native';
import Modal from 'react-native-modal';
import {ThemeContext} from '../../utility/ThemeProvider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {GeneralColor} from '../../utility/Themes';
import {TextView} from '../../components/TextView';
import Animated, {
  FadeOut,
  FadeInDown,
  BounceInUp,
} from 'react-native-reanimated';
import {BounceIn} from 'react-native-reanimated';
import {BounceOut} from 'react-native-reanimated';

export interface AppProps {
  isVisible: boolean;
  text: string;
}

export function SuccessfulDialog(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <Modal
      useNativeDriver={true}
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
          <Animated.View
            entering={BounceIn.duration(600)}
            exiting={BounceOut.duration(600)}
            style={{
              width: 80,
              height: 80,
              borderRadius: 50,
              backgroundColor: 'green',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <MaterialIcons
              name="done"
              size={40}
              color={GeneralColor.white}
              style={{alignSelf: 'center'}}
            />
          </Animated.View>
          <Animated.View
            entering={BounceIn.duration(600).delay(600)}
            exiting={BounceOut.duration(600).delay(600)}>
            <TextView
              textStyle={{fontSize: 20, fontWeight: 'bold', marginTop: 20}}
              text={props.text}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
