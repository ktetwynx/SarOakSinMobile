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

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_lyric_count: number;
}) => {
  return {
    profile: state.profile,
    token: state.token,
    fav_lyric_count: state.fav_lyric_count,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'LyricTextScreen'>;

function LyricTextScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;

  const [chordSheet, setChordSheet] = useState<any>();
  const [orginalKey, setOrginalKey] = useState('');
  const [lyricTitle, setLyricTitle] = useState('');
  const [transposeKey, setTransposeKey] = useState(0);
  const [isShowChangeKeyDialog, setIsShowChangeKeyDialog] = useState(false);

  const songRenderRef = useRef<SongRenderRef>(null);
  const [scrollSpeedNumber, setScrollSpeedNumber] = useState<number>(0);
  const [lyricFontSize, setLyricFontSize] = useState('14');
  const [scrollSpeed, setScrollSpeed] = useState('Medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setLyricTitle(props.route.params.lyricTitle);
    setChordSheet(props.route.params.lyricText);
    const song = new ChordSheetJS.ChordProParser().parse(
      props.route.params.lyricText,
    );
    setOrginalKey(song.metadata.key);
  }, [props.route.params]);

  useEffect(() => {
    if (isPlaying) {
      if (scrollSpeed == 'Slow') {
        setScrollSpeedNumber(0.05);
      } else if (scrollSpeed == 'Medium') {
        setScrollSpeedNumber(0.4);
      } else if (scrollSpeed == 'Fast') {
        setScrollSpeedNumber(0.9);
      }
    } else {
      setScrollSpeedNumber(0);
      console.log('stop');
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
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1.2,
              marginRight: 12,
            }}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
              }}
              onPress={goBack}>
              <Ionicons
                name="ios-arrow-back-circle-sharp"
                size={38}
                style={{marginLeft: 2}}
                color={GeneralColor.app_theme}
              />
            </TouchableOpacity>

            <TextView
              text={lyricTitle}
              numberOfLines={2}
              textStyle={{
                fontSize: 18,
                // width: '100%',
                // backgroundColor: 'red',
                fontWeight: 'bold',
                marginLeft: 10,
                flex: 1,
              }}
            />
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
                  marginBottom: 2,
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              />
              <Ionicons name={'settings-sharp'} size={18} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>

        <SongTransformer
          chordProSong={chordSheet}
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
        clickedChangeFont={(_: any) => {
          setLyricFontSize(_);
        }}
        clickedChangedScrollSpeed={(_: any) => {
          setScrollSpeed(_);
        }}
        sliderOnValueChange={(value: number) => {
          setTransposeKey(value);
        }}
        currentScrollSpeed={scrollSpeed}
        currentLyricFontSize={lyricFontSize}
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
