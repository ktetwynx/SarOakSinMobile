import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {API_URL, BOOKS_TITLE, LYRICS_TITLE} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {ConnectedProps, connect} from 'react-redux';
import {LoadingScreen} from '../components/LoadingScreen';
import Animated, {
  FadeOut,
  FadeInDown,
  SlideInUp,
  FadeIn,
} from 'react-native-reanimated';
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
  RootStackScreenProps<'AuthorScreen'>;
function AuthorScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [authorId, setAuthorId] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorData, setAuthorData] = useState([]);
  const [authorImage, setAuthorImage] = useState<string>('-');
  const [authorType, setAuthorType] = useState<number>(0);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
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
    setAuthorName(props.route.params.authorName);
    setAuthorType(props.route.params.authorType);
    setAuthorImage(props.route.params.authorImage);
  }, [props.route.params]);

  useEffect(() => {
    if (authorId != 0) {
      fetchAuthorApi();
    }
  }, [authorId]);

  useEffect(() => {
    if (screenRefresh) {
      fetchAuthorApi();
    }
  }, [screenRefresh]);

  const fetchAuthorApi = useCallback(async () => {
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

    await ApiFetchService(API_URL + url, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
        setScreenRefresh(false);
      }, 1000);
      if (response.code == 200) {
        setAuthorData(response.data.content);
        let images = [];
        for (let data of response.data.content) {
          images.push({
            url: API_URL + data.imgPath,
            isSaved: data.saved,
            lyricsId: data.id,
          });
        }
        setLyricsImages(images);
      }
    });
  }, [authorId, authorType, props.profile?.id]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedAuthorItem = useCallback(
    (item: any) => {
      if (authorType == 1) {
        props.navigation.push('BookDetailScreen', {bookId: item.item.id});
      } else if (authorType == 2) {
        props.navigation.navigate('ImageView', {
          currentImageIndex: item.index,
          lyricsImages: lyricsImages,
        });
      }
    },
    [authorType, lyricsImages],
  );

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const renderByAuthorItem = useCallback(
    (item: any) => {
      return authorType == 1 ? (
        <Animated.View
          style={{
            flexDirection: 'column',
            marginTop: 12,
            flex: 0.5,
          }}
          entering={FadeInDown}
          exiting={FadeOut}>
          <TouchableOpacity onPress={() => clickedAuthorItem(item)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                width: 150,
                height: 180,
                borderRadius: 20,
                alignSelf: 'center',
              }}
              //source={{uri: undefined}}
              source={{uri: API_URL + item.item.imgPath}}
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

            {item.item.myAuthor == null ? (
              <></>
            ) : (
              <TextView
                text={item.item.myAuthor?.name}
                numberOfLines={1}
                textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            flexDirection: 'column',
            marginTop: 12,
            flex: 0.5,
            margin: 6,
          }}
          entering={FadeInDown}
          exiting={FadeOut}>
          <TouchableOpacity onPress={() => clickedAuthorItem(item)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                width: '100%',
                height: 220,
                borderRadius: 20,
              }}
              //   source={{uri: item.item.imgPath}}
              source={{uri: API_URL + item.item.imgPath}}
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
    },
    [authorData, authorType, lyricsImages],
  );

  return (
    <View>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          backgroundColor: theme.backgroundColor,
        }}
        edges={['top']}>
        <BackButton
          style={{marginLeft: 16, marginTop: 12, alignSelf: 'flex-start'}}
          clickedGoBack={goBack}
        />
        <View
          style={{
            flexDirection: 'column',
            marginTop: -25,
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Animated.Image
            entering={SlideInUp.duration(400)}
            source={{uri: API_URL + authorImage}}
            style={{
              width: 100,
              height: 100,
              backgroundColor: GeneralColor.light_grey,
              // marginLeft: -80,
              borderRadius: 100,
            }}
          />
          <Animated.View entering={FadeIn.delay(500).duration(400)}>
            <TextView
              text={authorName}
              numberOfLines={1}
              textStyle={{fontSize: 22, fontWeight: 'bold', marginTop: 12}}
            />
          </Animated.View>
        </View>
        <View
          style={{
            flexDirection: 'column',
            paddingHorizontal: 16,
            flex: 1,
          }}>
          <Animated.View entering={FadeIn.delay(200).duration(600)}>
            <TextView
              text={authorType == 1 ? label.books : label.lyrics}
              textStyle={{fontSize: 18, marginVertical: 6}}
            />
          </Animated.View>

          <FlatList
            data={authorData}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={screenRefresh}
                onRefresh={onRefreshScreen}
                tintColor={theme.backgroundColor2}
                // titleColor={theme.backgroundColor2}
                // title="Pull to refresh"
              />
            }
            contentContainerStyle={{paddingBottom: 50}}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderByAuthorItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(AuthorScreen);
