import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {
  API_KEY_PRODUCION,
  API_URL,
  BOOKS_TITLE,
  LYRICS_TITLE,
  ROW_COUNT,
} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
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
  RootStackScreenProps<'AuthorScreen'>;
function AuthorScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [authorId, setAuthorId] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorData, setAuthorData] = useState<any>([]);
  const [authorImage, setAuthorImage] = useState<string>('-');
  const [authorType, setAuthorType] = useState<number>(0);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const animationForScreen = 'fadeInUp';
  const {width, height} = Dimensions.get('screen');
  // const flatListScroll = useRef(new Animated.Value(0)).current;
  const [scrollView] = useState(new Animated.Value(0));

  const [label, setLabel] = React.useState({
    lyrics: i18n.t('lyrics'),
    books: i18n.t('books'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        lyrics: i18n.t('lyrics'),
        books: i18n.t('books'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setAuthorId(props.route.params.authorId);
    setAuthorType(props.route.params.authorType);
  }, [props.route.params]);

  useEffect(() => {
    if (authorType != 0 && authorId != 0) {
      fetchAuthorApi(0);
    }
  }, [authorType, authorId]);

  useEffect(() => {
    if (screenRefresh) {
      fetchAuthorApi(0);
    }
  }, [screenRefresh]);

  useEffect(() => {
    if (authorType == 2) {
      let images = [];
      for (let data of authorData) {
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
    }
  }, [authorData]);

  const fetchAuthorApi = useCallback(
    async (pageAt: number) => {
      let formData = new FormData();
      let url;
      if (authorType == 1) {
        url = `user/book/author/get-by-id`;
      } else if (authorType == 2) {
        url = `user/lyric/author/get-by-id`;
        formData.append('userId', props.profile?.id ? props.profile?.id : 0);
      } else {
        url = '';
      }
      formData.append('id', authorId);
      formData.append('page', pageAt);
      formData.append('size', ROW_COUNT);

      await ApiFetchService(API_URL + url, formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: API_KEY_PRODUCION,
      }).then((response: any) => {
        setTimeout(() => {
          setIsLoading(false);
          setScreenRefresh(false);
        }, 1000);
        if (response.code == 200) {
          setAuthorId(response.data.author.id);
          setAuthorName(response.data.author.name);
          setAuthorType(response.data.author.authorType);
          setAuthorImage(response.data.author.profile);
          if (response.data.author.authorType == 1) {
            setAuthorData((prev: any) =>
              pageAt === 0
                ? response.data.bookDetail.content
                : [...prev, ...response.data.bookDetail.content],
            );
            setTotalPage(response.data.bookDetail.totalPages);
          } else if (response.data.author.authorType == 2) {
            setAuthorData((prev: any) =>
              pageAt === 0
                ? response.data.lyricDetail.content
                : [...prev, ...response.data.lyricDetail.content],
            );
            setTotalPage(response.data.lyricDetail.totalPages);
          }
        }
      });
    },
    [authorId, authorType, props.profile?.id],
  );

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedAuthorItem = useCallback(
    (item: any, index: number) => {
      if (authorType == 1) {
        props.navigation.push('BookDetailScreen', {bookId: item.id});
      } else if (authorType == 2) {
        props.navigation.navigate('ImageView', {
          currentImageIndex: index,
          lyricsImages: lyricsImages,
          isComeFromLyricText: false,
        });
      }
    },
    [authorType, lyricsImages],
  );

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchAuthorApi(currentPage);
    }
  };

  const renderByAuthorItem = useCallback(
    (item: any, index: number) => {
      return authorType == 1 ? (
        <Animatable.View
          key={item.id}
          style={{
            width: '50%',
            marginTop: 12,
            // flexDirection: 'column',
            // flex: 0.5,
            // flex: 1,
            // flexDirection: 'row',
            // flexWrap: 'wrap',
            // alignItems: 'flex-start',
          }}
          animation={animationForScreen}
          useNativeDriver={true}>
          <TouchableOpacity onPress={() => clickedAuthorItem(item, index)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                width: 150,
                height: 180,
                borderRadius: 20,
                alignSelf: 'center',
              }}
              //source={{uri: undefined}}
              source={{uri: API_URL + item.imgPath}}
            />
            <TextView
              text={item.name}
              numberOfLines={1}
              textStyle={{
                alignSelf: 'center',
                marginTop: 6,
                fontSize: 16,
              }}
            />

            {item.myAuthor == null ? (
              <></>
            ) : (
              <TextView
                text={item.myAuthor?.name}
                numberOfLines={1}
                textStyle={{
                  alignSelf: 'center',
                  marginTop: 2,
                  opacity: 0.5,
                }}
              />
            )}
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <Animatable.View
          key={item.id}
          style={{
            width: '50%',
            marginTop: 12,
            // flexDirection: 'column',
            // marginTop: 12,
            // flex: 0.5,
            // margin: 6,
          }}
          useNativeDriver={true}
          animation={animationForScreen}>
          <TouchableOpacity onPress={() => clickedAuthorItem(item, index)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                width: 180,
                height: 220,
                borderRadius: 20,
                alignSelf: 'center',
              }}
              //   source={{uri: item.item.imgPath}}
              source={{uri: API_URL + item.imgPath}}
            />
            <TextView
              text={item.name}
              numberOfLines={1}
              textStyle={{
                alignSelf: 'center',
                marginTop: 6,
                maxWidth: 120,
                fontSize: 16,
              }}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [authorData, authorType, lyricsImages],
  );

  const isCloseToBottom = (e: any) => {
    const paddingToBottom = 20;

    return (
      e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >=
      e.nativeEvent.contentSize.height - paddingToBottom
    );
  };

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: theme.backgroundColor,
        }}
        edges={['top']}>
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
            source={{uri: API_URL + authorImage}}
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
                outputRange: [100, 60],
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
              source={{uri: API_URL + authorImage}}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: GeneralColor.light_grey,
                alignSelf: 'center',
                borderRadius: 100,
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
                text={authorName}
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
            if (isCloseToBottom(e) && !isLoading) {
              onEndListReached();
            }
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 20,
              alignItems: 'flex-start',
            }}>
            {authorData.map((_: any, index: any) => {
              return renderByAuthorItem(_, index);
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </>
  );
}

export default connector(AuthorScreen);
