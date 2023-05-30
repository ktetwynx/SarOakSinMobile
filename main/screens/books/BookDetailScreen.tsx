import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {
  RootStackScreenProps,
  RootTabScreenProps,
} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
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
  const [bookDetailData, setBookDetailData] = useState<BookDetail>({
    bookName: '',
    bookImage: '-',
    authorName: '',
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
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
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
    if (isFavourite) {
      fetchRemoveBookApi();
    } else {
      fetchSaveBookApi();
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
    <SafeAreaView
      edges={['top']}
      style={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: theme.backgroundColor,
      }}>
      <BackButton
        style={{position: 'absolute', left: 12}}
        clickedGoBack={goBack}
      />
      <Image
        source={{uri: API_URL + bookDetailData.bookImage}}
        style={{
          width: '75%',
          zIndex: -1,
          height: '50%',
          backgroundColor: 'grey',
          borderRadius: 20,
          alignSelf: 'center',
          marginTop: 36,
        }}
      />
      <TextView
        text={bookDetailData?.bookName}
        textStyle={{
          fontSize: 24,
          width: '90%',
          textAlign: 'center',
          fontWeight: 'bold',
          alignSelf: 'center',
          marginTop: 16,
        }}
      />
      <View style={{width: '90%', alignSelf: 'center', marginTop: 12}}>
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
              alignItems: 'center',
              borderRadius: 30,
              marginTop: 12,
            }}>
            <TextView
              text={label.author}
              textStyle={{fontSize: 12, opacity: 0.5, marginRight: 12}}
            />

            <TextView
              text={bookDetailData.authorName}
              textStyle={{fontSize: 14, textDecorationLine: 'underline'}}
            />

            <Image
              source={{uri: API_URL + bookDetailData.authorImage}}
              style={{
                width: 40,
                height: 40,
                backgroundColor: 'grey',
                borderRadius: 40,
                marginLeft: 10,
              }}
            />
          </TouchableOpacity>

          {props.token != null ? (
            <TouchableOpacity
              onPress={clickedFavourite}
              style={{justifyContent: 'center'}}>
              <AntDesign
                name={isFavourite ? 'heart' : 'hearto'}
                size={30}
                color={isFavourite ? 'red' : theme.backgroundColor2}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        {bookDetailData?.readPageAt == -1 ? (
          <></>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
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
          </View>
        )}

        <TouchableOpacity
          onPress={clickedReadNow}
          style={{
            width: 120,
            height: 40,
            marginTop: 60,
            backgroundColor: 'grey',
            justifyContent: 'center',
            alignSelf: 'center',
            borderRadius: 30,
          }}>
          <TextView
            text={label.read}
            textStyle={{
              textAlign: 'center',
              fontSize: 18,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default connector(BookDetailScreen);
