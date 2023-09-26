import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Image, TouchableOpacity, RefreshControl} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {FlatList} from 'react-native-gesture-handler';
import {
  API_KEY_PRODUCION,
  API_URL,
  LYRICS_TITLE,
  ROW_COUNT,
} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ConnectedProps, connect} from 'react-redux';
import {LoadingScreen} from '../../components/LoadingScreen';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_book_count: number;
}) => {
  return {
    profile: state.profile,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'AlbumScreen'>;

function AlbumScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [albumId, setAlbumId] = useState<number>(0);
  const [albumName, setAlbumName] = useState<string>('');
  const [albumImg, setAlbumImg] = useState<string>('-');
  const [lyricsList, setLyricsList] = useState<any>([]);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const animationForScreen = 'fadeInUp';
  const [label, setLabel] = React.useState({
    lyrics: i18n.t('lyrics'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        lyrics: i18n.t('lyrics'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setAlbumId(props.route.params.albumId);
    setAlbumName(props.route.params.albumName);
    setAlbumImg(props.route.params.albumImage);
  }, [props.route.params]);

  useEffect(() => {
    if (screenRefresh) {
      fetchAblumApi(0);
    }
  }, [screenRefresh]);

  useEffect(() => {
    if (albumId != 0) {
      fetchAblumApi(0);
    }
  }, [albumId]);

  useEffect(() => {
    let images = [];
    for (let data of lyricsList) {
      images.push({
        url: API_URL + data.imgPath,
        isSaved: data.saved,
        lyricsId: data.id,
        lyricText: data.lyricText,
        lyricTitle: data.name,
      });
    }
    setLyricsImages(images);
  }, [lyricsList]);

  const fetchAblumApi = useCallback(
    async (pageAt: number) => {
      let formData = new FormData();
      formData.append('id', albumId);
      formData.append('userId', props.profile?.id ? props.profile?.id : 0);
      formData.append('page', pageAt);
      formData.append('size', '100');
      console.log(formData);
      await ApiFetchService(API_URL + `user/lyric/album/get-by-id`, formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: API_KEY_PRODUCION,
      }).then((response: any) => {
        console.log(response);
        setTimeout(() => {
          setIsLoading(false);
          setScreenRefresh(false);
        }, 1000);
        if (response.code == 200) {
          setLyricsList((prev: any) =>
            pageAt === 0
              ? response.data.content
              : [...prev, ...response.data.content],
          );
          setTotalPage(response.data.totalPages);
        }
      });
    },
    [albumId, props.profile?.id],
  );

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchAblumApi(currentPage);
    }
  };

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const renderLyricsItem = useCallback(
    (item: any) => {
      return (
        <Animatable.View
          style={{
            flexDirection: 'column',
            flex: 1,
            marginRight: 12,
            marginBottom: 16,
          }}
          useNativeDriver={true}
          animation={animationForScreen}>
          <TouchableOpacity onPress={() => clickedLyric(item)}>
            <Image
              source={{
                uri: API_URL + item.item.imgPath,
              }}
              style={{
                height: 250,
                borderRadius: 20,
                backgroundColor: GeneralColor.light_grey,
                width: '100%',
              }}
            />
            <TextView
              text={item.item.name}
              textStyle={{fontSize: 16, alignSelf: 'center', marginTop: 10}}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [lyricsList, lyricsImages],
  );

  const clickedLyric = useCallback(
    (item: any) => {
      props.navigation.navigate('ImageView', {
        currentImageIndex: item.index,
        lyricsImages: lyricsImages,
      });
    },
    [lyricsImages],
  );

  return (
    <View>
      <SafeAreaView
        edges={['top']}
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          backgroundColor: theme.backgroundColor,
        }}>
        <View style={{flex: 1}}>
          <BackButton
            style={{alignSelf: 'flex-start', marginLeft: 16, marginTop: 10}}
            clickedGoBack={goBack}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <Animatable.Image
              animation={animationForScreen}
              useNativeDriver={true}
              source={{uri: API_URL + albumImg}}
              style={{
                width: 150,
                height: 100,
                backgroundColor: GeneralColor.light_grey,
                marginRight: 16,
                borderRadius: 20,
              }}
            />
            <Animatable.View
              useNativeDriver={true}
              animation={animationForScreen}>
              <TextView
                text={albumName}
                numberOfLines={3}
                textStyle={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  maxWidth: 200,
                }}
              />
            </Animatable.View>
          </View>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
            }}>
            <Animatable.View
              useNativeDriver={true}
              animation={animationForScreen}>
              <TextView
                text={label.lyrics}
                textStyle={{fontSize: 18, marginTop: 12, marginLeft: 16}}
              />
            </Animatable.View>

            <FlatList
              data={lyricsList}
              numColumns={2}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              // onEndReachedThreshold={0}
              // onEndReached={onEndListReached}
              contentContainerStyle={{paddingBottom: 50}}
              refreshControl={
                <RefreshControl
                  refreshing={screenRefresh}
                  onRefresh={onRefreshScreen}
                  tintColor={theme.backgroundColor2}
                  // titleColor={theme.backgroundColor2}
                  // title="Pull to refresh"
                />
              }
              style={{paddingLeft: 12, paddingTop: 10}}
              renderItem={renderLyricsItem}
              keyExtractor={(item: any, index: number) => index.toString()}
            />
          </View>
        </View>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(AlbumScreen);
