import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
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
import LinearGradient from 'react-native-linear-gradient';

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
  const [scrollView] = useState(new Animated.Value(0));
  const {width, height} = Dimensions.get('screen');
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
        lyricAuthor: data.authors,
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
      await ApiFetchService(API_URL + `user/lyric/album/get-by-id`, formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: API_KEY_PRODUCION,
      }).then((response: any) => {
        setTimeout(() => {
          setIsLoading(false);
          setScreenRefresh(false);
        }, 1000);
        if (response.code == 200) {
          console.log(response.data.lyricDetails.content);
          setLyricsList((prev: any) =>
            pageAt === 0
              ? response.data.lyricDetails.content
              : [...prev, ...response.data.lyricDetails.content],
          );
          // setTotalPage(response.data.totalPages);
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
    (item: any, index: number) => {
      return (
        <Animatable.View
          key={item.id}
          style={{
            width: '50%',
            marginTop: 12,
            // flexDirection: 'column',
            // flex: 1,
            // marginRight: 12,
            // marginBottom: 16,
          }}
          useNativeDriver={true}
          animation={animationForScreen}>
          <TouchableOpacity onPress={() => clickedLyric(item, index)}>
            <Image
              source={{
                uri: API_URL + item.imgPath,
              }}
              style={{
                width: 180,
                height: 220,
                borderRadius: 20,
                backgroundColor: GeneralColor.light_grey,
                alignSelf: 'center',
              }}
            />
            <TextView
              text={item.name}
              textStyle={{
                fontSize: 16,
                alignSelf: 'center',
                marginTop: 10,
                marginHorizontal: 12,
              }}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [lyricsList, lyricsImages],
  );

  const clickedLyric = useCallback(
    (item: any, index: number) => {
      props.navigation.navigate('ImageView', {
        currentImageIndex: index,
        lyricsImages: lyricsImages,
        isComeFromLyricText: false,
      });
    },
    [lyricsImages],
  );

  const isCloseToBottom = (e: any) => {
    const paddingToBottom = 20;

    return (
      e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >=
      e.nativeEvent.contentSize.height - paddingToBottom
    );
  };

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
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            height: scrollView.interpolate({
              inputRange: [0, 220],
              outputRange: [260, 120],
              extrapolate: 'clamp',
            }),
          }}>
          <ImageBackground
            source={{uri: API_URL + albumImg}}
            blurRadius={10}
            style={{height: 260, width: '100%'}}
          />
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={['transparent', theme.backgroundColor]}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              bottom: 0,
            }}
          />
        </Animated.View>
        <BackButton
          style={{marginLeft: 12, marginTop: 12}}
          clickedGoBack={() => {
            goBack();
          }}
        />
        <Animated.View
          style={{
            height: scrollView.interpolate({
              inputRange: [0, 220],
              outputRange: [170, 100],
              extrapolate: 'clamp',
            }),
            marginLeft: width * 0.08,
            marginTop: -height * 0.05,
            flexDirection: 'row',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Animated.View
            style={{
              marginRight: 12,
              width: scrollView.interpolate({
                inputRange: [0, 220],
                outputRange: [120, 80],
                extrapolate: 'clamp',
              }),
              height: scrollView.interpolate({
                inputRange: [0, 220],
                outputRange: [100, 60],
                extrapolate: 'clamp',
              }),
            }}>
            <Animatable.Image
              useNativeDriver={true}
              animation={animationForScreen}
              source={{uri: API_URL + albumImg}}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: GeneralColor.light_grey,
                alignSelf: 'center',
                borderRadius: 10,
              }}
            />
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                {
                  scale: scrollView.interpolate({
                    inputRange: [0, 200],
                    outputRange: [1, 0.8],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}>
            <Animatable.View
              style={{alignSelf: 'center'}}
              useNativeDriver={true}
              animation={animationForScreen}>
              <TextView
                text={albumName}
                numberOfLines={3}
                textStyle={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  width: width / 2.5,
                }}
              />
            </Animatable.View>
          </Animated.View>
        </Animated.View>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{flex: 1}}
          scrollEventThrottle={16}
          onScroll={(e: any) => {
            scrollView.setValue(e.nativeEvent.contentOffset.y);
            // if (isCloseToBottom(e) && !isLoading) {
            //   onEndListReached();
            // }
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 20,
              // marginHorizontal: 12,
              alignItems: 'flex-start',
            }}>
            {lyricsList?.map((_: any, index: any) => {
              return renderLyricsItem(_, index);
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(AlbumScreen);
