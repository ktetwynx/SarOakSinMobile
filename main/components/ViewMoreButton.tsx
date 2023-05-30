import React, {useContext, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {TextView} from './TextView';
import i18n from '../language/i18n';
import {ThemeContext} from '../utility/ThemeProvider';

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
          borderColor: theme.textColor,
          borderRadius: 20,
          paddingHorizontal: 6,
          paddingVertical: 1,
        }}>
        <TextView
          text={label.viewMore}
          textStyle={{marginRight: 6, fontSize: 12}}
        />
        <AntDesign
          name="caretright"
          size={15}
          color={theme.textColor}
          style={{alignSelf: 'center'}}
        />
      </View>
    </TouchableOpacity>
  );
}
