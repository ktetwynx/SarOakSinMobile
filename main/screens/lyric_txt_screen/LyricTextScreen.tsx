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
import {setPlayModeFontSize, setPlayModeScrolSpeed} from '../../redux/actions';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_KEY_PRODUCION, API_URL} from '../../config/Constant';
import {BackButton} from '../../components/BackButton';
import {ImageModeButton} from '../components/ImageModeButton';
import {IconButton} from '../components/IconButton';
import {LoadingScreen} from '../../components/LoadingScreen';
import * as Animatable from 'react-native-animatable';
import {PlayModeButton} from '../components/PlayModeButton';

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_lyric_count: number;
  playmode_fontsize: string;
  playmode_scrollSpeed: number;
}) => {
  return {
    profile: state.profile,
    token: state.token,
    fav_lyric_count: state.fav_lyric_count,
    playmode_fontsize: state.playmode_fontsize,
    playmode_scrollSpeed: state.playmode_scrollSpeed,
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
  const [currentPlayModeIndex, setCurrentPlayModeIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentPlayModeIndex(props.route.params.currentPlayModeIndex);
  }, [props.route.params]);

  useEffect(() => {
    setPlayModeListId(props.route.params.playModeIdList[currentPlayModeIndex]);
  }, [currentPlayModeIndex]);

  useEffect(() => {
    if (playModeListId != 0) {
      fetchLyricText();
    }
  }, [playModeListId]);

  const fetchLyricText = useCallback(async () => {
    setIsLoading(true);
    let formData = new FormData();
    formData.append('id', playModeListId.toString());
    await ApiFetchService(API_URL + `user/lyric/getLyricDetail`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      if (response.code == 200) {
        setLyricTextResponse(response.data);
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
    console.log(currentPlayModeIndex);
    if (currentPlayModeIndex != 0) {
      setCurrentPlayModeIndex(prev => prev - 1);
    }
  }, [currentPlayModeIndex]);

  const clickedNextSong = useCallback(() => {
    if (props.route.params.playModeIdList.length != currentPlayModeIndex + 1) {
      setCurrentPlayModeIndex(prev => prev + 1);
    }
  }, [currentPlayModeIndex, props.route.params.playModeIdList]);

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
              // onPress={clickedFavourite}
            >
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
            backgroundColor: theme.background,
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

        <IconButton
          animation={isPlaying ? 'fadeOutLeft' : 'fadeInLeft'}
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

        <IconButton
          animation={isPlaying ? 'fadeOutRight' : 'fadeInRight'}
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
          clickedImage={() => {}}
        />

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
      {isLoading ? <LoadingScreen /> : <></>}
    </>
  );
}

export default connector(LyricTextScreen);
