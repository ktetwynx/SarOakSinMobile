import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
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
  const {width, height} = Dimensions.get('screen');
  const {theme} = context;
  return (
    <TouchableOpacity
      style={{
        paddingTop: props.paddingTop,
        // ...styles.shadowProps,
      }}
      onPress={props.clickedSearch}>
      <Animatable.View
        useNativeDriver={true}
        animation={'fadeInUp'}
        style={{
          width: '90%',
          height: 50,
          alignSelf: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          borderRadius: 40,
          bottom: 16,
          justifyContent: 'space-between',
          position: 'absolute',
          borderWidth: 4,
          borderColor: 'rgba(0, 0, 0, 0.2)',
        }}
      />
      <Animatable.View
        useNativeDriver={true}
        animation={'fadeInUp'}
        style={{
          width: '90%',
          height: 50,
          alignSelf: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          borderRadius: 40,
          justifyContent: 'space-between',
          marginBottom: height * 0.024,
          marginTop: 3,
          borderWidth: 4,
          borderColor: theme.backgroundColor4,
        }}>
        <TextView
          text={props.text}
          textStyle={{
            marginLeft: 16,
            fontSize: 18,
            marginTop: 2,
            fontWeight: 'bold',
            color: theme.backgroundColor4,
            ...styles.shadowProps,
          }}
        />
        <Ionicons
          name="search-circle"
          size={35}
          color={theme.backgroundColor4}
          style={[
            {
              alignSelf: 'center',
              marginRight: 16,
            },
            styles.shadowProps,
          ]}
        />
      </Animatable.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowProps: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 7,
  },
});
