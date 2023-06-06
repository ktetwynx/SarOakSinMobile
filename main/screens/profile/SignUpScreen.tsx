import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Ref,
  useContext,
} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInputView} from '../../components/TextInputView';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {PasswordTextInputView} from '../../components/PasswordTextInputView';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {BackButton} from '../../components/BackButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
const {width, height} = Dimensions.get('screen');

interface SignUpData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}
export function SignUpScreen(props: RootStackScreenProps<'SignUpScreen'>) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [passwordBackgroundColor, setPasswordBackgroundColor] = useState({
    bg1: '#c9c9c9',
    bg2: '#c9c9c9',
    bg3: '#c9c9c9',
  });
  const [isSamePassword, setIsSamePassword] = useState<boolean>(false);
  const [signUpData, setSignUpdata] = useState<SignUpData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [label, setLabel] = React.useState({
    sign_up: i18n.t('sign_up'),
    email: i18n.t('email'),
    username: i18n.t('username'),
    password: i18n.t('password'),
    repeat_password: i18n.t('repeat_password'),
    confirm: i18n.t('confirm'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        sign_up: i18n.t('sign_up'),
        email: i18n.t('email'),
        username: i18n.t('username'),
        password: i18n.t('password'),
        repeat_password: i18n.t('repeat_password'),
        confirm: i18n.t('confirm'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (signUpData.password2.length != 0) {
      if (signUpData.password1 == signUpData.password2) {
        setIsSamePassword(true);
      } else {
        setIsSamePassword(false);
      }
    }
    if (signUpData.password1.length != 0) {
      if (signUpData.password1.length < 4) {
        setPasswordBackgroundColor({
          bg1: '#ff5447',
          bg2: '#c9c9c9',
          bg3: '#c9c9c9',
        });
      } else if (signUpData.password1.length < 6) {
        setPasswordBackgroundColor({
          bg1: '#ffb46e',
          bg2: '#ffb46e',
          bg3: '#c9c9c9',
        });
      } else {
        setPasswordBackgroundColor({
          bg1: '#54e360',
          bg2: '#54e360',
          bg3: '#54e360',
        });
      }
    }
  }, [signUpData.password1, signUpData.password2]);

  const clickedHidePassword = useCallback(() => {
    if (isShowPassword) {
      setIsShowPassword(false);
    } else {
      setIsShowPassword(true);
    }
  }, [isShowPassword]);

  const fetchSignUpApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('username', signUpData.username);
    formData.append('email', signUpData.email);
    formData.append('password', signUpData.password1);
    console.log(formData);
    await ApiFetchService(API_URL + `user/register-user/register`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      if (response.code == 201) {
        props.navigation.navigate('VerifyScreen', {email: response.data.email});
      } else {
        setErrorMessage(response.message);
      }
    });
  }, [signUpData]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedSignUp = useCallback(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchSignUpApi();
    }
  }, [signUpData]);

  const onChangeText = useCallback(
    (name: 'username' | 'email' | 'password1' | 'password2') => (text: any) => {
      setSignUpdata(prev => {
        return {
          ...prev,
          [name]: text,
        };
      });
    },
    [],
  );

  const onValidate = (): boolean => {
    let username = true;
    let email = true;
    let password1 = true;
    let password2 = true;
    let samePassword = true;

    switch (true) {
      case !signUpData.username.trim():
        username = false;
        setErrorMessage('Please fill your name');
        break;
      case !signUpData.email.trim():
        email = false;
        setErrorMessage('Please fill your email');
        break;
      case signUpData.password1.length == 0:
        password1 = false;
        setErrorMessage('Please fill your password');
        break;
      case signUpData.password1.length < 6:
        password1 = false;
        setErrorMessage('Your password must be a 6-digit');
        break;
      case signUpData.password2.length == 0:
        password2 = false;
        setErrorMessage('Please repeat your password');
        break;
      case signUpData.password2 != signUpData.password1:
        samePassword = false;
        setErrorMessage('Your password is different');
        break;

      default:
        setErrorMessage('');
        break;
    }

    return username && email && password1 && password2 && samePassword;
  };

  return (
    <KeyboardAwareScrollView
      extraHeight={150}
      showsVerticalScrollIndicator={false}
      style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <SafeAreaView style={{flex: 1, flexDirection: 'column'}} edges={['top']}>
        <BackButton
          style={{marginLeft: 16, marginTop: 10}}
          clickedGoBack={goBack}
        />
        <View
          style={{
            flex: 1,
            marginTop: height / 10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'column',
              width: '88%',
            }}>
            <TextView
              text={label.sign_up}
              textStyle={{fontSize: 24, fontWeight: 'bold', marginLeft: 16}}
            />
          </View>
          <TextInputView
            onChangeText={onChangeText('username')}
            style={{marginTop: 44}}
            placeholder={label.username}
            icon={
              <MaterialCommunityIcons
                name="account-circle"
                size={30}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
          />
          <TextInputView
            autoCapitalize={'none'}
            onChangeText={onChangeText('email')}
            style={{marginTop: 16}}
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

          <PasswordTextInputView
            extraIcon={<></>}
            onChangeText={onChangeText('password1')}
            isHideEyeButton={false}
            style={{marginTop: 16}}
            isShowPassword={isShowPassword}
            clickedHidePassword={clickedHidePassword}
            icon={
              <Fontisto
                name="locked"
                size={25}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
            placeholder={label.password}
          />

          {signUpData.password1.length != 0 ? (
            <View
              style={{
                height: 1,
                flexDirection: 'row',
                width: '80%',
                justifyContent: 'flex-end',
                marginTop: 8,
              }}>
              <View
                style={{
                  width: 50,
                  height: 5,
                  borderRadius: 10,
                  backgroundColor: passwordBackgroundColor.bg1,
                  marginRight: 12,
                }}
              />
              <View
                style={{
                  width: 50,
                  height: 5,
                  borderRadius: 10,
                  backgroundColor: passwordBackgroundColor.bg2,
                  marginRight: 12,
                }}
              />
              <View
                style={{
                  width: 50,
                  height: 5,
                  backgroundColor: passwordBackgroundColor.bg3,
                  borderRadius: 10,
                }}
              />
            </View>
          ) : (
            <></>
          )}

          <PasswordTextInputView
            extraIcon={
              signUpData.password2.length != 0 ? (
                <AntDesign
                  name={isSamePassword ? 'checkcircle' : 'closecircle'}
                  size={23}
                  color={isSamePassword ? 'green' : 'red'}
                  style={{alignSelf: 'center'}}
                />
              ) : (
                <></>
              )
            }
            onChangeText={onChangeText('password2')}
            isHideEyeButton={true}
            style={{marginTop: 16}}
            isShowPassword={false}
            clickedHidePassword={clickedHidePassword}
            icon={
              <MaterialCommunityIcons
                name="form-textbox-password"
                size={25}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
            placeholder={label.repeat_password}
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
            onPress={clickedSignUp}
            style={{
              width: '50%',
              height: 50,
              marginTop: 48,
              marginBottom: 100,
              borderRadius: 50,
              backgroundColor: 'grey',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextView
              text={label.confirm}
              textStyle={{fontSize: 20, fontWeight: 'bold'}}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
