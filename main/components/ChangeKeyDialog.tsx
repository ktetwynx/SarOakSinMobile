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
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from '@react-native-community/slider';

export interface AppProps {
  isVisible: boolean;
  clickedClosed: Function;
  orignalKey: string;
  clickedChangeFont: Function;
  clickedChangedScrollSpeed: Function;
  currentLyricFontSize: string;
  currentScrollSpeed: string;
  sliderOnValueChange: Function;
  currentTransposeKey: number;
}

export function ChangeKeyDialog(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const {width, height} = Dimensions.get('screen');
  const [originalKey, setOriginalKey] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState(['Slow', 'Medium', 'Fast']);
  const [fontSize, setFontSize] = useState(['14', '16', '18', '20']);
  const [transposeNumber, setTransposeNumber] = useState<number>(0);

  useEffect(() => {
    setOriginalKey(props.orignalKey);
    setTransposeNumber(props.currentTransposeKey);
  }, [props.orignalKey]);

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
          backgroundColor: theme.backgroundColor,
          borderRadius: 15,
        }}>
        <View
          style={{
            width: '90%',
            padding: 10,
            borderRadius: 15,
            justifyContent: 'center',
            flexDirection: 'column',
            paddingVertical: 16,
          }}>
          <TextView
            text={`Original Key ${props.orignalKey}`}
            textStyle={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
              alignSelf: 'center',
              marginTop: 6,
              marginLeft: 6,
            }}
          />

          <TextView
            text={`Transpose ${transposeNumber}`}
            textStyle={{
              fontSize: 14,
              alignSelf: 'center',
              marginBottom: 6,
              marginTop: 6,
              marginLeft: 6,
            }}
          />

          <TouchableOpacity
            style={{position: 'absolute', right: 0, top: 10}}
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
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <TouchableOpacity
              onPress={() => {
                if (transposeNumber > -5) {
                  setTransposeNumber(transposeNumber - 1);
                  props.sliderOnValueChange(transposeNumber - 1);
                }
              }}>
              <AntDesign
                name={'minuscircle'}
                size={30}
                color={GeneralColor.app_dark_theme}
              />
            </TouchableOpacity>

            <Slider
              step={1}
              style={{width: '100%', height: 40, flex: 1}}
              minimumValue={-5}
              maximumValue={5}
              value={transposeNumber}
              onValueChange={(value: number) => {
                setTransposeNumber(value);
                props.sliderOnValueChange(value);
              }}
              thumbTintColor={GeneralColor.app_dark_theme}
              minimumTrackTintColor={GeneralColor.app_dark_theme}
              maximumTrackTintColor="#000000"
            />

            <TouchableOpacity
              onPress={() => {
                if (transposeNumber < 5) {
                  setTransposeNumber(transposeNumber + 1);
                  props.sliderOnValueChange(transposeNumber + 1);
                }
              }}>
              <AntDesign
                name={'pluscircle'}
                size={30}
                color={GeneralColor.app_dark_theme}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <TextView
              textStyle={{
                color: theme.textColor,
                opacity: 0.5,
                fontSize: 12,
                marginBottom: 12,
              }}
              text={'Scroll Speed'}
            />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {scrollSpeed.map((_, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      props.clickedChangedScrollSpeed(_);
                    }}
                    key={index}
                    style={{marginRight: 12}}>
                    <TextView
                      textStyle={{
                        textAlign: 'center',
                        borderWidth: props.currentScrollSpeed == _ ? 2 : 1,
                        borderRadius: 8,
                        fontSize: props.currentScrollSpeed == _ ? 16 : 14,
                        fontWeight:
                          props.currentScrollSpeed == _ ? 'bold' : 'normal',
                        paddingVertical: 5,
                        paddingHorizontal: 12,
                        color:
                          props.currentScrollSpeed == _
                            ? GeneralColor.app_theme
                            : theme.textColor,
                        borderColor:
                          props.currentScrollSpeed == _
                            ? GeneralColor.app_theme
                            : theme.textColor,
                      }}
                      text={_}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 12,
              justifyContent: 'space-between',
            }}>
            <TextView
              textStyle={{
                color: theme.textColor,
                opacity: 0.5,
                fontSize: 12,
                marginBottom: 12,
              }}
              text={'Font Size'}
            />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {fontSize.map((_, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      props.clickedChangeFont(_);
                    }}
                    key={index}
                    style={{marginRight: 12}}>
                    <TextView
                      textStyle={{
                        textAlign: 'center',
                        borderWidth: props.currentLyricFontSize == _ ? 2 : 1,
                        borderRadius: 8,
                        fontSize: props.currentLyricFontSize == _ ? 16 : 14,
                        fontWeight:
                          props.currentLyricFontSize == _ ? 'bold' : 'normal',
                        paddingVertical: 5,
                        paddingHorizontal: 12,
                        color:
                          props.currentLyricFontSize == _
                            ? GeneralColor.app_theme
                            : theme.textColor,
                        borderColor:
                          props.currentLyricFontSize == _
                            ? GeneralColor.app_theme
                            : theme.textColor,
                      }}
                      text={_}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
