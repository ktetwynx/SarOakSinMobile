import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CountDown from 'react-native-countdown-component';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';

export interface AppProps {}

export function VerifyScreen(props: RootStackScreenProps<'VerifyScreen'>) {
  const [otpCode, setOtpCode] = useState<string>('');
  const [isResend, setIsResend] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [time, setTime] = React.useState(0);
  const timerRef = React.useRef(time);

  useEffect(() => {
    setUserEmail(props.route.params.email);
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
        Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
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
    let formData = new FormData();
    formData.append('email', userEmail);
    formData.append('otp', otpCode);
    await ApiFetchService(API_URL + `user/register-user/otp-verify`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      props.navigation.popToTop();
    });
  }, [otpCode]);

  const clickedVerify = useCallback(() => {
    if (otpCode.length < 6) {
      setErrorMessage('Please your otp code');
      return;
    } else {
      setErrorMessage('');
      fetchVerifyApi();
    }
  }, [otpCode]);

  const finishCountDown = useCallback(() => {
    setIsResend(false);
  }, []);

  return (
    <KeyboardAwareScrollView
      extraHeight={200}
      style={{flex: 1}}
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
          style={styles.otp_textInput}
        />

        <View style={{width: '100%'}}>
          <BackButton
            style={{alignSelf: 'flex-start', marginLeft: 16, marginTop: 10}}
            clickedGoBack={goBack}
          />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 26,
            marginTop: 80,
          }}>
          Verify your OTP code
        </Text>

        <View
          style={{
            flexDirection: 'row',
            marginBottom: 56,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 12}}>{`OTP sent to `}</Text>
          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{userEmail}</Text>
        </View>

        <View style={styles.otpView}>
          {Array(6)
            .fill(6)
            .map((data: any, index: number) => (
              <TouchableOpacity
                onPress={clickedOtpText}
                activeOpacity={1}
                key={index}
                style={styles.verifyCode}>
                <Text style={styles.otp_text}>
                  {otpCode && otpCode.length > 0 ? otpCode[index] : ''}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        <Text
          style={{
            color: 'red',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 20,
          }}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          onPress={clickedVerify}
          style={{
            width: '50%',
            height: 50,
            marginTop: 40,
            //   marginBottom: 100,
            borderRadius: 50,
            backgroundColor: 'grey',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
            {'Verify'}
          </Text>
        </TouchableOpacity>

        {time != 0 ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 20,
            }}>
            <Text style={{color: 'black'}}>{`please wait`}</Text>
            <Text style={{color: 'black', fontWeight: 'bold'}}> {time} </Text>
            <Text style={{color: 'black'}}>{'seconds'}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={clickedResend}>
            <Text
              style={{
                fontSize: 14,
                marginTop: 20,
                textDecorationLine: 'underline',
              }}>
              {'Resend OTP code'}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

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
    backgroundColor: '#CDAEAE',
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
    color: 'black',
    alignSelf: 'center',
  },
});
