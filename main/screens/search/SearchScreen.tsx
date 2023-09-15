import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import i18n from '../../language/i18n';
import {ThemeContext} from '../../utility/ThemeProvider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GeneralColor} from '../../utility/Themes';
import {TextView} from '../../components/TextView';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {ConnectedProps, connect} from 'react-redux';
import Animated, {
  FadeOut,
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import {LoadingScreen} from '../../components/LoadingScreen';

const mapstateToProps = (state: {profile: any}) => {
  return {
    profile: state.profile,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'SearchScreen'>;

const SearchScreen = (props: Props) => {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [searchType, setSearchType] = useState<number>(0);
  const [searchData, setSearchData] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [bookFilterIndex, setBookFilterIndex] = useState<number>(0);
  const [lyricFilterIndex, setLyricFilterIndex] = useState<number>(0);
  const [label, setLabel] = useState({
    search_lyric_text: i18n.t('search_lyric_text'),
    search_book_text: i18n.t('search_book_text'),
    author: i18n.t('author'),
    singer: i18n.t('singer'),
    book: i18n.t('book'),
    lyric: i18n.t('lyric'),
    album: i18n.t('album'),
  });

  const bookFilterArray = [
    {title: label.book, type: 'book_name'},
    {title: label.author, type: 'book_author'},
  ];
  const lyricFilterArray = [
    {title: label.lyric, type: 'lyric_name'},
    {title: label.album, type: 'lyric_album'},
    {title: label.singer, type: 'lyric_author'},
  ];

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        search_lyric_text: i18n.t('search_lyric_text'),
        search_book_text: i18n.t('search_book_text'),
        author: i18n.t('author'),
        singer: i18n.t('singer'),
        book: i18n.t('book'),
        lyric: i18n.t('lyric'),
        album: i18n.t('album'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setSearchType(props.route.params.searchType);
  }, [props.route.params.searchType]);

  useEffect(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchSearchApi();
    }
  }, [lyricFilterIndex, bookFilterIndex, searchKeyword]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const onChangeText = useCallback((text: string) => {
    setSearchKeyword(text);
  }, []);

  const clickedSearch = useCallback(() => {
    if (!onValidate()) {
      return;
    } else {
      fetchSearchApi();
    }
  }, [searchType, bookFilterIndex, lyricFilterIndex, searchKeyword]);

  const onValidate = (): boolean => {
    let searchKeywordText = true;

    switch (true) {
      case !searchKeyword.trim():
        searchKeywordText = false;
        break;

      default:
        break;
    }

    return searchKeywordText;
  };

  const clickedBookFilter = useCallback(
    (index: number) => {
      onValidate() && setIsLoading(true);
      setBookFilterIndex(index);
    },
    [searchType, searchKeyword],
  );

  const clickedLyricFilter = useCallback(
    (index: number) => {
      onValidate() && setIsLoading(true);
      setLyricFilterIndex(index);
    },
    [searchType, searchKeyword],
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

  const clickedAlbum = useCallback((item: any) => {
    props.navigation.navigate('AlbumScreen', {
      albumId: item.item.id,
      albumName: item.item.name,
      albumImage: item.item.imgPath,
    });
  }, []);

  const clickedSinger = useCallback((item: any) => {
    props.navigation.navigate('AuthorScreen', {
      authorId: item.item.id,
      authorName: item.item.name,
      authorType: item.item.authorType,
      authorImage: item.item.profile,
    });
  }, []);

  const clickedAuthor = (item: any) => {
    props.navigation.navigate('AuthorScreen', {
      authorId: item.item.id,
      authorName: item.item.name,
      authorType: item.item.authorType,
      authorImage: item.item.profile,
    });
  };

  const clickedBookDetail = useCallback((id: number) => {
    props.navigation.navigate('BookDetailScreen', {bookId: id});
  }, []);

  const fetchSearchApi = useCallback(async () => {
    let formData = new FormData();
    let endPointPrefix = '';
    if (searchType === 1) {
      endPointPrefix = 'user/book/search/get-by-filter';
      formData.append('type', bookFilterArray[bookFilterIndex].type);
    } else {
      endPointPrefix = 'user/lyric/search/get-by-filter';
      formData.append('type', lyricFilterArray[lyricFilterIndex].type);
    }
    formData.append('userId', props.profile?.id ? props.profile.id : 0);
    formData.append('name', searchKeyword);
    await ApiFetchService(API_URL + endPointPrefix, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      if (response.code == 200) {
        setSearchData(response.data.content);
        let images = [];
        for (let data of response.data.content) {
          images.push({
            url: API_URL + data.imgPath,
            isSaved: data.saved,
            lyricsId: data.id,
          });
        }
        setLyricsImages(images);
      } else {
        setSearchData([]);
      }
    });
  }, [
    searchType,
    bookFilterIndex,
    lyricFilterIndex,
    searchKeyword,
    props.profile?.id,
  ]);

  const renderSearchItem = useCallback(
    (item: any) => {
      if (searchType === 1) {
        if (bookFilterArray[bookFilterIndex].title === label.book) {
          return (
            <Animated.View
              style={{
                flexDirection: 'column',
                marginTop: 12,
                flex: 0.5,
                margin: 6,
              }}
              entering={FadeInDown}
              exiting={FadeOutDown}>
              <TouchableOpacity onPress={() => clickedBookDetail(item.item.id)}>
                <Image
                  style={{
                    backgroundColor: GeneralColor.light_grey,
                    width: '100%',
                    height: 220,
                    borderRadius: 20,
                  }}
                  source={{
                    uri: API_URL + item.item.imgPath,
                  }}
                />
                <TextView
                  text={item.item.name}
                  numberOfLines={2}
                  textStyle={{
                    width: 140,
                    alignSelf: 'center',
                    marginTop: 6,
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                />

                <TextView
                  numberOfLines={1}
                  text={item.item.myAuthor?.name}
                  textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
                />
              </TouchableOpacity>
            </Animated.View>
            // <Animated.View
            //   style={{
            //     flexDirection: 'column',
            //     margin: 6,
            //     marginBottom: 12,
            //     flex: 0.5,
            //     justifyContent: 'center',
            //     alignItems: 'center',
            //   }}
            //   entering={FadeInDown}
            //   exiting={FadeOutDown}>
            //   <TouchableOpacity
            //     style={{backgroundColor: 'red'}}
            //     onPress={() => clickedBookDetail(item.item.id)}>
            //     <Image
            //       style={{
            //         backgroundColor: 'grey',
            //         width: '100%',
            //         height: 200,
            //         borderRadius: 20,
            //       }}
            //       source={{uri: API_URL + item.item.imgPath}}
            //     />

            //   </TouchableOpacity>
            // </Animated.View>
          );
        } else if (bookFilterArray[bookFilterIndex].title === label.author) {
          return (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutDown}
              style={{
                flexDirection: 'column',
                margin: 6,
                marginBottom: 12,
                flex: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity onPress={() => clickedAuthor(item)}>
                <Image
                  style={{
                    width: 100,
                    height: 100,
                    alignSelf: 'center',
                    backgroundColor: GeneralColor.light_grey,
                    borderRadius: 50,
                  }}
                  source={{uri: API_URL + item.item.profile}}
                />
                <TextView
                  text={item.item.name}
                  numberOfLines={1}
                  textStyle={{alignSelf: 'center', marginTop: 6, fontSize: 16}}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        } else {
          return <></>;
        }
      } else if (searchType === 2) {
        if (lyricFilterArray[lyricFilterIndex].title === label.lyric) {
          return (
            <Animated.View
              style={{
                flexDirection: 'column',
                marginTop: 12,
                flex: 0.5,
                margin: 6,
              }}
              entering={FadeInDown}
              exiting={FadeOutDown}>
              <TouchableOpacity onPress={() => clickedLyric(item)}>
                <Image
                  style={{
                    backgroundColor: GeneralColor.light_grey,
                    width: '100%',
                    height: 220,
                    borderRadius: 20,
                  }}
                  source={{
                    uri: API_URL + item.item.imgPath,
                  }}
                />
                <TextView
                  text={item.item.name}
                  numberOfLines={1}
                  textStyle={{
                    alignSelf: 'center',
                    marginTop: 6,
                    fontSize: 16,
                  }}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        } else if (lyricFilterArray[lyricFilterIndex].title === label.album) {
          return (
            <Animated.View
              style={{
                flexDirection: 'column',
                margin: 6,
                marginBottom: 12,
                flex: 0.5,
              }}
              entering={FadeInDown}
              exiting={FadeOutDown}>
              <TouchableOpacity onPress={() => clickedAlbum(item)}>
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
            </Animated.View>
          );
        } else if (lyricFilterArray[lyricFilterIndex].title === label.singer) {
          return (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutDown}
              style={{
                flexDirection: 'column',
                margin: 6,
                marginBottom: 12,
                flex: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity onPress={() => clickedSinger(item)}>
                <Image
                  style={{
                    width: 100,
                    height: 100,
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
            </Animated.View>
          );
        } else {
          return <></>;
        }
      } else {
        return <></>;
      }
    },
    [
      searchType,
      bookFilterArray,
      lyricFilterArray,
      bookFilterIndex,
      lyricFilterIndex,
    ],
  );

  return (
    <View>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}
        edges={['top']}>
        <View style={{width: '100%', height: '100%'}}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: 16,
              alignItems: 'center',
            }}>
            <BackButton clickedGoBack={goBack} style={{marginLeft: 12}} />

            <View
              style={{
                marginRight: 16,
                marginLeft: 6,
                height: 45,
                flex: 1,
                backgroundColor: theme.backgroundColor3,
                flexDirection: 'row',
                borderRadius: 40,
                alignItems: 'center',
                // borderWidth: 1,
                // borderColor: theme.backgroundColor2,
              }}>
              <TextInput
                // value={props.value}
                onChangeText={onChangeText}
                autoFocus={true}
                placeholder={
                  searchType == 1
                    ? label.search_book_text
                    : label.search_lyric_text
                }
                placeholderTextColor={GeneralColor.grey}
                style={{
                  width: '100%',
                  height: '100%',
                  flex: 1,
                  paddingLeft: 16,
                  color: theme.textColor,
                }}
              />

              <TouchableOpacity
                onPress={clickedSearch}
                style={{width: 50, justifyContent: 'center'}}>
                <Ionicons
                  name="search-circle"
                  size={40}
                  color={GeneralColor.app_theme}
                  style={{alignSelf: 'center', marginRight: 6}}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 10,
              justifyContent: 'center',
            }}>
            {searchType == 1
              ? bookFilterArray.map((item: any, index: number) => {
                  return (
                    <TouchableOpacity
                      onPress={() => clickedBookFilter(index)}
                      key={index}
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.backgroundColor2,
                        paddingVertical: 1,
                        paddingHorizontal: 6,
                        marginHorizontal: 6,
                        backgroundColor:
                          bookFilterIndex === index
                            ? theme.backgroundColor2
                            : theme.backgroundColor,
                      }}>
                      <TextView
                        textStyle={{
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          color:
                            bookFilterIndex === index
                              ? theme.backgroundColor1
                              : theme.textColor,
                        }}
                        text={item.title}
                      />
                    </TouchableOpacity>
                  );
                })
              : lyricFilterArray.map((item: any, index: number) => {
                  return (
                    <TouchableOpacity
                      onPress={() => clickedLyricFilter(index)}
                      key={index}
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.backgroundColor2,
                        paddingVertical: 1,
                        paddingHorizontal: 6,
                        marginHorizontal: 6,
                        backgroundColor:
                          lyricFilterIndex === index
                            ? theme.backgroundColor2
                            : theme.backgroundColor,
                      }}>
                      <TextView
                        textStyle={{
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          color:
                            lyricFilterIndex === index
                              ? theme.backgroundColor1
                              : theme.textColor,
                        }}
                        text={item.title}
                      />
                    </TouchableOpacity>
                  );
                })}
          </View>
          <FlatList
            data={searchData}
            numColumns={2}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{paddingHorizontal: 12, marginTop: 6}}
            renderItem={renderSearchItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
};

export default connector(SearchScreen);
