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
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
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
import ImageView from '../image_view/ImageView';
import {ThemeContext} from '../../utility/ThemeProvider';

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

  const [song, setSong] = useState<Song>();
  const [formattedLyricText, setFormattedLyricText] = useState('');
  const [lyricKey, setLyricKey] = useState('');
  const [lyricTitle, setLyricTitle] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [shardOrFlat, setShardOrFlat] = useState('');
  const [isShowChangeKeyDialog, setIsShowChangeKeyDialog] = useState(false);
  const [lyricFontSize, setLyricFontSize] = useState('16');
  const [scrollSpeed, setScrollSpeed] = useState('Medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollSpeedRate, setScrollSpeedRate] = useState({
    plusOffSet: 0,
    duration: 0,
  });

  useEffect(() => {
    setLyricTitle(props.route.params.lyricTitle);
    const song = parseSong(props.route.params.lyricText);
    if (song.metadata?.key) {
      setSong(song);
    } else {
      const defaultKeySong = song.setKey('G');
      setSong(defaultKeySong);
    }
  }, [props.route.params]);

  useEffect(() => {
    setCurrentKey(
      song?.metadata.key.split('', 2)[0]
        ? song.metadata.key.split('', 2)[0]
        : '',
    );
    setShardOrFlat(
      song?.metadata.key.split('', 2)[1]
        ? song.metadata.key.split('', 2)[1]
        : '',
    );
  }, [song]);

  useEffect(() => {
    if (lyricKey != '') {
      const changedKeySong = song?.changeKey(lyricKey);
      setFormattedLyricText(changedKeySong ? formatSong(changedKeySong) : '');
    }
  }, [lyricKey, song]);

  useEffect(() => {
    if (scrollSpeed == 'Slow') {
      setScrollSpeedRate({plusOffSet: 1, duration: 2000});
    } else if (scrollSpeed == 'Medium') {
      setScrollSpeedRate({plusOffSet: 1, duration: 1000});
    } else if (scrollSpeed == 'Fast') {
      setScrollSpeedRate({plusOffSet: 2, duration: 500});
    }
  }, [scrollSpeed]);

  useEffect(() => {
    if (shardOrFlat != '' || currentKey != '') {
      setLyricKey(`${currentKey}${shardOrFlat}`);
    }
  }, [shardOrFlat, currentKey]);

  useEffect(() => {
    if (isPlaying) {
      let offset = 0;
      const autoScrolling = setInterval(() => {
        offset += scrollSpeedRate.plusOffSet;
        scrollViewRef.current?.scrollTo({x: 0, y: offset, animated: true});
      }, scrollSpeedRate.duration);
      return () => clearInterval(autoScrolling);
    }
  }, [isPlaying]);

  function parseSong(text: string) {
    const parser = new ChordSheetJS.ChordProParser();
    const song = parser.parse(text);
    return song;
  }

  function formatSong(song: Song) {
    const formatter = new ChordSheetJS.TextFormatter();
    const disp = formatter.format(song);
    return disp;
  }
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
        onScroll={({nativeEvent}) => {
          if (isReachToScrollEnd(nativeEvent)) {
            setIsPlaying(false);
          }
        }}
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

        <View
          onTouchStart={event => {
            setIsPlaying(false);
          }}
          style={{flex: 1}}>
          <TextView
            text={formattedLyricText}
            textStyle={{
              padding: 12,
              flex: 1,
              fontSize: parseInt(lyricFontSize),
            }}
          />
        </View>
      </ScrollView>
      <ChangeKeyDialog
        clickedChangeFont={(_: any) => {
          setLyricFontSize(_);
        }}
        clickedChangedScrollSpeed={(_: any) => {
          setScrollSpeed(_);
        }}
        currentScrollSpeed={scrollSpeed}
        currentLyricFontSize={lyricFontSize}
        currentKey={currentKey}
        shardOrFlat={shardOrFlat}
        clickedClosed={() => {
          setIsShowChangeKeyDialog(false);
        }}
        isVisible={isShowChangeKeyDialog}
        clickedChangeKey={(_: any) => {
          setCurrentKey(_);
        }}
        clickedChangedShardFlat={(_: any) => {
          setShardOrFlat(_);
        }}
      />
    </SafeAreaView>
  );
}

export default connector(LyricTextScreen);
