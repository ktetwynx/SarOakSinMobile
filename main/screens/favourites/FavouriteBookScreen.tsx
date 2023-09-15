import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ConnectedProps, connect} from 'react-redux';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL, ROW_COUNT} from '../../config/Constant';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {useFocusEffect} from '@react-navigation/native';
import Animated, {FadeOut, FadeInDown} from 'react-native-reanimated';
import {LoadingScreen} from '../../components/LoadingScreen';
import {GeneralColor} from '../../utility/Themes';

const mapstateToProps = (state: {profile: any; token: any}) => {
  return {
    profile: state.profile,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'FavouriteBookScreen'>;

function FavouriteBookScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favList, setFavList] = useState([]);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [label, setLabel] = React.useState({
    fav_book_list: i18n.t('fav_book_list'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        fav_book_list: i18n.t('fav_book_list'),
      });
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavouriteList(0);
    }, [props.profile.id]),
  );

  useEffect(() => {
    if (screenRefresh) {
      setPageAt(0);
      fetchFavouriteList(0);
    }
  }, [screenRefresh]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchFavouriteList(currentPage);
    }
  };

  const fetchFavouriteList = useCallback(
    async (pageAt: number) => {
      let formData = new FormData();
      formData.append('userId', props.profile.id);
      formData.append('page', pageAt);
      formData.append('size', ROW_COUNT);
      formData.append('category', 'book');
      await ApiFetchService(API_URL + 'user/saved-list', formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      }).then((response: any) => {
        setTimeout(() => {
          setIsLoading(false);
          setScreenRefresh(false);
        }, 1000);
        if (response.code == 200) {
          setFavList(prev =>
            pageAt === 0
              ? response.data.content
              : [...prev, ...response.data.content],
          );
          setTotalPage(response.data.totalPages);
        }
      });
    },
    [props.profile.id],
  );

  const clickedBook = useCallback((id: number) => {
    props.navigation.navigate('BookDetailScreen', {bookId: id});
  }, []);

  const renderFavItem = useCallback(
    (item: any) => {
      return (
        <Animated.View
          style={{
            marginBottom: 12,
            flex: 0.5,
            marginRight: 12,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
          entering={FadeInDown}
          exiting={FadeOut}>
          <TouchableOpacity onPress={() => clickedBook(item.item.id)}>
            <Image
              style={{
                backgroundColor: GeneralColor.light_grey,
                borderRadius: 20,
                height: 200,
              }}
              source={{uri: API_URL + item.item.imgPath}}
            />
            <TextView
              numberOfLines={2}
              text={item.item.name}
              textStyle={{
                alignSelf: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 6,
              }}
            />
            <TextView
              text={item.item.myAuthor.name}
              numberOfLines={1}
              textStyle={{alignSelf: 'center', marginTop: 2, opacity: 0.5}}
            />
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [favList, props.token],
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
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <BackButton style={{marginLeft: 12}} clickedGoBack={goBack} />
          <Animated.View entering={FadeInDown.duration(600)} exiting={FadeOut}>
            <TextView
              text={label.fav_book_list}
              textStyle={{fontSize: 18, fontWeight: 'bold', marginLeft: 12}}
            />
          </Animated.View>
        </View>
        <FlatList
          data={favList}
          style={{
            paddingTop: 12,
            paddingLeft: 12,
          }}
          contentContainerStyle={{paddingBottom: 100}}
          onEndReachedThreshold={0}
          onEndReached={onEndListReached}
          refreshControl={
            <RefreshControl
              refreshing={screenRefresh}
              onRefresh={onRefreshScreen}
              tintColor={theme.backgroundColor2}
              // titleColor={theme.backgroundColor2}
              // title="Pull to refresh"
            />
          }
          numColumns={2}
          renderItem={renderFavItem}
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(FavouriteBookScreen);
