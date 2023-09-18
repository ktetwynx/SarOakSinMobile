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
import Animated, {
  BounceIn,
  BounceInDown,
  BounceOut,
  BounceOutDown,
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

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
  const [lyricText, setLyricText] = useState('');
  const [lyricTitle, setLyricTitle] = useState('');
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isShowAds, setIsShowAds] = useState<boolean>(false);
  const [isShowLoginDialog, setIsShowLoginDialog] = useState<boolean>(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    setLyricsImages(props.route.params.lyricsImages);
    setCurrentImageIndex(props.route.params.currentImageIndex);
    initialCheckFav();
    setIsShowAds(true);
    startShake();
    // startBigSmall();
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
    setLyricText(data?.lyricText);
    setLyricTitle(data?.lyricTitle);
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
      setLyricText(lyricsImages[index ? index : 0].lyricText);
      setLyricTitle(lyricsImages[index ? index : 0].lyricTitle);
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
    props.navigation.navigate('LyricTextScreen', {
      lyricText: lyricText,
      lyricTitle: lyricTitle,
    });
  }, [lyricText, lyricTitle]);

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: `${rotation.value}deg`}],
    };
  });

  const stopShake = () => {
    rotation.value = 0;
  };

  const startShake = () => {
    rotation.value = withRepeat(
      withSequence(
        withSpring(10, {
          damping: 50,
          mass: 0.1,
          stiffness: 200,
          restDisplacementThreshold: 0.1,
        }),

        withSpring(-10, {
          damping: 50,
          mass: 0.1,
          stiffness: 200,
          restDisplacementThreshold: 0.1,
        }),

        withSpring(0, {
          damping: 200,
          mass: 1,
          stiffness: 70,
          restDisplacementThreshold: 1,
        }),
        withSpring(-10, {
          damping: 50,
          mass: 0.1,
          stiffness: 200,
          restDisplacementThreshold: 0.1,
        }),
        withSpring(10, {
          damping: 50,
          mass: 0.1,
          stiffness: 200,
          restDisplacementThreshold: 0.1,
        }),
      ),
      -1,
      true,
    );
  };

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

      {lyricText ? (
        <Animated.View
          style={[
            shakeAnimatedStyle,
            {position: 'absolute', bottom: 50, alignSelf: 'center'},
          ]}
          entering={FadeInDown}
          exiting={FadeOutDown}>
          <TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center'}}
            onPress={clickedPlayLyric}>
            <View
              style={{
                width: 70,
                height: 70,
                backgroundColor: GeneralColor.black,
                opacity: 0.3,
                position: 'absolute',
                borderRadius: 12,
              }}
            />
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: GeneralColor.app_theme,
                position: 'absolute',
                borderRadius: 12,
                borderWidth: 3,
                borderColor: 'white',
              }}
            />
            <AntDesign
              style={{
                borderRadius: 12,
                // padding: 5,
                borderColor: 'white',
              }}
              name={'play'}
              size={35}
              color={GeneralColor.white}
            />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <></>
      )}

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
