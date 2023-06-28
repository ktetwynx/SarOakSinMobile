import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {ViewMoreButton} from '../../components/ViewMoreButton';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
import {ConnectedProps, connect} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOutDown,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import {SearchBar} from '../components/SearchBar';

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
  const [lyricHomeData, setLyricHomeData] = useState([]);
  const [lyricsImages, setLyricsImages] = useState<any>();
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    albums: i18n.t('albums'),
    lyrics: i18n.t('lyrics'),
    singers: i18n.t('singers'),
    search_lyric_text: i18n.t('search_lyric_text'),
  });

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
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
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

        let images = [];
        for (let data of response.data.lyricList) {
          images.push({
            url: API_URL + data.imgPath,
            isSaved: data.saved,
            lyricsId: data.id,
          });
        }
        setLyricsImages(images);
        data.push(authors, ablums, lyrics);
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
      });
    },
    [lyricsImages],
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

  const renderHeaderLyricItem = useCallback(() => {
    return (
      <SearchBar text={label.search_lyric_text} clickedSearch={clickedSearch} />
    );
  }, [label]);

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
            <Animated.View entering={FadeInDown.delay(item.index * 300)}>
              <TextView
                text={item.item.title}
                textStyle={{fontSize: 20, fontWeight: 'bold'}}
              />
            </Animated.View>

            <Animated.View entering={SlideInRight.delay(item.index * 300)}>
              <ViewMoreButton
                clickedViewMore={() => {
                  if (item.index == 0) {
                    clickedSingerViewmore();
                  } else if (item.index == 1) {
                    clickedAlbumViewmore();
                  } else {
                    clickedLyricsViewmore();
                  }
                }}
              />
            </Animated.View>
          </View>
          <FlatList
            style={{paddingLeft: 16, marginTop: 10, marginBottom: 12}}
            showsHorizontalScrollIndicator={false}
            horizontal={item.index == 1 ? false : true}
            data={item.item.data}
            numColumns={item.index == 1 ? 2 : undefined}
            renderItem={(data: any) =>
              renderLyricsHomeDetailItem(data, item.item.title)
            }
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      );
    },
    [lyricHomeData, label],
  );

  const renderLyricsHomeDetailItem = useCallback(
    (item: any, title: string) => {
      if (title == label.albums) {
        return (
          <Animated.View
            style={{
              flexDirection: 'column',
              marginRight: 16,
              marginBottom: 12,
              flex: 0.5,
            }}
            entering={FadeInDown.delay(item.index * 300)}
            exiting={FadeOutDown.delay(item.index * 300)}>
            <TouchableOpacity onPress={() => clickedAlbum(item)}>
              <Image
                style={{
                  height: 100,
                  borderRadius: 10,
                  flex: 1,
                  backgroundColor: 'grey',
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
          </Animated.View>
        );
      } else if (title == label.lyrics) {
        return (
          <Animated.View
            entering={FadeInDown.delay(item.index * 300)}
            exiting={FadeOutDown.delay(item.index * 300)}>
            <TouchableOpacity
              onPress={() => clickedLyric(item)}
              style={{flexDirection: 'column', marginRight: 12}}>
              <Image
                style={{
                  width: 140,
                  height: 160,
                  backgroundColor: 'grey',
                  borderRadius: 15,
                }}
                source={{uri: API_URL + item.item.imgPath}}
              />
              <TextView
                text={item.item.name}
                textStyle={{alignSelf: 'center', marginTop: 6, fontSize: 16}}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      } else if (title == label.singers) {
        return (
          <Animated.View
            entering={FadeInDown.delay(item.index * 300)}
            exiting={FadeOutDown.delay(item.index * 300)}>
            <TouchableOpacity
              onPress={() => clickedSinger(item)}
              style={{flexDirection: 'column', marginRight: 12}}>
              <Image
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'grey',
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
          </Animated.View>
        );
      }
      return <></>;
    },
    [label, lyricsImages, lyricHomeData],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <View
        style={{
          flexDirection: 'column',
          flex: 1,
          backgroundColor: theme.backgroundColor,
        }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={lyricHomeData}
          refreshControl={
            <RefreshControl
              refreshing={screenRefresh}
              onRefresh={onRefreshScreen}
              tintColor={theme.backgroundColor2}
              // titleColor={theme.backgroundColor2}
              // title="Pull to refresh"
            />
          }
          contentContainerStyle={{paddingBottom: 100}}
          style={{paddingTop: 10}}
          renderItem={renderLyricsHomeItem}
          ListHeaderComponent={renderHeaderLyricItem}
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </View>
    </SafeAreaView>
  );
}

export default connector(LyricsScreen);
