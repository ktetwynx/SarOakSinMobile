import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  NativeModules,
  RefreshControl,
} from 'react-native';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL, BOOKS_AUTHOR_TITLE} from '../../config/Constant';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import {ViewMoreButton} from '../../components/ViewMoreButton';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';

export function BooksScreen(props: RootTabScreenProps<'BooksScreen'>) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [bookListData, setBookListData] = useState([]);
  const [authorListData, setAuthorListData] = useState([]);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    authors: i18n.t('authors'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        authors: i18n.t('authors'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchHomeBookApi();
  }, []);

  useEffect(() => {
    if (screenRefresh) {
      fetchHomeBookApi();
    }
  }, [screenRefresh]);

  const fetchHomeBookApi = useCallback(async () => {
    await ApiFetchService(API_URL + `user/book/home`, null, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      if (response.code == 200) {
        setBookListData(response.data.categoryLists);
        setAuthorListData(response.data.authorList);
      }
    });
  }, []);

  const clickedViewmore = useCallback((item: any) => {
    props.navigation.navigate('BookListViewmoreScreen', {
      categoryId: item.item.categoryId,
      categoryName: item.item.categoryName,
    });
  }, []);

  const clickedBookDetail = useCallback((id: number) => {
    props.navigation.navigate('BookDetailScreen', {bookId: id});
  }, []);

  const renderBookCategoryItem = useCallback(
    (item: any) => {
      return (
        <View style={{flexDirection: 'column', marginBottom: 20}}>
          <View
            style={{
              marginHorizontal: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextView
              text={item.item.categoryName}
              textStyle={{fontSize: 20, fontWeight: 'bold'}}
            />

            <ViewMoreButton clickedViewMore={() => clickedViewmore(item)} />
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={item.item.bookList}
            style={{marginTop: 16, paddingLeft: 16}}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={renderBookListItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      );
    },
    [bookListData],
  );

  const renderBookListItem = useCallback(
    (item: any) => {
      return (
        <TouchableOpacity
          onPress={() => clickedBookDetail(item.item.id)}
          style={{flexDirection: 'column', marginRight: 12}}>
          <Image
            style={{
              backgroundColor: 'grey',
              width: 140,
              height: 160,
              borderRadius: 20,
            }}
            source={{uri: API_URL + item.item.imgPath}}
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
            text={item.item.myAuthor.name}
            textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
          />
        </TouchableOpacity>
      );
    },
    [bookListData],
  );

  const clickedAuthor = (item: any) => {
    console.log(item.item);
    props.navigation.navigate('AuthorScreen', {
      authorId: item.item.id,
      authorName: item.item.name,
      authorType: item.item.authorType,
      authorImage: item.item.profile,
    });
  };

  const clickedAuthorViewmore = useCallback(() => {
    props.navigation.navigate('AuthorListViewmoreScreen', {authorType: 1});
  }, []);

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
    setTimeout(() => {
      setScreenRefresh(false);
    }, 3000);
  }, []);

  const renderAuthorItem = useCallback(
    (item: any) => {
      return (
        <TouchableOpacity
          onPress={() => clickedAuthor(item)}
          style={{flexDirection: 'column', marginRight: 12}}>
          <Image
            style={{
              width: 80,
              height: 80,
              alignSelf: 'center',
              backgroundColor: 'grey',
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
      );
    },
    [authorListData],
  );

  const renderBookAuthorItem = useCallback(() => {
    return authorListData.length != 0 ? (
      <View style={{flexDirection: 'column', paddingBottom: 20}}>
        <View
          style={{
            marginHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
          <TextView
            text={label.authors}
            textStyle={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          />

          <ViewMoreButton clickedViewMore={() => clickedAuthorViewmore()} />
        </View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          contentContainerStyle={{paddingLeft: 16}}
          data={authorListData}
          renderItem={renderAuthorItem}
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </View>
    ) : (
      <></>
    );
  }, [authorListData, label]);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={bookListData}
      refreshControl={
        <RefreshControl
          refreshing={screenRefresh}
          onRefresh={onRefreshScreen}
          tintColor={theme.backgroundColor2}
          // titleColor={theme.backgroundColor2}
          // title="Pull to refresh"
        />
      }
      style={{paddingTop: 10, backgroundColor: theme.backgroundColor}}
      renderItem={renderBookCategoryItem}
      ListFooterComponent={renderBookAuthorItem}
      keyExtractor={(item: any, index: number) => index.toString()}
    />
  );
}
