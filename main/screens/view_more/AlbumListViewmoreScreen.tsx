import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, FlatList, Image, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ApiFetchService} from '../../service/ApiFetchService';
import {ALBUM_TITLE, API_URL} from '../../config/Constant';
import i18n from '../../language/i18n';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';

export function AlbumListViewmoreScreen(
  props: RootStackScreenProps<'AlbumListViewmoreScreen'>,
) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [viewMoreData, setViewMoreData] = useState([]);
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
    fetchAlbumViewMoreApi();
  }, []);

  const fetchAlbumViewMoreApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('name', 'album');
    await ApiFetchService(API_URL + `user/lyric/home-navigate`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      if (response.code == 200) {
        setViewMoreData(response.data.content);
      }
    });
  }, []);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedAlbum = useCallback((item: any) => {
    props.navigation.navigate('AlbumScreen', {
      albumId: item.item.id,
      albumName: item.item.name,
      albumImage: API_URL + item.item.imgPath,
    });
  }, []);

  const renderViewMoreItem = useCallback((item: any) => {
    return (
      <TouchableOpacity
        onPress={() => clickedAlbum(item)}
        style={{
          flexDirection: 'column',
          marginRight: 12,
          marginBottom: 12,
          flex: 1,
        }}>
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
    );
  }, []);

  return (
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
        <TextView
          text={label.albums}
          textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
        />
      </View>
      <FlatList
        numColumns={2}
        showsVerticalScrollIndicator={false}
        data={viewMoreData}
        style={{paddingLeft: 12, paddingTop: 12}}
        renderItem={renderViewMoreItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}
