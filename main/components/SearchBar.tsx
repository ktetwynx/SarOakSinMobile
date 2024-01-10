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
          height: 50,
          alignSelf: 'center',
          alignItems: 'center',
          // backgroundColor: GeneralColor.app_theme,
          flexDirection: 'row',
          borderRadius: 40,
          justifyContent: 'space-between',
          marginBottom: 20,
          marginTop: 3,
          borderWidth: 4,
          borderColor: theme.backgroundColor4,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.29,
          shadowRadius: 4.65,

          elevation: 7,
        }}>
        <TextView
          text={props.text}
          textStyle={{
            marginLeft: 16,
            fontSize: 18,
            marginTop: 2,
            fontWeight: 'bold',
            color: theme.backgroundColor4,
          }}
        />
        <Ionicons
          name="search-circle"
          size={35}
          color={theme.backgroundColor4}
          style={{alignSelf: 'center', marginRight: 16}}
        />
      </Animatable.View>
    </TouchableOpacity>
  );
}
