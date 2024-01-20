import React, {useContext, useEffect} from 'react';
import {ThemeContext} from '../utility/ThemeProvider';
import {GeneralColor} from '../utility/Themes';
import Modal from 'react-native-modal';
import {Dimensions, Image, TouchableOpacity, View} from 'react-native';
import {TextView} from './TextView';
import i18n from '../language/i18n';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const {width, height} = Dimensions.get('screen');
export interface AppProps {
  clickedClosed: Function;
  isVisible: boolean;
  clickedSignUp: Function;
  clickedLogin: Function;
}
export function LoginDialog(props: AppProps) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const [label, setLabel] = React.useState({
    sign_up: i18n.t('sign_up'),
    login: i18n.t('login'),
    not_a_memeber: i18n.t('not_a_memeber'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        sign_up: i18n.t('sign_up'),
        login: i18n.t('login'),
        not_a_memeber: i18n.t('not_a_memeber'),
      });
    });
    return unsubscribe;
  }, []);

  return (
    <Modal
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      isVisible={props.isVisible}
      hasBackdrop={true}
      onBackButtonPress={() => {
        props.clickedClosed();
      }}
      onBackdropPress={() => {
        props.clickedClosed();
      }}>
      <View
        style={{
          width: width - 80,
          borderRadius: 20,
          justifyContent: 'center',
          height: 280,
          alignSelf: 'center',
          padding: 10,
          backgroundColor: theme.backgroundColor,
        }}>
        <TouchableOpacity
          style={{position: 'absolute', right: 10, top: 10}}
          onPress={() => props.clickedClosed()}>
          <MaterialCommunityIcons
            name="close-circle"
            size={25}
            color={GeneralColor.grey}
            style={{alignSelf: 'center', opacity: 0.7}}
          />
        </TouchableOpacity>
        <Image
          style={{
            width: 90,
            height: 90,
            backgroundColor: GeneralColor.light_grey,
            alignSelf: 'center',
            borderRadius: 20,
          }}
          source={require('../assets/images/sar_oak_sin_logo.jpg')}
        />
        <TouchableOpacity
          onPress={() => props.clickedLogin()}
          style={{
            width: 120,
            height: 40,
            marginTop: 30,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: GeneralColor.app_theme,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <TextView
            text={label.login}
            textStyle={{
              fontSize: 18,
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{alignSelf: 'center'}}
          onPress={() => props.clickedSignUp()}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 22,
              alignItems: 'center',
            }}>
            <TextView textStyle={{}} text={label.not_a_memeber} />
            <TextView
              text={label.sign_up}
              textStyle={{
                color: GeneralColor.white,
                fontWeight: 'bold',
                padding: 6,
                backgroundColor: GeneralColor.app_theme,
                fontSize: 12,
                borderRadius: 5,
                overflow: 'hidden',
                marginLeft: 10,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
