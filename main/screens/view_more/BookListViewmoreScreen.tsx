import React, {useState, useEffect, useCallback, useContext} from 'react';
import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import {ApiFetchService} from '../../service/ApiFetchService';
import {API_URL} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';

export function BookListViewmoreScreen(
  props: RootStackScreenProps<'BookListViewmoreScreen'>,
) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [viewMoreData, setViewMoreData] = useState([]);

  useEffect(() => {
    setCategoryName(props.route.params.categoryName);
    setCategoryId(props.route.params.categoryId);
  }, [props.route.params]);

  useEffect(() => {
    if (categoryId != 0) {
      fetchViewMoreApi();
    }
  }, [categoryId]);

  const fetchViewMoreApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('id', categoryId);
    await ApiFetchService(API_URL + `user/book/category/get-by-id`, formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
    }).then((response: any) => {
      console.log(response);
      if (response.code == 200) {
        setViewMoreData(response.data.content);
      }
    });
  }, [categoryId]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedBookDetail = useCallback((id: number) => {
    props.navigation.navigate('BookDetailScreen', {bookId: id});
  }, []);

  const renderViewMoreItem = useCallback((item: any) => {
    return (
      <TouchableOpacity
        onPress={() => clickedBookDetail(item.item.id)}
        style={{
          flexDirection: 'column',
          marginTop: 12,
          flex: 1,
        }}>
        <Image
          style={{
            backgroundColor: 'grey',
            width: 120,
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
    );
  }, []);

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
          text={categoryName}
          textStyle={{fontSize: 20, fontWeight: 'bold', marginLeft: 16}}
        />
      </View>
      <FlatList
        numColumns={3}
        data={viewMoreData}
        // style={{paddingLeft: 12}}
        renderItem={renderViewMoreItem}
        keyExtractor={(item: any, index: number) => index.toString()}
      />
    </SafeAreaView>
  );
}
