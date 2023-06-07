import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import i18n from '../../language/i18n';
import {ThemeContext} from '../../utility/ThemeProvider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackButton} from '../../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GeneralColor} from '../../utility/Themes';
import {TextView} from '../../components/TextView';

export function SearchScreen(props: RootStackScreenProps<'SearchScreen'>) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [searchType, setSearchType] = useState<number>(0);
  const [bookFilterIndex, setBookFilterIndex] = useState<number>(0);
  const [lyricFilterIndex, setLyricFilterIndex] = useState<number>(0);
  const [label, setLabel] = useState({
    search_lyric_text: i18n.t('search_lyric_text'),
    search_book_text: i18n.t('search_book_text'),
    author: i18n.t('author'),
    singer: i18n.t('singer'),
    book: i18n.t('book'),
    lyric: i18n.t('lyric'),
    album: i18n.t('album'),
  });

  const bookFilterArray = [label.book, label.author];
  const lyricFilterArray = [label.lyric, label.album, label.singer];

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        search_lyric_text: i18n.t('search_lyric_text'),
        search_book_text: i18n.t('search_book_text'),
        author: i18n.t('author'),
        singer: i18n.t('singer'),
        book: i18n.t('book'),
        lyric: i18n.t('lyric'),
        album: i18n.t('album'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setSearchType(props.route.params.searchType);
  }, [props.route.params.searchType]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedSearch = useCallback(() => {}, []);

  const clickedBookFilter = useCallback((index: number) => {
    setBookFilterIndex(index);
  }, []);

  const clickedLyricFilter = useCallback((index: number) => {
    setLyricFilterIndex(index);
  }, []);

  return (
    <View>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}
        edges={['top']}>
        <View style={{width: '100%', height: '100%'}}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: 6,
              alignItems: 'center',
            }}>
            <BackButton clickedGoBack={goBack} style={{marginLeft: 12}} />

            <View
              style={{
                marginRight: 16,
                marginLeft: 6,
                height: 45,
                flex: 1,
                backgroundColor: theme.backgroundColor3,
                flexDirection: 'row',
                borderRadius: 40,
                alignItems: 'center',
                // borderWidth: 1,
                // borderColor: theme.backgroundColor2,
              }}>
              <TextInput
                // value={props.value}
                // onChangeText={text => props.onChangeText(text)}
                autoFocus={true}
                placeholder={
                  searchType == 1
                    ? label.search_book_text
                    : label.search_lyric_text
                }
                placeholderTextColor={GeneralColor.grey}
                style={{
                  width: '100%',
                  height: '100%',
                  flex: 1,
                  paddingLeft: 16,
                  color: theme.textColor,
                }}
              />

              <TouchableOpacity
                onPress={clickedSearch}
                style={{width: 50, justifyContent: 'center'}}>
                <Ionicons
                  name="search-circle"
                  size={40}
                  color={theme.textColor}
                  style={{alignSelf: 'center', marginRight: 6}}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 10,
              justifyContent: 'center',
            }}>
            {searchType == 1
              ? bookFilterArray.map((title: string, index: number) => {
                  return (
                    <TouchableOpacity
                      onPress={() => clickedBookFilter(index)}
                      key={index}
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.backgroundColor2,
                        paddingVertical: 1,
                        paddingHorizontal: 6,
                        marginHorizontal: 6,
                        backgroundColor:
                          bookFilterIndex === index
                            ? theme.backgroundColor2
                            : theme.backgroundColor,
                      }}>
                      <TextView
                        textStyle={{
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          color:
                            bookFilterIndex === index
                              ? theme.backgroundColor1
                              : theme.textColor,
                        }}
                        text={title}
                      />
                    </TouchableOpacity>
                  );
                })
              : lyricFilterArray.map((title: string, index: number) => {
                  return (
                    <TouchableOpacity
                      onPress={() => clickedLyricFilter(index)}
                      key={index}
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.backgroundColor2,
                        paddingVertical: 1,
                        paddingHorizontal: 6,
                        marginHorizontal: 6,
                        backgroundColor:
                          lyricFilterIndex === index
                            ? theme.backgroundColor2
                            : theme.backgroundColor,
                      }}>
                      <TextView
                        textStyle={{
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          color:
                            lyricFilterIndex === index
                              ? theme.backgroundColor1
                              : theme.textColor,
                        }}
                        text={title}
                      />
                    </TouchableOpacity>
                  );
                })}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
