import React, {useContext} from 'react';
import {Text, TextStyle} from 'react-native';
import {ThemeContext} from '../utility/ThemeProvider';

export interface AppProps {
  text: string;
  textStyle: TextStyle;
  numberOfLines?: number;
}

export function TextView(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <Text
      adjustsFontSizeToFit={true}
      allowFontScaling={false}
      numberOfLines={props.numberOfLines}
      style={{
        fontFamily: 'Pyidaungsu',
        color: theme.textColor,
        ...props.textStyle,
      }}>
      {props.text}
    </Text>
  );
}
