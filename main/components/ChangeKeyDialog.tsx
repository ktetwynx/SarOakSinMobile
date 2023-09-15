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
  clickedChangeKey: Function;
  clickedChangedShardFlat: Function;
  clickedClosed: Function;
  currentKey: string;
  shardOrFlat: string;
}

export function ChangeKeyDialog(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const {width, height} = Dimensions.get('screen');
  const [currentKey, setCurrentKey] = useState('');
  const [forShowKey, setForShowKey] = useState('');
  const [shardOrFlat, setShardOrFlat] = useState('');
  const [keyList, setKeyList] = useState(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  const [shardFlatList, setShardFlatList] = useState(['#', 'b']);

  useEffect(() => {
    setCurrentKey(props.currentKey);
    setShardOrFlat(props.shardOrFlat);
  }, [props.currentKey]);

  useEffect(() => {
    if (shardOrFlat != '' || currentKey != '') {
      setForShowKey(`${currentKey}${shardOrFlat}`);
    }
  }, [shardOrFlat, currentKey]);

  return (
    <Modal
      useNativeDriver={true}
      deviceWidth={width}
      deviceHeight={height}
      hideModalContentWhileAnimating={true}
      animationIn={'bounceIn'}
      animationOut={'fadeOut'}
      hasBackdrop={true}
      onBackdropPress={() => {
        props.clickedClosed();
      }}
      isVisible={props.isVisible}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            backgroundColor: theme.backgroundColor,
            width: '85%',
            padding: 10,
            borderRadius: 15,
            justifyContent: 'center',
            flexDirection: 'column',
            paddingVertical: 16,
          }}>
          <TextView
            text={`Key ${forShowKey}`}
            textStyle={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
              marginTop: 12,
              marginLeft: 6,
            }}
          />

          <TouchableOpacity
            style={{position: 'absolute', right: 10, top: 10}}
            onPress={() => props.clickedClosed()}>
            <MaterialCommunityIcons
              name="close-circle"
              size={25}
              color={GeneralColor.grey}
              style={{alignSelf: 'center', opacity: 0.7}}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {keyList.map((_, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.clickedChangeKey(_);
                    setCurrentKey(_);
                  }}
                  key={index}>
                  <TextView
                    textStyle={{
                      textAlign: 'center',
                      borderWidth: currentKey == _ ? 2 : 1,
                      borderRadius: 8,
                      fontSize: currentKey == _ ? 16 : 14,
                      fontWeight: currentKey == _ ? 'bold' : 'normal',
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      color: currentKey == _ ? GeneralColor.app_theme : 'grey',
                      borderColor:
                        currentKey == _ ? GeneralColor.app_theme : 'grey',
                    }}
                    text={_}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 16,
              alignSelf: 'center',
            }}>
            {shardFlatList.map((_, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (shardOrFlat != _) {
                      setShardOrFlat(_);
                      props.clickedChangedShardFlat(_);
                    } else {
                      setShardOrFlat('');
                      props.clickedChangedShardFlat('');
                    }
                  }}
                  key={index}
                  style={{marginRight: 12}}>
                  <TextView
                    textStyle={{
                      textAlign: 'center',
                      borderWidth: shardOrFlat == _ ? 2 : 1,
                      borderRadius: 8,
                      fontSize: shardOrFlat == _ ? 16 : 14,
                      fontWeight: shardOrFlat == _ ? 'bold' : 'normal',
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      color: shardOrFlat == _ ? GeneralColor.app_theme : 'grey',
                      borderColor:
                        shardOrFlat == _ ? GeneralColor.app_theme : 'grey',
                    }}
                    text={_}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
