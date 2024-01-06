import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ApiFetchService} from '../../service/ApiFetchService';
import {
  API_KEY_PRODUCION,
  API_URL,
  ROW_COUNT,
  generateRandomNumber,
} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import {LoadingScreen} from '../../components/LoadingScreen';
import * as Animatable from 'react-native-animatable';
import {GeneralColor} from '../../utility/Themes';

export function BookListViewmoreScreen(
  props: RootStackScreenProps<'BookListViewmoreScreen'>,
) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [viewMoreData, setViewMoreData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [randomValue, setRandomValue] = useState<number>(0);
  const animationForScreen = 'fadeInUp';

  useEffect(() => {
    setCategoryName(props.route.params.categoryName);
    setCategoryId(props.route.params.categoryId);
  }, [props.route.params]);

  useEffect(() => {
    if (randomValue != 0) {
      fetchViewMoreApi(0);
    }
  }, [randomValue]);

  useEffect(() => {
    if (categoryId != 0) {
      setRandomValue(generateRandomNumber());
    }
  }, [categoryId]);

  useEffect(() => {
    if (screenRefresh) {
      setPageAt(0);
      setRandomValue(generateRandomNumber());
    }
  }, [screenRefresh]);

  const fetchViewMoreApi = useCallback(
    async (currentPage: number) => {
      let formData = new FormData();
      formData.append('id', categoryId);
      formData.append('page', currentPage);
      formData.append('size', ROW_COUNT);
      console.log(formData);
      await ApiFetchService(
        API_URL + `user/book/category/get-by-id`,
        formData,
        {
          'Content-Type': 'multipart/form-data',
          Authorization: API_KEY_PRODUCION,
        },
      ).then((response: any) => {
        setTimeout(() => {
          setIsLoading(false);
          setScreenRefresh(false);
        }, 1000);

        if (response.code == 200) {
          setViewMoreData(prev =>
            currentPage === 0
              ? response.data.content
              : [...prev, ...response.data.content],
          );
          setTotalPage(response.data.totalPages);
        }
      });
    },
    [categoryId, viewMoreData],
  );

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedBookDetail = useCallback((id: number) => {
    props.navigation.navigate('BookDetailScreen', {bookId: id});
  }, []);

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const onEndListReached = () => {
    console.log(totalPage);
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchViewMoreApi(currentPage);
    }
  };

  const renderViewMoreItem = useCallback(
    (item: any) => {
      return (
        <Animatable.View
          // style={{
          //   flexDirection: 'column',
          //   marginTop: 12,
          //   flex: 0.333,
          // }}
          style={{
            flexDirection: 'column',
            marginTop: 22,
            flex: 0.333,
          }}
          useNativeDriver={true}
          animation={animationForScreen}>
          <TouchableOpacity
            style={{alignItems: 'center', marginHorizontal: 6}}
            onPress={() => clickedBookDetail(item.item.id)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                width: '100%',
                height: 140,
                alignSelf: 'center',
                borderRadius: 20,
              }}
              source={{uri: API_URL + item.item.imgPath}}
            />
            <TextView
              text={item.item.name}
              numberOfLines={2}
              textStyle={{
                alignSelf: 'center',
                width: 120,
                textAlign: 'center',
                marginTop: 6,
                fontSize: 16,
              }}
            />

            <TextView
              text={item.item.myAuthor.name}
              numberOfLines={1}
              textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
            />
          </TouchableOpacity>
        </Animatable.View>
      );
    },
    [viewMoreData],
  );

  return (
    <View style={{flex: 1}}>
      <SafeAreaView
        edges={['top']}
        style={{
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 16,
            marginTop: 10,
          }}>
          <BackButton
            clickedGoBack={() => {
              goBack();
            }}
          />
          <Animatable.View
            animation={animationForScreen}
            useNativeDriver={true}>
            <TextView
              text={categoryName}
              textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
            />
          </Animatable.View>
        </View>

        <View style={{flex: 1}}>
          <FlatList
            numColumns={3}
            data={viewMoreData}
            refreshControl={
              <RefreshControl
                refreshing={screenRefresh}
                onRefresh={onRefreshScreen}
                tintColor={theme.backgroundColor2}
                // titleColor={theme.backgroundColor2}
                // title="Pull to refresh"
              />
            }
            onEndReachedThreshold={0}
            style={{marginTop: 12}}
            onEndReached={onEndListReached}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 100}}
            renderItem={renderViewMoreItem}
            keyExtractor={(item: any, index: number) => index.toString()}
          />
        </View>
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}
