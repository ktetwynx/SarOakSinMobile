import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {ThemeContext} from '../../utility/ThemeProvider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import * as Animatable from 'react-native-animatable';
import {TextView} from '../../components/TextView';
import {
  API_KEY_PRODUCION,
  API_URL,
  PLAY_MODE_TITLE,
  ROW_COUNT,
  generateRandomNumber,
} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {GeneralColor} from '../../utility/Themes';
import {ConnectedProps, connect} from 'react-redux';
import {LoadingScreen} from '../../components/LoadingScreen';
import {PlayModeView} from '../components/PlayModeView';
import {PlayModeButton} from '../components/PlayModeButton';

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
  RootStackScreenProps<'PlayModeViewMoreScreen'>;
function PlayModeViewMoreScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const animationForScreen = 'fadeInUp';
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenRefresh, setScreenRefresh] = useState<boolean>(false);
  const [viewMoreData, setViewMoreData] = useState();
  const [totalPage, setTotalPage] = useState<number>(0);
  const [pageAt, setPageAt] = useState<number>(0);
  const [playModeIdList, setPlayModeIdList] = useState<any>([]);
  const [randomValue, setRandomValue] = useState<number>(0);
  let IdArrayPlayModeList: number[] = [];
  useEffect(() => {
    setRandomValue(generateRandomNumber());
  }, []);

  useEffect(() => {
    if (randomValue != 0) {
      fetchLyricsViewMoreApi(0);
    }
  }, [randomValue]);

  useEffect(() => {
    if (screenRefresh) {
      setPageAt(0);
      setRandomValue(generateRandomNumber());
    }
  }, [screenRefresh]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const fetchLyricsViewMoreApi = useCallback(async (pageAt: number) => {
    let formData = new FormData();
    formData.append('name', 'lyrictxt');
    formData.append('userId', props.profile?.id ? props.profile.id : 0);
    formData.append('page', pageAt);
    formData.append('size', ROW_COUNT);
    formData.append('randomValues', randomValue);

    await ApiFetchService(API_URL + `user/lyric/home-navigate`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: API_KEY_PRODUCION,
    }).then((response: any) => {
      setTimeout(() => {
        setIsLoading(false);
        setScreenRefresh(false);
      }, 1000);
      if (response.code == 200) {
        setViewMoreData((prev: any) =>
          pageAt === 0
            ? response.data.content
            : [...prev, ...response.data.content],
        );

        for (let idArray of response.data.content) {
          IdArrayPlayModeList.push(idArray.id);
        }
        setPlayModeIdList(IdArrayPlayModeList);
        setTotalPage(response.data.totalPages);
      }
    });
  }, []);

  const onEndListReached = () => {
    if (totalPage != pageAt) {
      const currentPage = pageAt + 1;
      setPageAt(currentPage);
      setIsLoading(true);
      fetchLyricsViewMoreApi(currentPage);
    }
  };

  const onRefreshScreen = useCallback(() => {
    setScreenRefresh(true);
  }, []);

  const clickedPlayMode = useCallback(
    (item: any) => {
      props.navigation.push('LyricTextScreen', {
        lyricTextId: item.item.id,
        playModeIdList: playModeIdList,
        currentPlayModeIndex: item.index,
        isComeFromLyricScreen: false,
      });
    },
    [playModeIdList],
  );

  const renderViewMoreItem = useCallback(
    (item: any) => {
      return (
        <PlayModeView
          viewStyle={{
            flexDirection: 'column',
            marginTop: 16,
            flex: 0.5,
            marginRight: 12,
          }}
          item={item}
          imageStyle={{
            backgroundColor: GeneralColor.light_grey,
            width: '100%',
            height: 140,
            borderRadius: 20,
          }}
          clickedPlayMode={() => clickedPlayMode(item)}
        />
      );
    },
    [viewMoreData, playModeIdList],
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
          <Animatable.View
            style={{flexDirection: 'row'}}
            animation={animationForScreen}
            useNativeDriver={true}>
            <TextView
              text={PLAY_MODE_TITLE}
              textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
            />

            <PlayModeButton
              borderWidth={1.5}
              borderRadius={5}
              iconSize={18}
              style={{
                alignSelf: 'center',
                width: 35,
                marginLeft: 6,
                height: 35,
              }}
              clickedPlayLyric={() => {}}
            />
          </Animatable.View>
        </View>
        <FlatList
          numColumns={2}
          data={viewMoreData}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{paddingLeft: 12, marginTop: 12}}
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

export default connector(PlayModeViewMoreScreen);
