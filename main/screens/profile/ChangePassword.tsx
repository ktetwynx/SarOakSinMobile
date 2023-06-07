import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ConnectedProps, connect} from 'react-redux';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {ThemeContext} from '../../utility/ThemeProvider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {PasswordTextInputView} from '../../components/PasswordTextInputView';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {LoadingScreen} from '../components/LoadingScreen';
import {SuccessfulDialog} from '../components/SuccessfulDialog';

const mapstateToProps = (state: {token: any; profile: any}) => {
  return {
    token: state.token,
    profile: state.profile,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'ChangePassword'>;

interface ChangePasswordData {
  oldPassword: string;
  password1: string;
  password2: string;
}
const ChangePassword = (props: Props) => {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [passwordBackgroundColor, setPasswordBackgroundColor] = useState({
    bg1: '#c9c9c9',
    bg2: '#c9c9c9',
    bg3: '#c9c9c9',
  });
  const [isSamePassword, setIsSamePassword] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [changePasswordData, setChangePasswordData] =
    useState<ChangePasswordData>({
      oldPassword: '',
      password1: '',
      password2: '',
    });
  const [label, setLabel] = React.useState({
    change_password: i18n.t('change_password'),
    old_password: i18n.t('old_password'),
    new_password: i18n.t('new_password'),
    repeat_new_password: i18n.t('repeat_new_password'),
    confirm: i18n.t('confirm'),
    success: i18n.t('success'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        change_password: i18n.t('change_password'),
        old_password: i18n.t('old_password'),
        new_password: i18n.t('new_password'),
        repeat_new_password: i18n.t('repeat_new_password'),
        confirm: i18n.t('confirm'),
        success: i18n.t('success'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (changePasswordData.password2.length != 0) {
      if (changePasswordData.password1 == changePasswordData.password2) {
        setIsSamePassword(true);
      } else {
        setIsSamePassword(false);
      }
    }

    if (changePasswordData.password1.length != 0) {
      if (changePasswordData.password1.length < 4) {
        setPasswordBackgroundColor({
          bg1: '#ff5447',
          bg2: '#c9c9c9',
          bg3: '#c9c9c9',
        });
      } else if (changePasswordData.password1.length < 6) {
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
  }, [changePasswordData.password1, changePasswordData.password2]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedHidePassword = useCallback(() => {
    if (isShowPassword) {
      setIsShowPassword(false);
    } else {
      setIsShowPassword(true);
    }
  }, [isShowPassword]);

  const onChangeText = useCallback(
    (name: 'oldPassword' | 'password1' | 'password2') => (text: any) => {
      setChangePasswordData(prev => {
        return {
          ...prev,
          [name]: text,
        };
      });
    },
    [],
  );

  const clickedChangePassword = useCallback(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchChangePasswordApi();
    }
  }, [changePasswordData]);

  const onValidate = (): boolean => {
    let oldPassword = true;
    let password1 = true;
    let password2 = true;
    let samePassword = true;

    switch (true) {
      case !changePasswordData.oldPassword.trim():
        oldPassword = false;
        setErrorMessage('Please fill your old password');
        break;
      case changePasswordData.password1.length == 0:
        password1 = false;
        setErrorMessage('Please fill your new password');
        break;
      case changePasswordData.password1.length < 6:
        password1 = false;
        setErrorMessage('Your new password must be a 6-digit');
        break;
      case changePasswordData.password2.length == 0:
        password2 = false;
        setErrorMessage('Please repeat your new password');
        break;
      case changePasswordData.password2 != changePasswordData.password1:
        samePassword = false;
        setErrorMessage('Your password is different');
        break;

      default:
        setErrorMessage('');
        break;
    }

    return oldPassword && password1 && password2 && samePassword;
  };

  const fetchChangePasswordApi = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('email', props.profile.email);
    formData.append('oldPassword', changePasswordData.oldPassword);
    formData.append('password', changePasswordData.password1);
    console.log(formData);
    await ApiFetchService(
      API_URL + `user/register-user/change-password`,
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      },
    ).then((response: any) => {
      console.log(response);
      setIsLoading(false);
      if (response.code == 200) {
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          props.navigation.pop();
        }, 2000);
      } else {
        setErrorMessage(response.message);
      }
    });
  }, [changePasswordData, props.profile.email, props.token]);

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
              text={label.change_password}
              textStyle={{fontSize: 18, fontWeight: 'bold', marginLeft: 12}}
            />
          </View>

          <PasswordTextInputView
            extraIcon={<></>}
            onChangeText={onChangeText('oldPassword')}
            isHideEyeButton={true}
            style={{marginTop: 16}}
            isShowPassword={true}
            clickedHidePassword={clickedHidePassword}
            icon={
              <Fontisto
                name="locked"
                size={25}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
            placeholder={label.old_password}
          />

          <PasswordTextInputView
            extraIcon={<></>}
            onChangeText={onChangeText('password1')}
            isHideEyeButton={false}
            style={{marginTop: 16}}
            isShowPassword={isShowPassword}
            clickedHidePassword={clickedHidePassword}
            icon={
              <Entypo
                name="new-message"
                size={25}
                color={theme.backgroundColor2}
                style={{alignSelf: 'center'}}
              />
            }
            placeholder={label.new_password}
          />

          {changePasswordData.password1.length != 0 ? (
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
              changePasswordData.password2.length != 0 ? (
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
            placeholder={label.repeat_new_password}
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
            onPress={clickedChangePassword}
            style={{
              width: '40%',
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
              textStyle={{fontSize: 18, fontWeight: 'bold'}}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <SuccessfulDialog text={label.success} isVisible={showSuccessDialog} />
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
};

export default connector(ChangePassword);
