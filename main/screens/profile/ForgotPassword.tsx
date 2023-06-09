import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
import {ThemeContext} from '../../utility/ThemeProvider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TextInputView} from '../../components/TextInputView';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {LoadingScreen} from '../components/LoadingScreen';
import {GeneralColor} from '../../utility/Themes';

export function ForgotPassword(props: RootStackScreenProps<'ForgotPassword'>) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [label, setLabel] = React.useState({
    forgot_ur_password: i18n.t('forgot_ur_password'),
    email: i18n.t('email'),
    enter_your_email: i18n.t('enter_your_email'),
    confirm: i18n.t('confirm'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        forgot_ur_password: i18n.t('forgot_ur_password'),
        email: i18n.t('email'),
        enter_your_email: i18n.t('enter_your_email'),
        confirm: i18n.t('confirm'),
      });
    });
    return unsubscribe;
  }, []);

  const onChangeText = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const clickedForgotPassword = useCallback(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchSendOtpApi();
    }
  }, [email]);

  const onValidate = (): boolean => {
    let emailText = true;

    switch (true) {
      case !email.trim():
        emailText = false;
        setErrorMessage('Please fill your email');
        break;
      default:
        setErrorMessage('');
        break;
    }

    return emailText;
  };

  const fetchSendOtpApi = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('email', email);
    console.log(formData);
    await ApiFetchService(
      API_URL + `user/register-user/send-otp-by-email`,
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
      },
    ).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      if (response.code == 200) {
        props.navigation.navigate('VerifyScreen', {
          email: email,
          verifyType: 2,
        });
      } else {
        setErrorMessage(response.message);
      }
    });
  }, [email]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  return (
    <View>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}
        edges={['top']}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              marginTop: 12,
              marginBottom: 20,
            }}>
            <BackButton clickedGoBack={goBack} style={{marginLeft: 12}} />

            <TextView
              text={label.forgot_ur_password}
              textStyle={{fontSize: 18, fontWeight: 'bold', marginLeft: 12}}
            />
          </View>
          <TextView
            text={label.enter_your_email}
            textStyle={{
              fontSize: 14,
              marginTop: 42,
              width: '88%',
              marginLeft: 12,
            }}
          />
          <TextInputView
            autoCapitalize={'none'}
            onChangeText={onChangeText}
            style={{marginTop: 8}}
            placeholder={label.email}
            icon={
              <MaterialCommunityIcons
                name="email"
                size={30}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
          />

          <TextView
            text={errorMessage}
            textStyle={{
              fontSize: 14,
              color: 'red',
              fontWeight: 'bold',
              marginTop: 12,
            }}
          />

          <TouchableOpacity
            onPress={clickedForgotPassword}
            style={{
              width: 120,
              height: 40,
              marginTop: 38,
              marginBottom: 100,
              borderRadius: 50,
              backgroundColor: GeneralColor.app_theme,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextView
              text={label.confirm}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: GeneralColor.white,
              }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}
