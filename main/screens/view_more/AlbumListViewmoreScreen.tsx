import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ApiFetchService} from '../../service/ApiFetchService';
import {ALBUM_TITLE, API_URL, ROW_COUNT} from '../../config/Constant';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import {LoadingScreen} from '../components/LoadingScreen';
import Animated, {FadeOut, FadeInDown} from 'react-native-reanimated';

export function AlbumListViewmoreScreen(
  props: RootStackScreenProps<'AlbumListViewmoreScreen'>,
) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [viewMoreData, setViewMoreData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    albums: i18n.t('albums'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        albums: i18n.t('albums'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchAlbumViewMoreApi(0);
  }, []);

  const fetchAlbumViewMoreApi = useCallback(async (pageAt: number) => {
    let formData = new FormData();
    formData.append('name', 'album');
    formData.append('page', pageAt);
    formData.append('size', ROW_COUNT);
    await ApiFetchService(API_URL + `user/lyric/home-navigate`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
        setScreenRefresh(false);
      }, 1000);
      if (response.code == 200) {
        setViewMoreData(prev =>
          pageAt === 0
            ? response.data.content
            : [...prev, ...response.data.content],
        );
        setTotalPage(response.data.totalPages);
      }
    });
  }, []);

  useEffect(() => {
    if (screenRefresh) {
      setPageAt(0);
      fetchAlbumViewMoreApi(0);
    }
  }, [screenRefresh]);

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchAlbumViewMoreApi(currentPage);
    }
  };

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedAlbum = useCallback((item: any) => {
    props.navigation.navigate('AlbumScreen', {
      albumId: item.item.id,
      albumName: item.item.name,
      albumImage: item.item.imgPath,
    });
  }, []);

  const renderViewMoreItem = useCallback(
    (item: any) => {
      return (
        <Animated.View
          style={{
            flexDirection: 'column',
            marginRight: 12,
            marginBottom: 12,
            flex: 0.5,
          }}
          entering={FadeInDown}
          exiting={FadeOut}>
          <TouchableOpacity onPress={() => clickedAlbum(item)}>
            <Image
              style={{
                height: 100,
                borderRadius: 10,
                flex: 1,
                backgroundColor: 'grey',
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
    },
    [viewMoreData],
  );

  return (
    <View>
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
          <Animated.View entering={FadeInDown.duration(600)} exiting={FadeOut}>
            <TextView
              text={label.albums}
              textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
            />
          </Animated.View>
        </View>
        <FlatList
          numColumns={2}
          showsVerticalScrollIndicator={false}
          data={viewMoreData}
          style={{paddingLeft: 12, paddingTop: 12}}
          contentContainerStyle={{paddingBottom: 100}}
          renderItem={renderViewMoreItem}
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
          onEndReached={onEndListReached}
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}
