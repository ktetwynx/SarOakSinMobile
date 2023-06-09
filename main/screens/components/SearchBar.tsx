import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {GeneralColor} from '../../utility/Themes';

export interface AppProps {
  clickedSearch: any;
  text: string;
}

export function SearchBar(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  return (
    <TouchableOpacity onPress={props.clickedSearch}>
      <Animated.View
        entering={FadeInUp.duration(400)}
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
          // borderWidth: 1,
          // borderColor: theme.backgroundColor2,
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
      </Animated.View>
    </TouchableOpacity>
  );
}
