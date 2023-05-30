import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, FlatList, Image, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL, LYRICS_TITLE} from '../../config/Constant';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ConnectedProps, connect} from 'react-redux';

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
    fetchLyricsViewMoreApi();
  }, []);

  const fetchLyricsViewMoreApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('name', 'lyric');
    formData.append('userId', props.profile?.id);
    await ApiFetchService(API_URL + `user/lyric/home-navigate`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      if (response.code == 200) {
        setViewMoreData(response.data.content);
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
  }, [props.profile?.id]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

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
        <TouchableOpacity
          onPress={() => clickedLyric(item)}
          style={{
            flexDirection: 'column',
            marginTop: 12,
            flex: 1,
            marginRight: 12,
          }}>
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
      );
    },
    [lyricsImages],
  );

  return (
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
        <TextView
          text={label.lyrics}
          textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
        />
      </View>
      <FlatList
        numColumns={2}
        data={viewMoreData}
        style={{paddingLeft: 12}}
        renderItem={renderViewMoreItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}

export default connector(LyricListViewmoreScreen);
