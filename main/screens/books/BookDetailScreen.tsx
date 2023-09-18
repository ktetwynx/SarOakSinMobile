import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Image, TouchableOpacity, ScrollView} from 'react-native';
import {
  RootStackScreenProps,
  RootTabScreenProps,
} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
  ADS_BANNER_UNIT_ID,
  API_KEY_PRODUCION,
  API_URL,
  BOOKS_AUTHOR_TITLE,
  BOOK_AUTHOR_TITLE,
} from '../../config/Constant';
import {BackButton} from '../../components/BackButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ConnectedProps, connect} from 'react-redux';
import {
  Profile,
  setFavBookCount,
  setFavLyricCount,
  setProfile,
  setToken,
} from '../../redux/actions';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';
import {ThemeContext} from '../../utility/ThemeProvider';
import {useFocusEffect} from '@react-navigation/native';
import {LoadingScreen} from '../../components/LoadingScreen';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeInLeft,
  BounceIn,
} from 'react-native-reanimated';
import {GeneralColor} from '../../utility/Themes';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {LoginDialog} from '../../components/LoginDialog';

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_book_count: number;
}) => {
  return {
    profile: state.profile,
    token: state.token,
    fav_book_count: state.fav_book_count,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setToken: (token: any) => {
      dispatch(setToken(token));
    },
    setProfile: (profile: Profile) => {
      dispatch(setProfile(profile));
    },
    setFavBookCount: (fav_book_count: number) => {
      dispatch(setFavBookCount(fav_book_count));
    },
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'BookDetailScreen'>;

function BookDetailScreen(props: Props) {
  interface BookDetail {
    bookName: string;
    bookImage: string;
    authorName: string;
    authorId: number;
    authorImage: string;
    readPageAt: number;
    bookPath: string;
    totalPage: number;
  }
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [isShowLoginDialog, setIsShowLoginDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookDetailData, setBookDetailData] = useState<BookDetail>({
    bookName: ' ',
    bookImage: '-',
    authorName: ' ',
    authorId: 0,
    authorImage: '-',
    readPageAt: -1,
    bookPath: '-',
    totalPage: 0,
  });
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    author: i18n.t('author'),
    read: i18n.t('read'),
    bookmark_page_at: i18n.t('bookmark_page_at'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        author: i18n.t('author'),
        read: i18n.t('read'),
        bookmark_page_at: i18n.t('bookmark_page_at'),
      });
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookDetailApi();
    }, [props.route.params.bookId]),
  );

  const fetchBookDetailApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('id', props.route.params.bookId.toString());
    formData.append('userId', props.profile?.id ? props.profile?.id : 0);
    await ApiFetchService(API_URL + 'user/book/detail/get-by-id', formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      if (response.code == 200) {
        setIsFavourite(response.data.saved);
        console.log(response.data);
        setBookDetailData({
          bookName: response.data.name,
          bookImage: response.data.imgPath,
          authorName: response.data.myAuthor.name,
          authorId: response.data.myAuthor.id,
          authorImage: response.data.myAuthor.profile,
          readPageAt: response.data.bookMark,
          bookPath: response.data.path,
          totalPage: response.data.totalPages,
        });
      }
    });
  }, [props.route.params.bookId, props.profile?.id]);

  const clickedAuthor = useCallback(() => {
    props.navigation.navigate('AuthorScreen', {
      authorId: bookDetailData.authorId,
      authorName: bookDetailData.authorName,
      authorImage: bookDetailData.authorImage,
      authorType: 1,
    });
  }, [bookDetailData?.authorId]);

  const fetchSaveBookApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', props.route.params.bookId);
    formData.append('bookListId', props.profile.bookCollectionId);
    formData.append('userId', props.profile.id);
    await ApiFetchService(
      API_URL + 'user/register-user/add-book-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${props.token}`,
      },
    ).then((response: any) => {
      props.setFavBookCount(response.data);
      setIsFavourite(true);
    });
  }, [props.route.params.bookId, props.profile?.id, props.token]);

  const fetchRemoveBookApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', props.route.params.bookId);
    formData.append('bookListId', props.profile.bookCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/remove-book-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      },
    ).then((response: any) => {
      props.setFavBookCount(response.data);
      setIsFavourite(false);
    });
  }, [props.route.params.bookId, props.profile?.id, props.token]);

  const clickedFavourite = useCallback(() => {
    if (props.token != null) {
      if (isFavourite) {
        fetchRemoveBookApi();
      } else {
        fetchSaveBookApi();
      }
    } else {
      setIsShowLoginDialog(true);
    }
  }, [isFavourite]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, [props.navigation]);

  const clickedReadNow = useCallback(() => {
    props.navigation.navigate('PDFView', {
      bookPath: bookDetailData.bookPath,
      bookName: bookDetailData.bookName,
      totalPage: bookDetailData.totalPage,
      isFavourite: isFavourite,
      bookId: props.route.params.bookId,
      readPageAt: bookDetailData.readPageAt,
    });
  }, [bookDetailData, props.route.params, isFavourite]);

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}>
        <SafeAreaView
          edges={['top']}
          style={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
          }}>
          <View style={{flex: 1}}>
            <BackButton
              style={{marginLeft: 12, marginTop: 12, alignSelf: 'flex-start'}}
              clickedGoBack={goBack}
            />

            <Animated.Image
              entering={FadeInUp.duration(600)}
              source={{uri: API_URL + bookDetailData.bookImage}}
              style={{
                width: '75%',
                height: 400,
                backgroundColor: GeneralColor.light_grey,
                borderRadius: 20,
                alignSelf: 'center',
              }}
            />
            <Animated.View
              style={{marginTop: 16}}
              entering={FadeIn.delay(600).duration(600)}>
              <TextView
                text={bookDetailData?.bookName}
                textStyle={{
                  fontSize: 24,
                  width: '90%',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  alignSelf: 'center',
                }}
              />
            </Animated.View>
            <View
              style={{
                width: '90%',
                alignSelf: 'center',
                marginTop: 12,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  onPress={clickedAuthor}
                  style={{
                    flexDirection: 'row',
                    borderRadius: 30,
                    marginTop: 12,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Animated.View
                      entering={FadeInLeft.delay(800).duration(600)}>
                      <TextView
                        text={label.author}
                        textStyle={{
                          fontSize: 12,
                          opacity: 0.5,
                          marginRight: 12,
                        }}
                      />
                    </Animated.View>

                    <Animated.Image
                      entering={FadeIn.delay(1000).duration(600)}
                      source={{uri: API_URL + bookDetailData.authorImage}}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: GeneralColor.light_grey,
                        borderRadius: 40,
                        marginRight: 10,
                      }}
                    />

                    <Animated.View entering={FadeIn.delay(1400).duration(600)}>
                      <TextView
                        text={bookDetailData.authorName}
                        textStyle={{
                          fontSize: 14,
                          textDecorationLine: 'underline',
                        }}
                      />
                    </Animated.View>
                  </View>
                </TouchableOpacity>

                <Animated.View entering={BounceIn.duration(600).delay(1600)}>
                  <TouchableOpacity
                    onPress={clickedFavourite}
                    style={{justifyContent: 'center'}}>
                    <AntDesign
                      name={isFavourite ? 'heart' : 'hearto'}
                      size={30}
                      color={isFavourite ? 'red' : theme.backgroundColor2}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
              {bookDetailData?.readPageAt == -1 ? (
                <View style={{height: 60}} />
              ) : (
                <Animated.View
                  entering={FadeIn.duration(600).delay(1000)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 60,
                    justifyContent: 'flex-start',
                  }}>
                  <Ionicons
                    style={{marginRight: 10}}
                    name="bookmark"
                    size={20}
                    color={theme.backgroundColor2}
                  />
                  <TextView
                    textStyle={{marginRight: 12, fontSize: 12}}
                    text={label.bookmark_page_at}
                  />
                  <TextView
                    textStyle={{fontSize: 22, fontWeight: 'bold'}}
                    text={bookDetailData?.readPageAt.toString()}
                  />
                </Animated.View>
              )}

              <Animated.View
                style={{marginBottom: 30}}
                entering={FadeInDown.delay(2000).duration(300)}>
                <TouchableOpacity
                  onPress={clickedReadNow}
                  style={{
                    width: 120,
                    height: 40,
                    backgroundColor: GeneralColor.app_theme,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    borderRadius: 30,
                  }}>
                  <TextView
                    text={label.read}
                    textStyle={{
                      textAlign: 'center',
                      fontSize: 18,
                      color: GeneralColor.white,
                      fontWeight: 'bold',
                    }}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
              }}>
              <BannerAd
                unitId={ADS_BANNER_UNIT_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                  keywords: ['fashion', 'clothing'],
                }}
              />
            </View>
          </View>
        </SafeAreaView>
        <LoginDialog
          clickedLogin={() => {
            props.navigation.navigate('ProfileScreen');
          }}
          clickedSignUp={() => {
            props.navigation.navigate('SignUpScreen');
            setIsShowLoginDialog(false);
          }}
          isVisible={isShowLoginDialog}
          clickedClosed={() => {
            setIsShowLoginDialog(false);
          }}
        />
      </ScrollView>

      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(BookDetailScreen);
