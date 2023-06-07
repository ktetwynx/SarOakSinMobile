import React, {useContext} from 'react';
import {View, Text, TextInput, TouchableOpacity, ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ThemeContext} from '../utility/ThemeProvider';

export interface PasswordTextInputViewProps {
  placeholder: string;
  icon: any;
  isShowPassword: boolean;
  clickedHidePassword: Function;
  style?: ViewStyle;
  isHideEyeButton: boolean;
  onChangeText: Function;
  extraIcon: any;
  value?: string;
}

export function PasswordTextInputView(props: PasswordTextInputViewProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <View
      style={{
        width: '88%',
        height: 55,
        backgroundColor: theme.backgroundColor3,
        flexDirection: 'row',
        borderRadius: 40,
        ...props.style,
      }}>
      <View style={{width: 50, justifyContent: 'center'}}>{props.icon}</View>
      <TextInput
        value={props.value}
        onChangeText={text => props.onChangeText(text)}
        placeholder={props.placeholder}
        secureTextEntry={!props.isShowPassword}
        placeholderTextColor={theme.textColor}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          paddingLeft: 6,
          color: theme.textColor,
        }}
      />
      {props.isHideEyeButton ? (
        <View style={{width: 50, justifyContent: 'center'}}>
          {props.extraIcon}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => props.clickedHidePassword()}
          style={{width: 50, justifyContent: 'center'}}>
          <Ionicons
            name={props.isShowPassword ? 'eye' : 'eye-off'}
            size={23}
            color={theme.backgroundColor2}
            style={{alignSelf: 'center'}}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
