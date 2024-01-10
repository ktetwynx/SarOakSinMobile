import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_KEY_PRODUCION, API_URL, dummyData} from '../../config/Constant';
import {RootTabScreenProps} from '../../route/StackParamsTypes';
import {ViewMoreButton} from '../../components/ViewMoreButton';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import {ScrollView} from 'react-native-gesture-handler';
import {GeneralColor} from '../../utility/Themes';
import {SearchBar} from '../../components/SearchBar';

export function BooksScreen(props: RootTabScreenProps<'BooksScreen'>) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [bookListData, setBookListData] = useState(dummyData);
  const [authorListData, setAuthorListData] = useState(dummyData);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const animationForScreen = 'fadeInUp';
  const {width, height} = Dimensions.get('screen');
  // const searchBarHeight = new Animated.Value(0);
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const [label, setLabel] = React.useState({
    authors: i18n.t('authors'),
    search_book_text: i18n.t('search_book_text'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        authors: i18n.t('authors'),
        search_book_text: i18n.t('search_book_text'),
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
      Authorization: API_KEY_PRODUCION,
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

  const clickedSearch = useCallback(() => {
    props.navigation.navigate('SearchScreen', {searchType: 1});
  }, []);

  const renderBookCategoryItem = useCallback(
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
            <Animatable.View
              useNativeDriver={true}
              animation={animationForScreen}>
              <TextView
                text={item.item.categoryName}
                textStyle={{fontSize: 20, fontWeight: 'bold'}}
              />
            </Animatable.View>

            <Animatable.View
              useNativeDriver={true}
              animation={animationForScreen}>
              <ViewMoreButton clickedViewMore={() => clickedViewmore(item)} />
            </Animatable.View>
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={item.item.bookList ? item.item.bookList : dummyData}
            style={{marginTop: 10, marginBottom: 12}}
            contentContainerStyle={{paddingLeft: 12}}
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
    return (
      <View
        style={{
          flexDirection: 'column',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: 16,
            alignItems: 'center',
            marginBottom: 12,
          }}>
          <TextView
            text={label.authors}
            textStyle={{fontSize: 20, fontWeight: 'bold'}}
          />
          <ViewMoreButton clickedViewMore={() => clickedAuthorViewmore()} />
        </View>
        <FlatList
          style={{marginTop: 10, marginBottom: 12}}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          contentContainerStyle={{paddingLeft: 12}}
          data={authorListData}
          renderItem={renderAuthorItem}
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </View>
    );
  }, [authorListData, label]);

  const renderAuthorItem = useCallback(
    (item: any) => {
      return (
        <Animatable.View useNativeDriver={true} animation={animationForScreen}>
          <TouchableOpacity
            disabled={item?.item?.name ? false : true}
            onPress={() => clickedAuthor(item)}
            style={{flexDirection: 'column', marginRight: 12}}>
            <Image
              style={{
                width: 80,
                height: 80,
                alignSelf: 'center',
                backgroundColor: GeneralColor.light_grey,
                borderRadius: 50,
              }}
              source={{uri: API_URL + item.item.profile}}
            />
            <TextView
              text={item.item.name}
              numberOfLines={2}
              textStyle={{
                alignSelf: 'center',
                marginTop: 6,
                fontSize: 16,
                textAlign: 'center',
                maxWidth: 100,
              }}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [authorListData],
  );

  const renderBookListItem = useCallback(
    (item: any) => {
      return (
        <Animatable.View useNativeDriver={true} animation={animationForScreen}>
          <TouchableOpacity
            disabled={item?.item?.name ? false : true}
            onPress={() => clickedBookDetail(item.item.id)}
            style={{
              flexDirection: 'column',
              marginRight: 12,
            }}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
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
                marginTop: 6,
                textAlign: 'center',
                alignSelf: 'center',
                fontSize: 16,
              }}
            />

            <TextView
              numberOfLines={1}
              text={item.item.myAuthor?.name}
              textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [bookListData],
  );

  const clickedAuthor = (item: any) => {
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

  const transfromHeight = searchBarHeight.interpolate({
    inputRange: [0, height * 0.11],
    outputRange: [0, -height * 0.11],
    extrapolateRight: 'clamp',
  });

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.app_theme}}>
      <Animatable.Image
        useNativeDriver={true}
        animation={'fadeIn'}
        delay={1000}
        style={{
          width: '100%',
          top: -20,
          resizeMode: 'contain',
          position: 'absolute',
        }}
        source={require('../../assets/images/forBookScreen.jpg')}
      />
      <SafeAreaView edges={['top']} style={{flex: 1}}>
        <SearchBar
          paddingTop={height * 0.02}
          text={label.search_book_text}
          clickedSearch={clickedSearch}
        />
        <Animated.View
          style={[
            {
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              backgroundColor: theme.backgroundColor,
              overflow: 'hidden',
            },
            {transform: [{translateY: transfromHeight}]},
          ]}>
          <Animated.FlatList
            scrollEnabled={true}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: searchBarHeight}}}],
              {useNativeDriver: true},
            )}
            showsVerticalScrollIndicator={false}
            bounces={false}
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
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 4,
            }}
            style={[
              {
                paddingTop: 8,
              },
            ]}
            renderItem={renderBookCategoryItem}
            ListHeaderComponent={renderBookAuthorItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
