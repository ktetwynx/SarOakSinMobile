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
import {API_URL, LYRICS_TITLE, ROW_COUNT} from '../../config/Constant';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ConnectedProps, connect} from 'react-redux';
import {LoadingScreen} from '../components/LoadingScreen';
import Animated, {FadeOut, FadeInDown} from 'react-native-reanimated';

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
  RootStackScreenProps<'LyricListViewmoreScreen'>;

function LyricListViewmoreScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [viewMoreData, setViewMoreData] = useState([]);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageAt, setPageAt] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [label, setLabel] = React.useState({
    lyrics: i18n.t('lyrics'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        lyrics: i18n.t('lyrics'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchLyricsViewMoreApi(0);
  }, []);

  useEffect(() => {
    if (screenRefresh) {
      setPageAt(0);
      fetchLyricsViewMoreApi(0);
    }
  }, [screenRefresh]);

  const fetchLyricsViewMoreApi = useCallback(
    async (pageAt: number) => {
      let formData = new FormData();
      formData.append('name', 'lyric');
      formData.append('userId', props.profile?.id ? props.profile.id : 0);
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
    },
    [props.profile?.id],
  );

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchLyricsViewMoreApi(currentPage);
    }
  };

  const clickedLyric = useCallback(
    (item: any) => {
      props.navigation.navigate('ImageView', {
        currentImageIndex: item.index,
        lyricsImages: lyricsImages,
      });
    },
    [lyricsImages],
  );

  const renderViewMoreItem = useCallback(
    (item: any) => {
      return (
        <Animated.View
          style={{
            flexDirection: 'column',
            marginTop: 12,
            flex: 0.5,
            marginRight: 12,
          }}
          entering={FadeInDown}
          exiting={FadeOut}>
          <TouchableOpacity onPress={() => clickedLyric(item)}>
            <Image
              style={{
                backgroundColor: 'grey',
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
    },
    [lyricsImages],
  );

  return (
    <View>
      <SafeAreaView
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
              text={label.lyrics}
              textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
            />
          </Animated.View>
        </View>
        <FlatList
          numColumns={2}
          data={viewMoreData}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{paddingLeft: 12}}
          renderItem={renderViewMoreItem}
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
          keyExtractor={(item: any, index: number) => index.toString()}
        />
      </SafeAreaView>
      {isLoading ? <LoadingScreen /> : <></>}
    </View>
  );
}

export default connector(LyricListViewmoreScreen);
