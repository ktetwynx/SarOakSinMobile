import React, {useContext, useEffect} from 'react';
import {View, Text, TouchableOpacity, Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {TextView} from './TextView';
import i18n from '../language/i18n';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';

export interface AppProps {
  clickedViewMore: Function;
}

export function ViewMoreButton(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [label, setLabel] = React.useState({
    viewMore: i18n.t('view_more'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        viewMore: i18n.t('view_more'),
      });
    });
    return unsubscribe;
  }, []);

  return (
    <TouchableOpacity onPress={() => props.clickedViewMore()}>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1.5,
          borderColor: GeneralColor.app_theme,
          borderRadius: 20,
          paddingHorizontal: 6,
          paddingVertical: Platform.OS == 'ios' ? 1 : 2,
        }}>
        <TextView
          text={label.viewMore}
          textStyle={{marginRight: 6, fontSize: 12}}
        />
        <AntDesign
          name="caretright"
          size={15}
          color={GeneralColor.app_theme}
          style={{alignSelf: 'center'}}
        />
      </View>
    </TouchableOpacity>
  );
}
