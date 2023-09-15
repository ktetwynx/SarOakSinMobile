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
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const [rawLyricText, setRawLyricText] = useState('');
  const [formattedLyricText, setFormattedLyricText] = useState('');
  const [lyricKey, setLyricKey] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [shardOrFlat, setShardOrFlat] = useState('');
  const [isShowChangeKeyDialog, setIsShowChangeKeyDialog] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [offset, setOffset] = useState(0);
  let autoScrolling: number;

  useEffect(() => {
    setRawLyricText(props.route.params.lyricText);
    const song = parseSong(props.route.params.lyricText);
    setCurrentKey(song.metadata.key.split('', 2)[0]);
    setShardOrFlat(
      song.metadata.key.split('', 2)[1]
        ? song.metadata.key.split('', 2)[1]
        : '',
    );
    setFormattedLyricText(formatSong(song));
  }, [props.route.params]);

  useEffect(() => {
    const song = parseSong(rawLyricText);
    if (lyricKey != '') {
      const changedKeySong = song.changeKey(lyricKey);
      setFormattedLyricText(formatSong(changedKeySong));
    }
  }, [lyricKey]);

  useEffect(() => {
    if (shardOrFlat != '' || currentKey != '') {
      setLyricKey(`${currentKey}${shardOrFlat}`);
    }
  }, [shardOrFlat, currentKey]);

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
    setIsShowChangeKeyDialog(true);
  }, []);

  const clickedPlayAutoScroll = () => {
    let offset = 0;
    autoScrolling = setInterval(() => {
      offset += 1;
      scrollViewRef.current?.scrollTo({x: 0, y: offset, animated: true});
    }, 1000);
  };

  const isReachToScrollEnd = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    // const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height;
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top']}>
      <ScrollView
        onScroll={({nativeEvent}) => {
          if (isReachToScrollEnd(nativeEvent)) {
            clearInterval(autoScrolling);
          }
        }}
        onTouchStart={event => {
          clearInterval(autoScrolling);
        }}
        ref={scrollViewRef}
        style={{flexDirection: 'column'}}>
        <View
          style={{
            position: 'absolute',
            top: Platform.OS == 'ios' ? 50 : 14,
            right: Platform.OS == 'ios' ? 12 : 15,
            zIndex: 1,
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
              onPress={() => clickedPlayAutoScroll()}>
              <AntDesign name={'play'} size={30} color={'green'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{justifyContent: 'center', alignItems: 'center'}}
              onPress={() => clickedChangeKey()}>
              <TextView
                text={'Change Key'}
                textStyle={{
                  backgroundColor: GeneralColor.app_theme,
                  padding: 5,
                  color: GeneralColor.white,
                  fontWeight: 'bold',
                  borderRadius: 10,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{flex: 1}}>
          <TextView
            text={formattedLyricText}
            textStyle={{color: 'black', padding: 12, flex: 1, fontSize: 16}}
          />
        </View>
      </ScrollView>
      <ChangeKeyDialog
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
