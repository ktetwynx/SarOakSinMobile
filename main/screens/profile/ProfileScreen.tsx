import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Switch,
  TextInput,
} from 'react-native';
import en from '../../language/en.json';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import CheckBox from '@react-native-community/checkbox';
import {TextInputView} from '../../components/TextInputView';
import {PasswordTextInputView} from '../../components/PasswordTextInputView';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
  API_KEY_PRODUCION,
  API_URL,
  PENDING,
  STORAGE_KEYS,
} from '../../config/Constant';
import {ConnectedProps, connect} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  Profile,
  setAppLanguage,
  setFavBookCount,
  setFavLyricCount,
  setProfile,
  setToken,
} from '../../redux/actions';
import Modal from 'react-native-modal';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
import ToggleSwitch from 'toggle-switch-react-native';
import {ThemeContext} from '../../utility/ThemeProvider';
import {LoadingScreen} from '../../components/LoadingScreen';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {GeneralColor} from '../../utility/Themes';
import * as Animatable from 'react-native-animatable';
import {SuccessfulDialog} from '../../components/SuccessfulDialog';

const {width, height} = Dimensions.get('screen');

interface LoginData {
  email: string;
  password: string;
}

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_book_count: number;
  fav_lyric_count: number;
  app_language: string;
  app_theme: string;
}) => {
  return {
    profile: state.profile,
    token: state.token,
    fav_book_count: state.fav_book_count,
    fav_lyric_count: state.fav_lyric_count,
    app_language: state.app_language,
    app_theme: state.app_theme,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setToken: (token: any) => {
      dispatch(setToken(token));
    },
    setProfile: (profile?: Profile) => {
      dispatch(setProfile(profile));
    },
    setFavBookCount: (fav_book_count: number) => {
      dispatch(setFavBookCount(fav_book_count));
    },
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
    setAppLanguage: (app_language: string) => {
      dispatch(setAppLanguage(app_language));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootTabScreenProps<'ProfileScreen'>;

const ProfileScreen = (props: Props) => {
  const context = useContext(ThemeContext);
  const {theme, updateTheme} = context;
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDeletingAccount, setErrorDeletingAccount] =
    useState<boolean>(false);
  const [deleteText, setDeleteText] = useState<string>('');
  const [isLightMode, setIsLightMode] = useState<boolean>(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const animationForScreen = 'fadeInUp';
  const [isCheckKeepLoggedIn, setIsCheckKeepLoggedIn] =
    useState<boolean>(false);
  const [isVisibleChangeLanguageModal, setIsVisibleChangeLanguageModal] =
    useState<boolean>(false);
  const [isVisibleDeleteAccountModal, setIsVisibleDeleteAccountModal] =
    useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    username: '',
    email: '',
    bookCollectionId: 0,
    lyricCollectionId: 0,
  });
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [label, setLabel] = React.useState({
    yourFav: i18n.t('your_fav'),
    books: i18n.t('books'),
    lyrics: i18n.t('lyrics'),
    language: i18n.t('language'),
    change_password: i18n.t('change_password'),
    logout: i18n.t('logout'),
    email: i18n.t('email'),
    password: i18n.t('password'),
    login: i18n.t('login'),
    sign_up: i18n.t('sign_up'),
    forgot_ur_password: i18n.t('forgot_ur_password'),
    keep_me_logged_in: i18n.t('keep_me_logged_in'),
    not_a_memeber: i18n.t('not_a_memeber'),
    delete_account: i18n.t('delete_account'),
    deleting_account: i18n.t('deleting_account'),
    delete_description: i18n.t('delete_description'),
    confirm_delete: i18n.t('confirm_delete'),
    delete: i18n.t('delete'),
    success: i18n.t('success'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        yourFav: i18n.t('your_fav'),
        books: i18n.t('books'),
        lyrics: i18n.t('lyrics'),
        language: i18n.t('language'),
        change_password: i18n.t('change_password'),
        logout: i18n.t('logout'),
        email: i18n.t('email'),
        password: i18n.t('password'),
        login: i18n.t('login'),
        sign_up: i18n.t('sign_up'),
        forgot_ur_password: i18n.t('forgot_ur_password'),
        keep_me_logged_in: i18n.t('keep_me_logged_in'),
        not_a_memeber: i18n.t('not_a_memeber'),
        delete_account: i18n.t('delete_account'),
        deleting_account: i18n.t('deleting_account'),
        delete_description: i18n.t('delete_description'),
        confirm_delete: i18n.t('confirm_delete'),
        delete: i18n.t('delete'),
        success: i18n.t('success'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (props.token == null) {
      getUserInfo();
    }
  }, [props.token]);

  useEffect(() => {
    if (props.app_theme === 'light') {
      setIsLightMode(true);
    } else {
      setIsLightMode(false);
    }
  }, [props.app_theme]);

  useEffect(() => {
    setProfile({
      id: props.profile?.id,
      username: props.profile?.fullname,
      email: props.profile?.email,
      bookCollectionId: props.profile?.bookCollectionId,
      lyricCollectionId: props.profile?.lyricCollectionId,
    });
  }, [props.profile]);

  const getUserInfo = async () => {
    try {
      let userEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      let userPassword = await AsyncStorage.getItem(STORAGE_KEYS.USER_PASSWORD);
      let keepLogin = await AsyncStorage.getItem(STORAGE_KEYS.KEEP_LOGIN);

      setIsCheckKeepLoggedIn(keepLogin === 'isSave' ? true : false);
      setLoginData({
        email: userEmail ? userEmail : '',
        password: userPassword ? userPassword : '',
      });
    } catch (error) {
      console.log('retrieve login info eroor =>', error);
    }
  };

  const clickedHidePassword = useCallback(() => {
    if (isShowPassword) {
      setIsShowPassword(false);
    } else {
      setIsShowPassword(true);
    }
  }, [isShowPassword]);

  const onChangeText = useCallback(
    (name: 'email' | 'password') => (text: any) => {
      setLoginData(prev => {
        return {
          ...prev,
          [name]: text,
        };
      });
    },
    [],
  );

  const clickedSignUp = useCallback(() => {
    props.navigation.navigate('SignUpScreen');
  }, []);

  const onValidate = (): boolean => {
    let email = true;
    let password = true;

    switch (true) {
      case !loginData.email?.trim():
        email = false;
        setErrorMessage('Please fill your email');
        break;
      case !loginData.password?.trim():
        password = false;
        setErrorMessage('Please fill your password');
        break;

      default:
        setErrorMessage('');
        break;
    }

    return email && password;
  };

  const clickedLogin = useCallback(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchLoginApi();
    }
  }, [loginData, isCheckKeepLoggedIn]);

  const fetchLoginApi = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('email', loginData.email);
    formData.append('password', loginData.password);
    await ApiFetchService(API_URL + `user/login`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      if (response.code == 200) {
        if (response.data.status == PENDING) {
          props.navigation.navigate('VerifyScreen', {
            email: loginData.email,
            verifyType: 1,
          });
        } else {
          props.setToken(response.data.token);
          props.setProfile(response.data);
          props.setFavBookCount(response.data.bookCount);
          props.setFavLyricCount(response.data.lyricCount);
          saveLoginInfo();
        }
      } else {
        setErrorMessage(response.message);
      }
      setIsLoading(false);
    });
  }, [loginData, isCheckKeepLoggedIn]);

  const fetchDeleteAccount = useCallback(async () => {
    setIsVisibleDeleteAccountModal(false);
    setIsLoading(true);
    let formData = new FormData();
    formData.append('userId', profile.id.toString());
    await ApiFetchService(API_URL + `user/register-user/delete`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + props.token,
    }).then((response: any) => {
      console.log(response);
      if (response.code == 200) {
        setTimeout(() => {
          setShowSuccessDialog(true);
          setIsLoading(false);
        }, 500);
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccessDialog(false);
          props.setToken(null);
          props.setProfile(undefined);
        }, 3000);
      } else {
        setErrorMessage(response.message);
        setIsVisibleDeleteAccountModal(true);
        setIsLoading(false);
      }
    });
  }, [profile.id, props.token]);

  const saveLoginInfo = useCallback(async () => {
    if (isCheckKeepLoggedIn) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, loginData.email);
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PASSWORD,
        loginData.password,
      );
      await AsyncStorage.setItem(STORAGE_KEYS.KEEP_LOGIN, 'isSave');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PASSWORD);
      await AsyncStorage.removeItem(STORAGE_KEYS.KEEP_LOGIN);
    }
  }, [loginData, isCheckKeepLoggedIn]);

  const clickedLogout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      props.setToken(null);
      props.setProfile(undefined);
    }, 2000);
  }, []);

  const clickedChangePassword = useCallback(() => {
    props.navigation.navigate('ChangePassword');
  }, []);

  const clickedShowDeleteAccountModal = useCallback(() => {
    setIsVisibleDeleteAccountModal(true);
  }, []);

  const clickedDeleteAccount = useCallback(() => {
    if (!onValidateDelete()) {
      return;
    } else {
      fetchDeleteAccount();
    }
  }, [profile, deleteText, props.token]);

  const clickedChangeLanguage = useCallback(() => {
    if (!isVisibleChangeLanguageModal) {
      setIsVisibleChangeLanguageModal(true);
    }
  }, [isVisibleChangeLanguageModal]);

  const clickedFavBookList = useCallback(() => {
    props.navigation.navigate('FavouriteBookScreen');
  }, []);

  const clickedChangeEN = useCallback(() => {
    i18n.locale = 'en';
    props.setAppLanguage('en');
    setIsVisibleChangeLanguageModal(false);
  }, []);

  const clickedChangeMM = useCallback(() => {
    i18n.locale = 'mm';
    props.setAppLanguage('mm');
    setIsVisibleChangeLanguageModal(false);
  }, []);

  const clickedFavLyricList = useCallback(() => {
    props.navigation.navigate('FavouriteLyricScreen');
  }, []);

  const clickedForgotPassword = useCallback(() => {
    props.navigation.navigate('ForgotPassword');
  }, []);

  const clickedKeepLoggedIn = useCallback(() => {
    if (isCheckKeepLoggedIn) {
      setIsCheckKeepLoggedIn(false);
    } else {
      setIsCheckKeepLoggedIn(true);
    }
  }, [isCheckKeepLoggedIn]);

  const onValidateDelete = (): boolean => {
    let isDelete = true;
    switch (true) {
      case deleteText !== 'DELETE':
        isDelete = false;
        setErrorDeletingAccount(true);
        break;

      default:
        setErrorDeletingAccount(false);
        break;
    }
    return isDelete;
  };
  console.log(showSuccessDialog);
  return (
    <View style={{flex: 1}}>
      <SafeAreaView
        edges={['top']}
        style={{flex: 1, backgroundColor: theme.backgroundColor}}>
        <KeyboardAwareScrollView
          // extraHeight={200}
          contentContainerStyle={{flex: 1}}
          style={{
            backgroundColor: theme.backgroundColor,
            flexDirection: 'column',
          }}
          showsVerticalScrollIndicator={false}>
          {props.token != null ? (
            <Animatable.View
              key={props.token}
              animation={animationForScreen}
              useNativeDriver={true}
              style={{width: '100%', height: '100%', flexDirection: 'column'}}>
              {/* <TouchableOpacity> */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  marginLeft: 20,
                }}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={70}
                  color={GeneralColor.app_theme}
                  style={{alignSelf: 'center'}}
                />
                <View style={{flexDirection: 'column', marginLeft: 12}}>
                  <TextView
                    text={profile.username}
                    textStyle={{
                      fontSize: 26,
                      fontWeight: 'bold',
                      color: theme.textColor,
                    }}
                  />

                  <TextView
                    text={profile.email}
                    textStyle={{fontSize: 14, marginBottom: 12}}
                  />
                </View>

                {/* <MaterialCommunityIcons
                    style={{
                      marginLeft: 12,
                      position: 'absolute',
                      right: 20,
                      top: 10,
                    }}
                    name="account-edit"
                    size={25}
                    color={theme.backgroundColor2}
                  /> */}
              </View>
              {/* </TouchableOpacity> */}
              <TextView
                text={label.yourFav}
                textStyle={{marginLeft: 20, marginTop: 24}}
              />

              <TouchableOpacity
                onPress={clickedFavBookList}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  alignSelf: 'center',
                  marginTop: 16,
                  flexDirection: 'row',
                  width: '90%',
                  alignItems: 'center',
                  backgroundColor: theme.backgroundColor3,
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FontAwesome
                    name="book"
                    size={30}
                    color={GeneralColor.app_theme}
                    style={{alignSelf: 'center'}}
                  />
                  <TextView
                    text={label.books}
                    textStyle={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginLeft: 20,
                    }}
                  />
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      width: 33,
                      height: 33,
                      justifyContent: 'center',
                      backgroundColor: GeneralColor.app_theme,
                      borderRadius: 33,
                      marginRight: 12,
                    }}>
                    <TextView
                      text={
                        props.fav_book_count == null
                          ? '0'
                          : props.fav_book_count.toString()
                      }
                      textStyle={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        alignSelf: 'center',
                      }}
                    />
                  </View>
                  <FontAwesome
                    name="angle-right"
                    size={25}
                    color={theme.backgroundColor2}
                    style={{alignSelf: 'center'}}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clickedFavLyricList}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  width: '90%',
                  alignItems: 'center',
                  backgroundColor: theme.backgroundColor3,
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Entypo
                    name="folder-music"
                    size={30}
                    color={GeneralColor.app_theme}
                    style={{alignSelf: 'center'}}
                  />
                  <TextView
                    text={label.lyrics}
                    textStyle={{
                      marginLeft: 20,
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}
                  />
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      width: 33,
                      height: 33,
                      justifyContent: 'center',
                      backgroundColor: GeneralColor.app_theme,
                      borderRadius: 33,
                      marginRight: 12,
                    }}>
                    <TextView
                      text={
                        props.fav_lyric_count == null
                          ? '0'
                          : props.fav_lyric_count.toString()
                      }
                      textStyle={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        alignSelf: 'center',
                      }}
                    />
                  </View>
                  <FontAwesome
                    name="angle-right"
                    size={25}
                    color={theme.backgroundColor2}
                    style={{alignSelf: 'center'}}
                  />
                </View>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  marginTop: 26,
                }}>
                <MaterialIcons
                  name="nightlight-round"
                  size={30}
                  color={theme.backgroundColor2}
                  style={{alignSelf: 'center', marginRight: 12}}
                />
                <ToggleSwitch
                  isOn={isLightMode}
                  onColor="grey"
                  offColor={theme.backgroundColor1}
                  size="large"
                  onToggle={isOn => {
                    setIsLightMode(isOn);
                    if (isOn) {
                      updateTheme('light');
                    } else {
                      updateTheme('dark');
                    }
                  }}
                />
                <MaterialIcons
                  name="wb-sunny"
                  size={30}
                  color={theme.backgroundColor2}
                  style={{alignSelf: 'center', marginLeft: 12}}
                />
              </View>

              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                  marginTop: 40,
                  alignItems: 'center',
                }}
                onPress={clickedChangeLanguage}>
                <TextView
                  text={label.language}
                  textStyle={{
                    fontSize: 16,
                    alignSelf: 'center',
                  }}
                />

                <Image
                  style={{
                    width: 25,
                    height: 15,
                    marginLeft: 12,
                    resizeMode: 'contain',
                  }}
                  source={
                    props.app_language == 'en'
                      ? require('../../assets/images/en_flag.png')
                      : require('../../assets/images/mm_flag.png')
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{alignSelf: 'center'}}
                onPress={clickedChangePassword}>
                <TextView
                  text={label.change_password}
                  textStyle={{
                    fontSize: 16,
                    alignSelf: 'center',
                    marginTop: 20,
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{alignSelf: 'center'}}
                onPress={clickedShowDeleteAccountModal}>
                <TextView
                  text={label.delete_account}
                  textStyle={{
                    fontSize: 14,
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    textDecorationLine: 'underline',
                    marginTop: 20,
                    color: 'red',
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{alignSelf: 'center'}}
                onPress={clickedLogout}>
                <TextView
                  text={label.logout}
                  textStyle={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    alignSelf: 'center',
                    marginTop: 40,
                    textDecorationLine: 'underline',
                  }}
                />
              </TouchableOpacity>

              <Modal
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                hasBackdrop={true}
                onBackdropPress={() => {
                  setIsVisibleChangeLanguageModal(false);
                }}
                isVisible={isVisibleChangeLanguageModal}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      backgroundColor: theme.backgroundColor,
                      width: '80%',
                      padding: 12,
                      borderRadius: 15,
                    }}>
                    <TouchableOpacity
                      onPress={clickedChangeEN}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <TextView textStyle={{fontSize: 16}} text={'English'} />

                      {props.app_language == 'en' ? (
                        <AntDesign
                          name="checkcircle"
                          size={25}
                          color={theme.backgroundColor2}
                          style={{alignSelf: 'center'}}
                        />
                      ) : (
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderWidth: 1,
                            borderRadius: 26,
                            borderColor: theme.backgroundColor2,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={clickedChangeMM}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                      }}>
                      <TextView textStyle={{fontSize: 16}} text={'မြန်မာ'} />

                      {props.app_language == 'mm' ? (
                        <AntDesign
                          name="checkcircle"
                          size={25}
                          color={theme.backgroundColor2}
                          style={{alignSelf: 'center'}}
                        />
                      ) : (
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 26,
                            borderWidth: 1,
                            borderColor: theme.backgroundColor2,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal
                style={{zIndex: 1}}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                hasBackdrop={true}
                onBackdropPress={() => {
                  setIsVisibleDeleteAccountModal(false);
                }}
                isVisible={isVisibleDeleteAccountModal}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                  }}>
                  <View
                    style={{
                      backgroundColor: theme.backgroundColor,
                      width: '95%',
                      paddingHorizontal: 12,
                      paddingVertical: 24,
                      borderRadius: 15,
                    }}>
                    <TextView
                      text={label.deleting_account}
                      textStyle={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 6,
                      }}
                    />
                    <TextView
                      text={label.delete_description}
                      textStyle={{fontSize: 13}}
                    />

                    <TextView
                      text={label.confirm_delete}
                      textStyle={{
                        fontSize: 13,
                        color: errorDeletingAccount ? 'red' : GeneralColor.grey,
                        marginBottom: 6,
                        marginTop: 12,
                        fontWeight: 'bold',
                      }}
                    />
                    <View style={{flexDirection: 'row'}}>
                      <TextInput
                        onChangeText={(text: string) => {
                          setDeleteText(text);
                        }}
                        style={{
                          width: '55%',
                          height: 35,
                          color: theme.backgroundColor2,
                          borderWidth: 1,
                          paddingLeft: 6,
                          borderRadius: 6,
                          marginRight: 12,
                          borderColor: theme.backgroundColor2,
                        }}
                      />
                      <TouchableOpacity
                        onPress={clickedDeleteAccount}
                        style={{
                          backgroundColor: 'red',
                          justifyContent: 'center',
                          paddingHorizontal: 12,
                          borderRadius: 10,
                          borderWidth: 2.5,
                          borderColor: GeneralColor.white,
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
                          text={label.delete}
                          textStyle={{
                            fontSize: 13,
                            color: GeneralColor.white,
                            fontWeight: 'bold',
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </Animatable.View>
          ) : (
            <Animatable.View
              key={props.token}
              useNativeDriver={true}
              animation={animationForScreen}
              style={{
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                flex: 1,
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: GeneralColor.light_grey,
                  borderRadius: 20,
                }}
                source={require('../../assets/images/sar_oak_sin_logo.jpg')}
              />
              <TextInputView
                autoCapitalize={'none'}
                value={loginData.email}
                onChangeText={onChangeText('email')}
                style={{marginTop: 46}}
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
                onChangeText={onChangeText('password')}
                isHideEyeButton={false}
                style={{marginTop: 16}}
                isShowPassword={isShowPassword}
                value={loginData.password}
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

              <View
                style={{
                  flexDirection: 'row',
                  width: '88%',
                  marginTop: 12,
                  paddingHorizontal: 12,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={clickedKeepLoggedIn}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    tintColors={{
                      true: GeneralColor.app_theme,
                      false: GeneralColor.grey,
                    }}
                    boxType="square"
                    style={{width: 18, height: 18, marginRight: 12}}
                    value={isCheckKeepLoggedIn}
                    onValueChange={newValue => setIsCheckKeepLoggedIn(newValue)}
                  />
                  <TextView
                    text={label.keep_me_logged_in}
                    textStyle={{fontSize: 12}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={clickedForgotPassword}>
                  <TextView
                    text={label.forgot_ur_password}
                    textStyle={{fontSize: 12, marginLeft: 6}}
                  />
                </TouchableOpacity>
              </View>

              <TextView
                text={errorMessage}
                textStyle={{
                  fontSize: 14,
                  color: 'red',
                  fontWeight: 'bold',
                  marginTop: 20,
                }}
              />

              <TouchableOpacity
                onPress={clickedLogin}
                style={{
                  width: 120,
                  height: 40,
                  marginTop: 30,
                  borderRadius: 50,
                  backgroundColor: GeneralColor.app_theme,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TextView
                  text={label.login}
                  textStyle={{fontSize: 18, fontWeight: 'bold', color: 'white'}}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={clickedSignUp}>
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
                      padding: 6,
                      borderWidth: 1,
                      borderColor: GeneralColor.app_theme,
                      fontSize: 12,
                      borderRadius: 5,
                      marginLeft: 10,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <SuccessfulDialog text={label.success} isVisible={showSuccessDialog} />

      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
};

export default connector(ProfileScreen);
