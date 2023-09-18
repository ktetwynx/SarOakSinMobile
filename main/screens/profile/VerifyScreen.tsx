import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import {View, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CountDown from 'react-native-countdown-component';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_KEY_PRODUCION, API_URL} from '../../config/Constant';
import i18n from '../../language/i18n';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import {
  Profile,
  setFavBookCount,
  setFavLyricCount,
  setProfile,
  setToken,
} from '../../redux/actions';
import {ConnectedProps, connect} from 'react-redux';
import {LoadingScreen} from '../../components/LoadingScreen';
import {GeneralColor} from '../../utility/Themes';

export interface AppProps {}

const mapstateToProps = (state: {}) => {
  return {};
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setToken: (token: any) => {
      dispatch(setToken(token));
    },
    setProfile: (profile: Profile) => {
      dispatch(setProfile(profile));
    },
    setFavBookCount: (fav_book_count: number) => {
      dispatch(setFavBookCount(fav_book_count));
    },
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'VerifyScreen'>;

const VerifyScreen = (props: Props) => {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [otpCode, setOtpCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResend, setIsResend] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [verifyType, setVerifyType] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef(time);
  const [label, setLabel] = React.useState({
    verify_your_otp: i18n.t('verify_your_otp'),
    confirm: i18n.t('confirm'),
    otp_sent_to: i18n.t('otp_sent_to'),
    please_wait: i18n.t('please_wait'),
    resend_otp: i18n.t('resend_otp'),
    seconds: i18n.t('seconds'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        verify_your_otp: i18n.t('verify_your_otp'),
        confirm: i18n.t('confirm'),
        otp_sent_to: i18n.t('otp_sent_to'),
        please_wait: i18n.t('please_wait'),
        resend_otp: i18n.t('resend_otp'),
        seconds: i18n.t('seconds'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setUserEmail(props.route.params.email);
    setVerifyType(props.route.params.verifyType);
  }, [props.route.params]);

  useEffect(() => {
    const timerId = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current < 0) {
        clearInterval(timerId);
      } else {
        setTime(timerRef.current);
      }
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [timerRef.current]);

  const fetchResendOtpApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('email', userEmail);
    await ApiFetchService(
      API_URL + `user/register-user/send-otp-by-email`,
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: API_KEY_PRODUCION,
      },
    ).then((response: any) => {
      console.log(response);
    });
  }, [userEmail]);

  const otpTextInputRef: any = useRef(null);
  const clickedOtpText = useCallback(() => {
    otpTextInputRef.current?.focus();
  }, []);

  const onChangeOtpText = (text: string) => {
    setOtpCode(text);
  };

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedResend = useCallback(() => {
    timerRef.current = 20;
    setTime(20);
    fetchResendOtpApi();
  }, [userEmail]);

  const fetchVerifyApi = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('email', userEmail);
    formData.append('otp', otpCode);
    await ApiFetchService(API_URL + `user/register-user/otp-verify`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      if (response.code == 200) {
        if (verifyType == 1) {
          setTimeout(() => {
            setIsLoading(false);
            console.log(response.data, '<<<fromVerify');
            props.setToken(response.data.jwtToken);
            props.setProfile(response.data);
            props.setFavBookCount(response.data.bookCount);
            props.setFavLyricCount(response.data.lyricCount);
            props.navigation.popToTop();
          }, 1000);
        } else {
          setTimeout(() => {
            setIsLoading(false);
            props.navigation.navigate('ResetPassword', {
              email: userEmail,
              token: response.data.jwtToken,
            });
          }, 1000);
        }
      } else {
        setIsLoading(false);
        setErrorMessage(response.message);
      }
    });
  }, [otpCode, verifyType]);

  const clickedVerify = useCallback(() => {
    if (otpCode.length < 6) {
      setErrorMessage('Please enter your otp code');
      return;
    } else {
      setErrorMessage('');
      fetchVerifyApi();
    }
  }, [otpCode, verifyType]);

  const finishCountDown = useCallback(() => {
    setIsResend(false);
  }, []);

  return (
    <>
      <KeyboardAwareScrollView
        extraHeight={200}
        style={{flex: 1, backgroundColor: theme.backgroundColor}}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView
          edges={['top']}
          style={{flex: 1, alignItems: 'center', flexDirection: 'column'}}>
          <TextInput
            autoFocus={true}
            ref={otpTextInputRef}
            keyboardType={'numeric'}
            onChangeText={onChangeOtpText}
            maxLength={6}
            style={[styles.otp_textInput, {color: theme.textColor}]}
          />

          <View style={{width: '100%'}}>
            <BackButton
              style={{alignSelf: 'flex-start', marginLeft: 16, marginTop: 10}}
              clickedGoBack={goBack}
            />
          </View>

          <TextView
            text={label.verify_your_otp}
            textStyle={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 26,
              marginTop: 80,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 56,
              alignItems: 'center',
            }}>
            <TextView text={label.otp_sent_to} textStyle={{fontSize: 12}} />
            <TextView
              text={userEmail}
              textStyle={{fontSize: 14, fontWeight: 'bold', maxWidth: 200}}
            />
          </View>

          <View style={styles.otpView}>
            {Array(6)
              .fill(6)
              .map((data: any, index: number) => (
                <TouchableOpacity
                  onPress={clickedOtpText}
                  activeOpacity={1}
                  key={index}
                  style={[
                    styles.verifyCode,
                    {backgroundColor: theme.backgroundColor3},
                  ]}>
                  <TextView
                    text={otpCode && otpCode.length > 0 ? otpCode[index] : ''}
                    textStyle={styles.otp_text}
                  />
                </TouchableOpacity>
              ))}
          </View>

          <TextView
            text={errorMessage}
            textStyle={{
              color: 'red',
              fontSize: 14,
              fontWeight: 'bold',
              marginTop: 20,
            }}
          />
          <TouchableOpacity
            onPress={clickedVerify}
            style={{
              width: 120,
              height: 40,
              marginTop: 40,
              //   marginBottom: 100,
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

          {time != 0 ? (
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 20,
              }}>
              <TextView text={label.please_wait} textStyle={{fontSize: 14}} />
              <TextView
                text={time.toString()}
                textStyle={{fontWeight: 'bold'}}
              />
              <TextView text={label.seconds} textStyle={{}} />
            </View>
          ) : (
            <TouchableOpacity onPress={clickedResend}>
              <TextView
                text={label.resend_otp}
                textStyle={{
                  fontSize: 14,
                  marginTop: 20,
                  textDecorationLine: 'underline',
                }}
              />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </KeyboardAwareScrollView>
      {isLoading ? <LoadingScreen /> : <></>}
    </>
  );
};

const styles = StyleSheet.create({
  otpView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'center',
    width: '88%',
  },
  verifyCode: {
    width: 50,
    height: 50,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    justifyContent: 'center',
    borderRadius: 10,
  },

  otp_textInput: {
    width: 1,
    height: 1,
    position: 'absolute',
    top: -1000,
  },
  otp_text: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default connector(VerifyScreen);
