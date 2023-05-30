import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {FlatList} from 'react-native-gesture-handler';
import {API_URL, LYRICS_TITLE} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {ThemeContext} from '../../utility/ThemeProvider';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ConnectedProps, connect} from 'react-redux';

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
  RootStackScreenProps<'AlbumScreen'>;

function AlbumScreen(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [albumId, setAlbumId] = useState<number>(0);
  const [albumName, setAlbumName] = useState<string>('');
  const [albumImg, setAlbumImg] = useState<string>('-');
  const [lyricsList, setLyricsList] = useState([]);
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
    setAlbumId(props.route.params.albumId);
    setAlbumName(props.route.params.albumName);
    setAlbumImg(props.route.params.albumImage);
  }, [props.route.params]);

  useEffect(() => {
    if (albumId != 0) {
      fetchAblumApi();
    }
  }, [albumId]);

  const fetchAblumApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('id', albumId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(API_URL + `user/lyric/album/get-by-id`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      if (response.code == 200) {
        setLyricsList(response.data.content);
        console.log(response.data.content);
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
  }, [albumId, props.profile?.id]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const renderLyricsItem = useCallback(
    (item: any) => {
      return (
        <TouchableOpacity
          onPress={() => clickedLyric(item)}
          style={{flexDirection: 'column', flex: 1, marginRight: 12}}>
          <Image
            source={{
              uri: API_URL + item.item.imgPath,
            }}
            style={{
              height: 250,
              borderRadius: 20,
              backgroundColor: 'grey',
              width: '100%',
            }}
          />
          <TextView
            text={item.item.name}
            textStyle={{fontSize: 16, alignSelf: 'center', marginTop: 10}}
          />
        </TouchableOpacity>
      );
    },
    [lyricsList, lyricsImages],
  );

  const clickedLyric = useCallback(
    (item: any) => {
      props.navigation.navigate('ImageView', {
        currentImageIndex: item.index,
        lyricsImages: lyricsImages,
      });
    },
    [lyricsImages],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.backgroundColor,
      }}>
      <BackButton
        style={{alignSelf: 'flex-start', marginLeft: 16, marginTop: 10}}
        clickedGoBack={goBack}
      />
      <View
        style={{
          flexDirection: 'row',
          marginTop: -5,
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Image
          source={{uri: API_URL + albumImg}}
          style={{
            width: 150,
            height: 100,
            backgroundColor: 'grey',
            marginRight: 16,
            borderRadius: 20,
          }}
        />
        <TextView
          text={albumName}
          numberOfLines={1}
          textStyle={{fontSize: 22, fontWeight: 'bold'}}
        />
      </View>

      <TextView
        text={label.lyrics}
        textStyle={{fontSize: 18, marginTop: 12, marginLeft: 16}}
      />

      <FlatList
        data={lyricsList}
        numColumns={2}
        style={{paddingLeft: 12, paddingTop: 10}}
        renderItem={renderLyricsItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}

export default connector(AlbumScreen);
