import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
  API_KEY_PRODUCION,
  API_URL,
  PLAY_MODE_TITLE,
  dummyData,
} from '../../config/Constant';
import {ViewMoreButton} from '../../components/ViewMoreButton';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
import {ConnectedProps, connect} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';
import {SearchBar} from '../../components/SearchBar';
import KeepAwake from 'react-native-keep-awake';
import {PlayModeButton} from '../components/PlayModeButton';
import {PlayModeView} from '../components/PlayModeView';

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
  RootTabScreenProps<'LyricsScreen'>;

function LyricsScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [lyricsImages, setLyricsImages] = useState<any>();
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    albums: i18n.t('albums'),
    lyrics: i18n.t('lyrics'),
    singers: i18n.t('singers'),
    search_lyric_text: i18n.t('search_lyric_text'),
  });
  const {width, height} = Dimensions.get('screen');
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const animationForScreen = 'fadeInUp';
  const dummyData1 = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];
  const [playModeIdList, setPlayModeIdList] = useState<any>([]);
  const [lyricHomeData, setLyricHomeData] = useState([
    {id: 1, title: PLAY_MODE_TITLE, data: []},
    {id: 2, title: label.singers, data: []},
    {id: 3, title: label.albums, data: []},
    {id: 4, title: label.lyrics, data: []},
  ]);

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        albums: i18n.t('albums'),
        lyrics: i18n.t('lyrics'),
        singers: i18n.t('singers'),
        search_lyric_text: i18n.t('search_lyric_text'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchHomeLyricsApi();
    KeepAwake.deactivate();
  }, [label, props.fav_lyric_count]);

  useEffect(() => {
    if (screenRefresh) {
      fetchHomeLyricsApi();
    }
  }, [screenRefresh]);

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
    setTimeout(() => {
      setScreenRefresh(false);
    }, 3000);
  }, []);

  const fetchHomeLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('userId', props.profile?.id ? props.profile?.id : 0);
    await ApiFetchService(API_URL + `user/lyric/home`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      if (response.code == 200) {
        let data: any = [];
        let ablums = Object.assign(
          {title: label.albums},
          {data: response.data.albumList},
        );
        let lyrics = Object.assign(
          {title: label.lyrics},
          {data: response.data.lyricList},
        );

        let authors = Object.assign(
          {title: label.singers},
          {data: response.data.authorList},
        );

        let lyricsPlayMode = Object.assign(
          {title: PLAY_MODE_TITLE},
          {data: response.data.lyricListTXT},
        );

        let IdArrayPlayModeList = [];
        for (let idArray of response.data.lyricListTXT) {
          IdArrayPlayModeList.push(idArray.id);
        }

        let images = [];
        for (let data of response.data.lyricList) {
          images.push({
            url: API_URL + data.imgPath,
            isSaved: data.saved,
            lyricsId: data.id,
            lyricText: data.lyricText,
            lyricTitle: data.name,
            lyricAuthor: data.authors,
          });
        }
        setPlayModeIdList(IdArrayPlayModeList);
        setLyricsImages(images);
        data.push(lyricsPlayMode, authors, ablums, lyrics);
        setLyricHomeData(data);
      }
    });
  }, [label, props.profile?.id]);

  const clickedAlbumViewmore = useCallback(() => {
    props.navigation.navigate('AlbumListViewmoreScreen');
  }, []);

  const clickedLyricsViewmore = useCallback(() => {
    props.navigation.navigate('LyricListViewmoreScreen');
  }, []);

  const clickedSingerViewmore = useCallback(() => {
    props.navigation.navigate('AuthorListViewmoreScreen', {authorType: 2});
  }, []);

  const clickedPlayModeViewmore = useCallback(() => {
    props.navigation.navigate('PlayModeViewMoreScreen');
  }, []);

  const clickedAlbum = useCallback((item: any) => {
    props.navigation.navigate('AlbumScreen', {
      albumId: item.item.id,
      albumName: item.item.name,
      albumImage: item.item.imgPath,
    });
  }, []);

  const clickedLyric = useCallback(
    (item: any) => {
      props.navigation.navigate('ImageView', {
        currentImageIndex: item.index,
        lyricsImages: lyricsImages,
        isComeFromLyricText: false,
      });
    },
    [lyricsImages],
  );

  const clickedPlayMode = useCallback(
    (item: any) => {
      props.navigation.navigate('LyricTextScreen', {
        lyricTextId: item.item.id,
        playModeIdList: playModeIdList,
        currentPlayModeIndex: item.index,
      });
    },
    [playModeIdList],
  );

  const clickedSinger = useCallback((item: any) => {
    props.navigation.navigate('AuthorScreen', {
      authorId: item.item.id,
      authorName: item.item.name,
      authorType: item.item.authorType,
      authorImage: item.item.profile,
    });
  }, []);

  const clickedSearch = useCallback(() => {
    props.navigation.navigate('SearchScreen', {searchType: 2});
  }, []);

  const renderLyricsHomeItem = useCallback(
    (item: any) => {
      return (
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Animatable.View
              style={{flexDirection: 'row'}}
              useNativeDriver={true}
              animation={animationForScreen}>
              <TextView
                text={item.item.title}
                textStyle={{fontSize: 20, fontWeight: 'bold'}}
              />
              {item.item.title == PLAY_MODE_TITLE ? (
                <PlayModeButton
                  borderWidth={1.5}
                  borderRadius={5}
                  iconSize={18}
                  style={{
                    alignSelf: 'center',
                    width: 35,
                    marginLeft: 6,
                    height: 35,
                  }}
                  clickedPlayLyric={() => {}}
                />
              ) : (
                <></>
              )}
            </Animatable.View>

            <Animatable.View
              useNativeDriver={true}
              animation={animationForScreen}>
              <ViewMoreButton
                clickedViewMore={() => {
                  if (item.index == 0) {
                    clickedPlayModeViewmore();
                  } else if (item.index == 1) {
                    clickedSingerViewmore();
                  } else if (item.index == 2) {
                    clickedAlbumViewmore();
                  } else if (item.index == 3) {
                    clickedLyricsViewmore();
                  }
                }}
              />
            </Animatable.View>
          </View>
          <FlatList
            style={{marginTop: 10, marginBottom: 12}}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={item.index == 2 ? {} : {paddingLeft: 12}}
            horizontal={item.index == 2 ? false : true}
            data={item.item.data.length != 0 ? item.item.data : dummyData1}
            numColumns={item.index == 2 ? 2 : undefined}
            renderItem={(data: any) =>
              renderLyricsHomeDetailItem(data, item.item.title)
            }
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      );
    },
    [lyricHomeData, label, playModeIdList],
  );

  const renderLyricsHomeDetailItem = useCallback(
    (item: any, title: string) => {
      if (title == PLAY_MODE_TITLE) {
        return (
          <PlayModeView
            viewStyle={{flexDirection: 'column', marginRight: 12}}
            item={item}
            imageStyle={{
              width: 140,
              height: 140,
              backgroundColor: GeneralColor.light_grey,
              borderRadius: 15,
            }}
            clickedPlayMode={() => clickedPlayMode(item)}
          />
        );
      } else if (title == label.singers) {
        return (
          <Animatable.View
            style={{
              flexDirection: 'column',
            }}
            useNativeDriver={true}
            animation={animationForScreen}>
            <TouchableOpacity
              disabled={item?.item?.name ? false : true}
              onPress={() => clickedSinger(item)}
              style={{flexDirection: 'column', marginRight: 12}}>
              <Image
                style={{
                  width: 80,
                  height: 80,
                  alignSelf: 'center',
                  backgroundColor: GeneralColor.light_grey,
                  borderRadius: 50,
                }}
                source={{
                  uri: API_URL + item.item.profile,
                }}
              />
              <TextView
                text={item.item.name}
                textStyle={{alignSelf: 'center', marginTop: 6, fontSize: 16}}
              />
            </TouchableOpacity>
          </Animatable.View>
        );
      }
      if (title == label.singers) {
        return (
          <Animatable.View
            style={{
              flexDirection: 'column',
            }}
            useNativeDriver={true}
            animation={animationForScreen}>
            <TouchableOpacity
              disabled={item?.item?.name ? false : true}
              onPress={() => clickedSinger(item)}
              style={{flexDirection: 'column', marginRight: 12}}>
              <Image
                style={{
                  width: 80,
                  height: 80,
                  alignSelf: 'center',
                  backgroundColor: GeneralColor.light_grey,
                  borderRadius: 50,
                }}
                source={{
                  uri: API_URL + item.item.profile,
                }}
              />
              <TextView
                text={item.item.name}
                textStyle={{alignSelf: 'center', marginTop: 6, fontSize: 16}}
              />
            </TouchableOpacity>
          </Animatable.View>
        );
      } else if (title == label.albums) {
        return (
          <Animatable.View
            style={{
              flexDirection: 'column',
              marginRight: 6,
              marginLeft: 8,
              marginBottom: 6,
              flex: 0.5,
            }}
            useNativeDriver={true}
            animation={animationForScreen}>
            <TouchableOpacity
              disabled={item?.item?.name ? false : true}
              onPress={() => clickedAlbum(item)}>
              <Image
                style={{
                  height: 100,
                  borderRadius: 10,
                  flex: 1,
                  backgroundColor: GeneralColor.light_grey,
                }}
                source={{
                  uri: API_URL + item.item.imgPath,
                }}
              />
              <TextView
                text={item.item.name}
                textStyle={{alignSelf: 'center', marginTop: 6, fontSize: 16}}
              />
            </TouchableOpacity>
          </Animatable.View>
        );
      } else if (title == label.lyrics) {
        return (
          <Animatable.View
            useNativeDriver={true}
            animation={animationForScreen}>
            <TouchableOpacity
              disabled={item?.item?.name ? false : true}
              onPress={() => clickedLyric(item)}
              style={{flexDirection: 'column', marginRight: 12}}>
              <Image
                style={{
                  width: 140,
                  height: 160,
                  backgroundColor: GeneralColor.light_grey,
                  borderRadius: 15,
                }}
                source={{uri: API_URL + item.item.imgPath}}
              />
              <TextView
                text={item.item.name}
                numberOfLines={2}
                textStyle={{
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginTop: 6,
                  fontSize: 16,
                  width: 140,
                }}
              />
            </TouchableOpacity>
          </Animatable.View>
        );
      }
      return <></>;
    },
    [label, lyricsImages],
  );

  const transfromHeight = searchBarHeight.interpolate({
    inputRange: [0, height * 0.11],
    outputRange: [0, -height * 0.11],
    extrapolateRight: 'clamp',
  });

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.app_theme}}>
      <Animatable.Image
        useNativeDriver={true}
        animation={'fadeIn'}
        delay={1000}
        style={{
          width: '100%',
          top: -80,
          resizeMode: 'contain',
          position: 'absolute',
        }}
        source={require('../../assets/images/forLyricScreen.jpg')}
      />
      <SafeAreaView edges={['top']} style={{flex: 1}}>
        <SearchBar
          paddingTop={height * 0.02}
          text={label.search_lyric_text}
          clickedSearch={clickedSearch}
        />

        <Animated.View
          style={[
            {
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              backgroundColor: theme.backgroundColor,
              overflow: 'hidden',
            },
            {transform: [{translateY: transfromHeight}]},
          ]}>
          <Animated.FlatList
            scrollEnabled={true}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: searchBarHeight}}}],
              {useNativeDriver: true},
            )}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={lyricHomeData}
            bounces={false}
            refreshControl={
              <RefreshControl
                refreshing={screenRefresh}
                onRefresh={onRefreshScreen}
                tintColor={theme.backgroundColor2}
                // titleColor={theme.backgroundColor2}
                // title="Pull to refresh"
              />
            }
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 4,
            }}
            style={[
              {
                paddingTop: 8,
              },
            ]}
            renderItem={renderLyricsHomeItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

export default connector(LyricsScreen);
