import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ADS_INTERSTITIAL_UNIT_ID, API_URL} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import {BackButton} from '../../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ConnectedProps, connect} from 'react-redux';
import {setFavBookCount, setFavLyricCount} from '../../redux/actions';
import {ApiFetchService} from '../../service/ApiFetchService';
import {GeneralColor} from '../../utility/Themes';
import {Platform, TouchableOpacity, View} from 'react-native';
import {InterstitialAd, AdEventType} from 'react-native-google-mobile-ads';
import {LoginDialog} from '../../components/LoginDialog';

const mapstateToProps = (state: {profile: any; token: any}) => {
  return {
    profile: state.profile,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'ImageView'>;

function ImageView(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isShowAds, setIsShowAds] = useState<boolean>(false);
  const [isShowLoginDialog, setIsShowLoginDialog] = useState<boolean>(false);

  useEffect(() => {
    setLyricsImages(props.route.params.lyricsImages);
    setCurrentImageIndex(props.route.params.currentImageIndex);
    initialCheckFav();
    setIsShowAds(true);
  }, [props.route.params]);

  useEffect(() => {
    const adsThread = setTimeout(() => {
      try {
        showAd();
      } catch (error) {
        console.log('Ads Error', error);
      }
    }, 6000);

    const adsShowEvery20minThread = setInterval(() => {
      try {
        showAd();
      } catch (error) {
        console.log('Ads Error', error);
      }
    }, 900000);
    return () => {
      clearInterval(adsShowEvery20minThread);
      clearTimeout(adsThread);
      setIsShowAds(false);
    };
  }, [isShowAds]);

  const showAd = () => {
    if (isShowAds) {
      const interstitial = InterstitialAd.createForAdRequest(
        ADS_INTERSTITIAL_UNIT_ID,
        {
          requestNonPersonalizedAdsOnly: true,
          keywords: ['fashion', 'clothing'],
        },
      );
      interstitial.load();
      const unsubscribeLoaded = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          interstitial.show();
        },
      );

      return () => {
        unsubscribeLoaded();
      };
    }
  };

  const initialCheckFav = useCallback(() => {
    let data: any =
      props.route.params.lyricsImages[props.route.params.currentImageIndex];
    if (data?.isSaved) {
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }
  }, []);

  const fetchSaveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricsImages[currentImageIndex].lyricsId);
    formData.append('bookListId', props.profile.lyricCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/add-lyric-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${props.token}`,
      },
    ).then((response: any) => {
      if (response.code == 200) {
        props.setFavLyricCount(response.data);
        lyricsImages[currentImageIndex].isSaved = true;
        setIsFavourite(true);
      }
    });
  }, [props.profile, lyricsImages, currentImageIndex]);

  const fetchRemoveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricsImages[currentImageIndex].lyricsId);
    formData.append('bookListId', props.profile.lyricCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/remove-lyric-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      },
    ).then((response: any) => {
      if (response.code == 200) {
        props.setFavLyricCount(response.data);
        lyricsImages[currentImageIndex].isSaved = false;
        setIsFavourite(false);
      }
    });
  }, [props.profile, lyricsImages, currentImageIndex]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const changeImages = useCallback(
    (index?: number) => {
      setCurrentImageIndex(index ? index : 0);
      if (lyricsImages[index ? index : 0].isSaved) {
        setIsFavourite(true);
      } else {
        setIsFavourite(false);
      }
    },
    [lyricsImages],
  );

  const clickedFavourite = useCallback(() => {
    if (props.token != null) {
      if (isFavourite) {
        fetchRemoveLyricsApi();
      } else {
        fetchSaveLyricsApi();
      }
    } else {
      setIsShowLoginDialog(true);
    }
  }, [isFavourite, props, lyricsImages, currentImageIndex]);

  const clickedPlayLyric = useCallback(() => {
    const chordSheet = `
{t: ဒီအတိုင်း}
{artist:ဖော်ကာ}
{key:G}
{copyright:SarOakSin}


[G]မဖြစ်နိုင်တော့တဲ့ဘဝမှာ ငါတို့[Em]လမ်းခွဲခဲ့ပြီးမှ
[C]ပြန်ကာရှေ့ဆက်မတိုးပါနဲ့ ဒီအ[D]တိုင်းလေးကောင်းတာပဲ
[G]အမှားအမှန်တချို့ကိုသိအောင် နင်[Em]ရွက်လွှင့်ခဲ့ပြီးမှ
ဒါတွေ[C]နောက်ကျခဲ့ပြီပဲ တကယ်ဆိုအ[D]ကြိမ်ကြိမ်ငါလည်းမှားခဲ့တယ်

{start_of_chorus}
ဒီအ[G]တိုင်း ဒီအတိုင်းပဲခရီးဆက်[Em]ပါ ဆွေးမနေနဲ့
ဟို[C]တုန်းကလိုမျိုးမဖြစ်နိုင်တာ ဒါတွေ[D]နောက်ကျခဲ့ပြီပဲ
အရင်အ[G]တိုင်း အရင်အတိုင်းပဲမုန်းလိုက်[Em]ပါ အမှန်ကိုမသိချင်နဲ့
[C]အစွန်းအထင်းတွေမှမရှိတာကွာ [D]ဘဝသစ်တစ်ခုပြန်စ
{end_of_chorus}

		Music: G Em C D

အထင်လွဲတဲ့မီးတွေငြိမ်းအောင် ငါလေကြိုးစားခဲ့တုန်းက
ဘာကြောင့်မင်းကမသိသလိုနဲ့ အဝေးကြီးပုန်းရှောင်ခဲ့
မေတ္တာငတ်နေခဲ့သမျှ နင်လေကျောခိုင်းခဲ့တဲ့နောက်
ဒဏ်ရာအားလုံးဖေးကူတဲ့ ကြင်နာနိုင်သူလက်ထဲရောက်ခဲ့တယ်

		Solo: G Em C D

မေ့[Em]ထားပါ အရင်အတိတ်[D]ဘဝ
အခွင့်အရေးမှမရှိတော့[Em]တာ ဖြစ်သလိုစိတ်တင်း[D]ထား

		Key change: A

{comment: Made by SarOakSin}
`;
    props.navigation.navigate('LyricTextScreen', {
      lyricText: chordSheet,
      title: 'ဒီအတိုင်း',
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      <ImageViewer
        style={{
          backgroundColor: theme.backgroundColor,
          width: '100%',
          height: '100%',
        }}
        onSwipeDown={() => {
          goBack();
        }}
        renderIndicator={(currentIndex?: number) => {
          return <></>;
        }}
        renderHeader={(currentIndex?: number) => {
          let number: any = currentIndex;
          return (
            <View
              style={{
                alignSelf: 'center',
                position: 'absolute',
                zIndex: 1,
                marginTop: 16,
              }}>
              <View
                style={{
                  backgroundColor: 'black',
                  width: 60,
                  height: 30,
                  opacity: 0.5,
                  borderRadius: 30,
                }}
              />
              <TextView
                textStyle={{
                  color: 'white',
                  position: 'absolute',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 14,
                  marginTop: 4,
                }}
                text={`${number + 1}/${lyricsImages.length}`}
              />
            </View>
          );
        }}
        saveToLocalByLongPress={false}
        onChange={(index?: number) => changeImages(index)}
        enableImageZoom={true}
        enableSwipeDown={true}
        index={props.route.params.currentImageIndex}
        imageUrls={props.route.params.lyricsImages}
        useNativeDriver={true}
      />

      <View
        style={{
          position: 'absolute',
          top: Platform.OS == 'ios' ? 50 : 10,
          left: 12,
        }}>
        <TouchableOpacity
          style={{justifyContent: 'center', alignItems: 'center'}}
          onPress={goBack}>
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: 'black',
              opacity: 0.6,
              position: 'absolute',
              borderRadius: 45,
            }}
          />
          <Ionicons
            name="ios-arrow-back-circle-sharp"
            size={38}
            style={{marginLeft: 2}}
            color={GeneralColor.white}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: 'absolute',
          top: Platform.OS == 'ios' ? 50 : 14,
          right: Platform.OS == 'ios' ? 12 : 15,
        }}>
        <TouchableOpacity
          style={{justifyContent: 'center', alignItems: 'center'}}
          onPress={clickedFavourite}>
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: 'black',
              opacity: 0.6,
              position: 'absolute',
              borderRadius: 45,
            }}
          />
          <AntDesign
            name={isFavourite ? 'heart' : 'hearto'}
            size={30}
            color={isFavourite ? 'red' : GeneralColor.white}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 30,
          alignSelf: 'center',
        }}>
        <TouchableOpacity
          style={{justifyContent: 'center', alignItems: 'center'}}
          onPress={clickedPlayLyric}>
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: GeneralColor.app_theme,
              opacity: 0.8,
              position: 'absolute',
              borderRadius: 45,
            }}
          />
          <AntDesign name={'play'} size={35} color={GeneralColor.white} />
        </TouchableOpacity>
      </View>
      <LoginDialog
        clickedLogin={() => {
          props.navigation.navigate('ProfileScreen');
        }}
        clickedSignUp={() => {
          props.navigation.navigate('SignUpScreen');
          setIsShowLoginDialog(false);
        }}
        isVisible={isShowLoginDialog}
        clickedClosed={() => {
          setIsShowLoginDialog(false);
        }}
      />
    </View>
  );
}

export default connector(ImageView);
