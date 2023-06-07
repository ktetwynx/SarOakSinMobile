import React, {useContext} from 'react';
import {View, TextInput, ViewStyle} from 'react-native';
import {ThemeContext} from '../utility/ThemeProvider';

export interface TextInputViewProps {
  icon: any;
  placeholder: string;
  style?: ViewStyle;
  onChangeText: Function;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  value?: string;
}

export function TextInputView(props: TextInputViewProps) {
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
        autoCapitalize={
          props.autoCapitalize == null ? 'words' : props.autoCapitalize
        }
        value={props.value}
        onChangeText={text => props.onChangeText(text)}
        placeholder={props.placeholder}
        placeholderTextColor={theme.textColor}
        style={{
          width: '100%',
          height: '100%',
          paddingLeft: 6,
          color: theme.textColor,
        }}
      />
    </View>
  );
}
