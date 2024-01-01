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

  const songRenderRef = useRef<SongRenderRef>(null);
  const [scrollSpeedNumber, setScrollSpeedNumber] = useState<number>(0);
  const [lyricFontSize, setLyricFontSize] = useState('0');
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchLyricText();
  }, [props.route.params]);

  const fetchLyricText = useCallback(async () => {
    let formData = new FormData();
    formData.append('id', props.route.params.lyricTextId);
    console.log(formData);
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
    });
  }, []);

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: theme.backgroundColor,
      }}
      edges={['top']}>
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

      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{flexGrow: 1}}
        ref={scrollViewRef}
        style={{flexDirection: 'column'}}>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
            marginHorizontal: 6,

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
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
              onPress={() => clickedPlayAutoScroll()}>
              <View
                style={{
                  backgroundColor: GeneralColor.white,
                  width: 40,
                  height: 40,
                  borderRadius: 30,
                  position: 'absolute',
                }}
              />
              <AntDesign
                name={isPlaying ? 'pausecircle' : 'play'}
                size={35}
                color={isPlaying ? 'grey' : 'green'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 10,
                borderRadius: 20,
                backgroundColor: GeneralColor.app_theme,
              }}
              onPress={() => clickedChangeKey()}>
              <TextView
                text={'Change Key'}
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
          </View>
        </View>

        <SongTransformer
          chordProSong={lyricTextResponse?.lyricText}
          transposeDelta={transposeKey}
          showTabs={false}
          fontSize={parseInt(lyricFontSize)}>
          {songProps => (
            <View style={{flex: 1, marginTop: 10}}>
              <SongRender
                ref={songRenderRef}
                onPressArtist={() => {}}
                onPressChord={chordString => {}}
                chordProContent={songProps.htmlSong}
                scrollSpeed={scrollSpeedNumber}
              />
            </View>
          )}
        </SongTransformer>
      </ScrollView>
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
  );
}

export default connector(LyricTextScreen);
