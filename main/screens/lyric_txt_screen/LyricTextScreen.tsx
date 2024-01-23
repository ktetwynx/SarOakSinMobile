import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  RootStackScreenProps,
  RootTabScreenProps,
} from '../../route/StackParamsTypes';
import ChordSheetJS, {Song} from 'chordsheetjs';
import {ConnectedProps, connect} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
// import Animated, {
//   FadeInDown,
//   FadeOutDown,
//   SlideInLeft,
//   SlideInRight,
// } from 'react-native-reanimated';
import {GeneralColor} from '../../utility/Themes';
import {TextView} from '../../components/TextView';
import {ChangeKeyDialog} from '../../components/ChangeKeyDialog';
import {ThemeContext} from '../../utility/ThemeProvider';
import KeepAwake from 'react-native-keep-awake';
import WebView from 'react-native-webview';
import SongTransformer from './SongTransformer';
import SongRender, {SongRenderRef} from './SongRender';
import CustomHtmlDivFormatter from './CustomHtmlDivFormatter';
import {
  setAdsShowTime,
  setFavLyricCount,
  setPlayModeFontSize,
  setPlayModeScrolSpeed,
} from '../../redux/actions';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
  API_KEY_PRODUCION,
  API_URL,
  SET_ADS_DURATION,
} from '../../config/Constant';
import {BackButton} from '../../components/BackButton';
import {ImageModeButton} from '../components/ImageModeButton';
import {IconButton} from '../components/IconButton';
import {LoadingScreen} from '../../components/LoadingScreen';
import * as Animatable from 'react-native-animatable';
import {PlayModeButton} from '../components/PlayModeButton';
import {LoginDialog} from '../../components/LoginDialog';
import {ViewMoreButton1} from '../../components/ViewMoreButton1';

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_lyric_count: number;
  playmode_fontsize: string;
  playmode_scrollSpeed: number;
  ads_show_time: number;
}) => {
  return {
    profile: state.profile,
    token: state.token,
    fav_lyric_count: state.fav_lyric_count,
    playmode_fontsize: state.playmode_fontsize,
    playmode_scrollSpeed: state.playmode_scrollSpeed,
    ads_show_time: state.ads_show_time,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setPlayModeFontSize: (playmode_fontsize: string) => {
      dispatch(setPlayModeFontSize(playmode_fontsize));
    },
    setPlayModeScrolSpeed: (playmode_scrollSpeed: number) => {
      dispatch(setPlayModeScrolSpeed(playmode_scrollSpeed));
    },
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
    setAdsShowTime: (ads_show_time: number) => {
      dispatch(setAdsShowTime(ads_show_time));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'LyricTextScreen'>;

function LyricTextScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const [orginalKey, setOrginalKey] = useState('');
  const [transposeKey, setTransposeKey] = useState(0);
  const [lyricTextResponse, setLyricTextResponse] = useState<any>();
  const [isShowChangeKeyDialog, setIsShowChangeKeyDialog] = useState(false);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);

  const songRenderRef = useRef<SongRenderRef>(null);
  const [scrollSpeedNumber, setScrollSpeedNumber] = useState<number>(0);
  const [lyricFontSize, setLyricFontSize] = useState('0');
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const {width, height} = Dimensions.get('screen');
  const [playModeListId, setPlayModeListId] = useState<number>(0);
  const [currentPlayModeIndex, setCurrentPlayModeIndex] = useState<number>(-1);
  const [isShowLoginDialog, setIsShowLoginDialog] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPlayModeIndex(props.route.params.currentPlayModeIndex);
    console.log(props.route.params.currentPlayModeIndex);
  }, [props.route.params.currentPlayModeIndex]);

  useEffect(() => {
    if (
      props.route.params.playModeIdList.length == 0 &&
      currentPlayModeIndex == -1
    ) {
      setPlayModeListId(props.route.params.lyricTextId);
    } else {
      setPlayModeListId(
        props.route.params.playModeIdList[currentPlayModeIndex],
      );
    }
  }, [currentPlayModeIndex]);

  useEffect(() => {
    if (playModeListId && playModeListId != 0) {
      fetchLyricText();
    }
  }, [playModeListId, props.profile?.id]);

  useEffect(() => {
    const adsThread = setTimeout(
      () => {
        try {
          props.setAdsShowTime(props.ads_show_time + 1);
        } catch (error) {
          console.log('Ads Error', error);
        }
      },
      props.ads_show_time == 5 ? 200 : SET_ADS_DURATION,
    );

    return () => {
      clearTimeout(adsThread);
    };
  }, [playModeListId]);

  const fetchLyricText = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('id', playModeListId);
    formData.append('userId', props.profile?.id ? props.profile?.id : '0');
    await ApiFetchService(API_URL + `user/lyric/getLyricDetail`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      if (response.code == 200) {
        setLyricTextResponse(response.data);
        setIsFavourite(response.data.saved);
        setLyricFontSize(props.playmode_fontsize);
        setScrollSpeed(props.playmode_scrollSpeed);
        const song = new ChordSheetJS.ChordProParser().parse(
          response.data.lyricText,
        );
        setOrginalKey(song.metadata.key);
      }
      // setIsLoading(false);
    });
  }, [playModeListId]);

  useEffect(() => {
    if (isPlaying) {
      setScrollSpeedNumber(scrollSpeed);
    } else {
      setScrollSpeedNumber(0);
    }
  }, [isPlaying, scrollSpeed]);

  const clickedChangeKey = useCallback(() => {
    setIsPlaying(false);
    setIsShowChangeKeyDialog(true);
  }, []);

  const clickedPlayAutoScroll = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const isReachToScrollEnd = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    // const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height;
  };

  const goBack = useCallback(() => {
    setIsPlaying(false);
    props.navigation.goBack();
  }, []);

  const clickedPreviousSong = useCallback(() => {
    if (currentPlayModeIndex != 0) {
      setCurrentPlayModeIndex(prev => prev - 1);
    }
  }, [currentPlayModeIndex]);

  const clickedNextSong = useCallback(() => {
    if (props.route.params.playModeIdList.length != currentPlayModeIndex + 1) {
      setCurrentPlayModeIndex(prev => prev + 1);
    }
  }, [currentPlayModeIndex, props.route.params.playModeIdList]);

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
  }, [isFavourite, props, lyricTextResponse]);

  const fetchSaveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricTextResponse.id);
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
        // lyricTextResponse.isSaved = true;
        setIsFavourite(true);
      }
    });
  }, [props.profile, lyricTextResponse]);

  const fetchRemoveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricTextResponse.id);
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
        setIsFavourite(false);
      }
    });
  }, [props.profile, lyricTextResponse]);

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: GeneralColor.app_theme,
          flexDirection: 'column',
        }}
        edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 12,
            paddingBottom: 10,
            paddingHorizontal: 6,
            alignItems: 'flex-start',
          }}>
          <BackButton
            style={{marginHorizontal: 6}}
            clickedGoBack={() => {
              goBack();
            }}
          />
          <View
            style={{
              flexDirection: 'column',
              marginLeft: 4,
              flex: 1,
            }}>
            <TextView
              text={lyricTextResponse?.name}
              numberOfLines={2}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
              }}
            />
            <View style={{flexDirection: 'row'}}>
              {lyricTextResponse?.authors?.map((_: any, index: number) => {
                return (
                  <TextView
                    key={index}
                    textStyle={{
                      fontSize: 11,
                      color: theme.textColor,
                      opacity: 0.7,
                      marginRight: 3,
                      marginTop: 3,
                    }}
                    text={_.name}
                  />
                );
              })}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              flex: 1,
            }}>
            <PlayModeButton
              isLyricTextScreen={true}
              isPlaying={isPlaying}
              borderWidth={2.5}
              borderRadius={8}
              style={{
                // position: 'absolute',
                // bottom: 50,
                alignSelf: 'center',
                width: 45,
                height: 45,
              }}
              iconSize={23}
              clickedPlayLyric={() => clickedPlayAutoScroll()}
            />

            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 10,
                alignSelf: 'center',
                marginHorizontal: 6,
                borderRadius: 20,
                borderWidth: 3,
                borderColor: GeneralColor.white,
                backgroundColor: GeneralColor.app_theme,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,
                elevation: 7,
              }}
              onPress={() => clickedChangeKey()}>
              <TextView
                text={'Key'}
                textStyle={{
                  color: GeneralColor.white,
                  fontSize: 14,
                  marginBottom: Platform.OS == 'ios' ? 0 : 2,
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              />
              <Ionicons name={'settings-sharp'} size={18} color={'white'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
              onPress={clickedFavourite}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'black',
                  opacity: 0.6,
                  position: 'absolute',
                  borderRadius: 45,
                }}
              />
              <AntDesign
                name={isFavourite ? 'heart' : 'hearto'}
                size={25}
                color={isFavourite ? 'red' : GeneralColor.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            width: '100%',
            height: '100%',
            // backgroundColor: theme.background,
            // backgroundColor: 'red',
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            overflow: 'hidden',
            justifyContent: 'center',
            flex: 1,
          }}>
          <SongTransformer
            chordProSong={lyricTextResponse?.lyricText}
            transposeDelta={transposeKey}
            showTabs={false}
            fontSize={parseInt(lyricFontSize)}>
            {songProps => (
              <SongRender
                isPlaying={isPlaying}
                ref={songRenderRef}
                onPressArtist={() => {}}
                onPressChord={chordString => {}}
                chordProContent={songProps.htmlSong}
                scrollSpeed={scrollSpeedNumber}
                onLoadEnd={onLoadEnd => {
                  setIsLoading(!onLoadEnd);
                }}
                isScrollEnd={isScrollEnd => {
                  if (isScrollEnd) {
                    setIsPlaying(false);
                  }
                }}
              />
            )}
          </SongTransformer>
          <Image
            style={{
              width: 300,
              height: 300,
              opacity: 0.15,
              alignSelf: 'center',
              backgroundColor: GeneralColor.light_grey,
              position: 'absolute',
              borderRadius: 50,
            }}
            source={require('../../assets/images/sar_oak_sin_logo.jpg')}
          />
        </View>

        {currentPlayModeIndex == -1 ? (
          <></>
        ) : (
          <>
            <IconButton
              animation={
                isPlaying || currentPlayModeIndex == 0
                  ? 'fadeOutLeft'
                  : 'fadeInLeft'
              }
              iconMarginLeft={0}
              iconMarginRight={4}
              iconName="chevron-left"
              borderRadius={50}
              style={{
                position: 'absolute',
                bottom: height / 2.2,
                left: 10,
                width: 50,
                height: 50,
              }}
              iconSize={22}
              clickedIcon={() => {
                clickedPreviousSong();
              }}
            />

            {props.route.params.isComeFromLyricScreen &&
            props.route.params.playModeIdList.length ==
              currentPlayModeIndex + 1 ? (
              <ViewMoreButton1
                animation={isPlaying ? 'fadeOutRight' : 'fadeInRight'}
                borderRadius={10}
                style={{
                  position: 'absolute',
                  bottom: height / 2.25,
                  right: 10,
                  width: 80,
                  height: 65,
                }}
                clickedViewMore={() => {
                  props.navigation.navigate('PlayModeViewMoreScreen');
                }}
              />
            ) : (
              <IconButton
                animation={
                  isPlaying ||
                  currentPlayModeIndex + 1 ==
                    props.route.params.playModeIdList.length
                    ? 'fadeOutRight'
                    : 'fadeInRight'
                }
                iconMarginLeft={4}
                iconMarginRight={0}
                iconName="chevron-right"
                borderRadius={50}
                style={{
                  position: 'absolute',
                  bottom: height / 2.2,
                  right: 10,
                  width: 50,
                  height: 50,
                }}
                iconSize={22}
                clickedIcon={() => {
                  clickedNextSong();
                }}
              />
            )}

            <ImageModeButton
              animationObject={{
                animation: isPlaying ? 'fadeOutDown' : 'fadeInUp',
                iterationCount: 1,
              }}
              borderWidth={3}
              borderRadius={12}
              style={{
                position: 'absolute',
                bottom: 50,
                alignSelf: 'center',
                width: 65,
                height: 65,
              }}
              iconSize={28}
              clickedImage={() => {
                let lyricsImages: any = [];
                lyricsImages.push({
                  url: API_URL + lyricTextResponse.imgPath,
                  isSaved: lyricTextResponse.saved,
                  lyricsId: lyricTextResponse.id,
                  lyricText: lyricTextResponse.lyricText,
                  lyricTitle: lyricTextResponse.name,
                  lyricAuthor: lyricTextResponse.authors,
                });
                props.navigation.navigate('ImageView', {
                  currentImageIndex: 0,
                  lyricsImages: lyricsImages,
                  isComeFromLyricText: true,
                });
              }}
            />
          </>
        )}

        <ChangeKeyDialog
          clickedChangeFont={(_: string) => {
            setLyricFontSize(_);
            props.setPlayModeFontSize(_);
          }}
          sliderOnValueChange={(value: number) => {
            setTransposeKey(value);
          }}
          sliderScrollSpeedOnValueChange={(value: number) => {
            setScrollSpeed(value);

            props.setPlayModeScrolSpeed(parseFloat(value.toFixed(2)));
          }}
          currentLyricFontSize={lyricFontSize}
          currentScrollSpeed={scrollSpeed}
          orignalKey={orginalKey}
          currentTransposeKey={transposeKey}
          clickedClosed={() => {
            setIsShowChangeKeyDialog(false);
          }}
          isVisible={isShowChangeKeyDialog}
        />
      </SafeAreaView>
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
      {isLoading ? <LoadingScreen /> : <></>}
    </>
  );
}

export default connector(LyricTextScreen);
