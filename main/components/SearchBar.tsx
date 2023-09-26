import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {ThemeContext} from '../utility/ThemeProvider';
import {TextView} from './TextView';
import {GeneralColor} from '../utility/Themes';
import * as Animatable from 'react-native-animatable';
export interface AppProps {
  clickedSearch: any;
  text: string;
  paddingTop?: number;
}

export function SearchBar(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <TouchableOpacity
      style={{paddingTop: props.paddingTop}}
      onPress={props.clickedSearch}>
      <Animatable.View
        useNativeDriver={true}
        animation={'fadeInUp'}
        style={{
          width: '90%',
          height: 45,
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: theme.backgroundColor3,
          flexDirection: 'row',
          borderRadius: 40,
          justifyContent: 'space-between',
          marginBottom: 16,
          marginTop: 6,
        }}>
        <TextView
          text={props.text}
          textStyle={{marginLeft: 16, fontSize: 18}}
        />
        <Ionicons
          name="search-circle"
          size={35}
          color={GeneralColor.app_theme}
          style={{alignSelf: 'center', marginRight: 16}}
        />
      </Animatable.View>
    </TouchableOpacity>
  );
}
