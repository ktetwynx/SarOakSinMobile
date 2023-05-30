import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, FlatList, Image, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {API_URL, BOOKS_AUTHOR_TITLE, SINGER_TITLE} from '../../config/Constant';
import {ApiFetchService} from '../../service/ApiFetchService';
import {ThemeContext} from '../../utility/ThemeProvider';
import {TextView} from '../../components/TextView';
import i18n from '../../language/i18n';

export function AuthorListViewmoreScreen(
  props: RootStackScreenProps<'AuthorListViewmoreScreen'>,
) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [viewMoreAuthorData, setViewmoreAuthorData] = useState();
  const [label, setLabel] = React.useState({
    authors: i18n.t('authors'),
    singers: i18n.t('singers'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        authors: i18n.t('authors'),
        singers: i18n.t('singers'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchViewmoreSingerList();
  }, [props.route.params.authorType]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const fetchViewmoreSingerList = useCallback(async () => {
    let formData = new FormData();
    if (props.route.params.authorType == 1) {
      formData.append('name', 'authorBook');
    } else if (props.route.params.authorType == 2) {
      formData.append('name', 'author');
    }
    console.log(formData);
    await ApiFetchService(API_URL + `user/lyric/home-navigate`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      if (response.code == 200) {
        setViewmoreAuthorData(response.data?.content);
      }
    });
  }, []);

  const clickedSinger = useCallback((item: any) => {
    props.navigation.navigate('AuthorScreen', {
      authorId: item.item.id,
      authorName: item.item.name,
      authorType: item.item.authorType,
      authorImage: item.item.profile,
    });
  }, []);

  const renderAuthorItem = useCallback(
    (item: any) => {
      return (
        <TouchableOpacity
          onPress={() => clickedSinger(item)}
          style={{
            flexDirection: 'column',
            flex: 0.3333,
            alignItems: 'center',
            marginTop: 22,
          }}>
          <Image
            source={{uri: API_URL + item.item.profile}}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'grey',
            }}
          />
          <TextView
            text={item.item?.name}
            numberOfLines={1}
            textStyle={{
              alignSelf: 'center',
              marginTop: 8,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          />
        </TouchableOpacity>
      );
    },
    [viewMoreAuthorData],
  );

  return (
    <SafeAreaView
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.backgroundColor,
      }}
      edges={['top']}>
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
          text={
            props.route.params.authorType == 1 ? label.authors : label.singers
          }
          textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
        />
      </View>
      <FlatList
        data={viewMoreAuthorData}
        numColumns={3}
        renderItem={renderAuthorItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}
