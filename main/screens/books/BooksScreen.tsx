import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import {ViewMoreButton} from '../../components/ViewMoreButton';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeOut,
  FadeInDown,
  FadeOutDown,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';

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
      setTimeout(() => {
        setScreenRefresh(false);
      }, 2000);
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
            <Animated.View
              entering={FadeInDown.delay(item.index * 300)}
              exiting={FadeOut}>
              <TextView
                text={item.item.categoryName}
                textStyle={{fontSize: 20, fontWeight: 'bold'}}
              />
            </Animated.View>

            <Animated.View entering={SlideInRight.delay(item.index * 300)}>
              <ViewMoreButton clickedViewMore={() => clickedViewmore(item)} />
            </Animated.View>
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
          {/* <Animated.View entering={FadeInDown} exiting={FadeOut}> */}
          <TextView
            text={label.authors}
            textStyle={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          />
          {/* </Animated.View> */}
          {/* <Animated.View
            entering={SlideInRight.delay(600)}
            exiting={SlideOutRight}> */}
          <ViewMoreButton clickedViewMore={() => clickedAuthorViewmore()} />
          {/* </Animated.View> */}
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

  const renderAuthorItem = useCallback(
    (item: any) => {
      return (
        <Animated.View
          entering={FadeInDown.delay(item.index * 300)}
          exiting={FadeOutDown.delay(item.index * 300)}>
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
        </Animated.View>
      );
    },
    [authorListData],
  );

  const renderBookListItem = useCallback(
    (item: any) => {
      return (
        <Animated.View
          entering={FadeInDown.delay(item.index * 300)}
          exiting={FadeOutDown.delay(item.index * 300)}>
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
        </Animated.View>
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
  }, []);

  return (
    <SafeAreaView
      edges={['top']}
      style={{flex: 1, backgroundColor: theme.backgroundColor}}>
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
        ListHeaderComponent={renderBookAuthorItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}
