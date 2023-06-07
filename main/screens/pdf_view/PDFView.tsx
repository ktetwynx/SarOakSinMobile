import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {View, TouchableOpacity, TextInput} from 'react-native';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import Pdf from 'react-native-pdf';
import {API_URL} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import {BackButton} from '../../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ConnectedProps, connect} from 'react-redux';
import {setFavBookCount} from '../../redux/actions';
import {ApiFetchService} from '../../service/ApiFetchService';
import i18n from '../../language/i18n';
import Modal from 'react-native-modal';
import {GeneralColor} from '../../utility/Themes';

const mapstateToProps = (state: {
  profile: any;
  token: any;
  fav_book_count: number;
}) => {
  return {
    profile: state.profile,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setFavBookCount: (fav_book_count: number) => {
      dispatch(setFavBookCount(fav_book_count));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> & RootStackScreenProps<'PDFView'>;

function PDFView(props: Props) {
  interface source {
    uri: string;
    cache: boolean;
  }

  const context = useContext(ThemeContext);
  const {theme} = context;
  const [bookUri, setBookUri] = useState<source>({uri: '', cache: true});
  const [bookName, setBookName] = useState<string>('');
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [readPageAt, setReadPageAt] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [goPageNumber, setGoPageNumber] = useState<string>('');
  const [isVisibleModal, setIsVisbleModal] = useState<boolean>(false);

  const pdfRef = useRef<Pdf>(null);

  const [label, setLabel] = React.useState({
    page_number: i18n.t('page_number'),
    go: i18n.t('go'),
    go_to_bookmark_page: i18n.t('go_to_bookmark_page'),
  });

  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setLabel({
        page_number: i18n.t('page_number'),
        go: i18n.t('go'),
        go_to_bookmark_page: i18n.t('go_to_bookmark_page'),
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isVisible) {
      const visibleThread = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(visibleThread);
    }
  }, [isVisible]);

  useEffect(() => {
    setBookUri({uri: API_URL + props.route.params.bookPath, cache: true});
    setBookName(props.route.params.bookName);
    setTotalPage(props.route.params.totalPage);
    setIsFavourite(props.route.params.isFavourite);
    setReadPageAt(props.route.params.readPageAt);
  }, [props.route.params]);

  useEffect(() => {
    if (props.route.params.readPageAt != -1) {
      setTimeout(() => {
        pdfRef.current?.setPage(props.route.params.readPageAt);
      }, 500);
    }
  }, [props.route.params.readPageAt]);

  const fetchSaveBookApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', props.route.params.bookId);
    formData.append('bookListId', props.profile.bookCollectionId);
    formData.append('userId', props.profile.id);
    await ApiFetchService(
      API_URL + 'user/register-user/add-book-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${props.token}`,
      },
    ).then((response: any) => {
      props.setFavBookCount(response.data);
      setIsFavourite(true);
    });
  }, [props.route.params.bookId, props.profile?.id, props.token]);

  const fetchRemoveBookApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', props.route.params.bookId);
    formData.append('bookListId', props.profile.bookCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/remove-book-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      },
    ).then((response: any) => {
      props.setFavBookCount(response.data);
      setIsFavourite(false);
    });
  }, [props.route.params.bookId, props.profile?.id, props.token]);

  const fetchSaveBookmarkApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('id', props.route.params.bookId);
    if (currentPage == readPageAt) {
      formData.append('pageNumber', -1);
    } else {
      formData.append('pageNumber', currentPage);
    }
    formData.append('userId', props.profile?.id);
    await ApiFetchService(API_URL + 'user/book/book-mark/save', formData, {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + props.token,
    }).then((response: any) => {
      if (response.code == 200) {
        if (currentPage == readPageAt) {
          setReadPageAt(-1);
        } else {
          setReadPageAt(currentPage);
        }
      }
    });
  }, [props.route.params.bookId, currentPage, props.profile?.id, readPageAt]);

  const clickedBookmark = useCallback(() => {
    fetchSaveBookmarkApi();
  }, [currentPage, readPageAt]);

  const clickedGo = useCallback(() => {
    if (totalPage >= parseFloat(goPageNumber) && parseFloat(goPageNumber) > 0) {
      pdfRef.current?.setPage(parseFloat(goPageNumber));
    }
  }, [goPageNumber, totalPage]);

  const clickedGoBookmarkPage = useCallback(() => {
    pdfRef.current?.setPage(readPageAt);
    setIsVisbleModal(false);
  }, [readPageAt]);

  const renderProgressBar = useCallback(() => {
    return (
      <View style={{flexDirection: 'column'}}>
        <TextView
          text={progress.toString() + '%'}
          textStyle={{
            fontSize: 18,
            alignSelf: 'center',
            marginBottom: 6,
          }}
        />
        <View
          style={{
            width: 200,
            height: 20,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: theme.backgroundColor2,
          }}>
          <View
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 50,
              backgroundColor: theme.backgroundColor2,
            }}
          />
        </View>
      </View>
    );
  }, [progress]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const clickedPageNumber = useCallback(() => {
    setIsVisbleModal(true);
  }, []);

  const clickedFavourite = useCallback(() => {
    if (isFavourite) {
      fetchRemoveBookApi();
    } else {
      fetchSaveBookApi();
    }
  }, [isFavourite]);

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        backgroundColor: theme.backgroundColor,
      }}>
      <Pdf
        ref={pdfRef}
        source={bookUri}
        horizontal={true}
        enablePaging={true}
        trustAllCerts={false}
        renderActivityIndicator={renderProgressBar}
        onPageSingleTap={() => {
          if (isVisible) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
        }}
        onLoadProgress={(percent: number) => {
          setProgress(Math.floor(percent * 100));
        }}
        onLoadComplete={(numberOfPages: any, filePath: any) => {
          // console.log(`Number of pages: ${numberOfPages}`);
          setIsVisible(true);
        }}
        onPageChanged={(page: any, numberOfPages: any) => {
          // console.log(`Current page: ${page}`);
          setCurrentPage(page);
        }}
        onError={(error: any) => {
          console.log(error);
        }}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          backgroundColor: theme.backgroundColor,
        }}
      />
      {isVisible ? (
        <View
          style={{
            width: '100%',
            height: 100,
            flexDirection: 'column',
            position: 'absolute',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.8,
              position: 'absolute',
              backgroundColor: theme.backgroundColor1,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 12,
                flex: 2,
              }}>
              <BackButton
                style={{
                  alignSelf: 'flex-start',
                }}
                clickedGoBack={goBack}
              />
              <TextView
                numberOfLines={1}
                text={bookName}
                textStyle={{
                  fontSize: 18,
                  marginLeft: 12,
                  fontWeight: 'bold',
                  marginRight: 12,
                  flex: 1,
                }}
              />
            </View>

            {props.token ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 12,
                  flex: 0.5,
                }}>
                <TouchableOpacity onPress={clickedFavourite}>
                  <AntDesign
                    name={isFavourite ? 'heart' : 'hearto'}
                    size={26}
                    color={isFavourite ? 'red' : theme.backgroundColor2}
                    style={{marginRight: 20}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={clickedBookmark}>
                  <Ionicons
                    name={
                      currentPage == readPageAt
                        ? 'bookmark'
                        : 'bookmark-outline'
                    }
                    size={30}
                    color={
                      currentPage == readPageAt
                        ? 'green'
                        : theme.backgroundColor2
                    }
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
      ) : (
        <></>
      )}

      {isVisible ? (
        <View
          style={{
            width: '100%',
            height: 100,
            bottom: 0,
            flexDirection: 'column',
            position: 'absolute',
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.8,
              position: 'absolute',
              backgroundColor: theme.backgroundColor1,
            }}
          />
          <TextView
            textStyle={{fontSize: 16, marginTop: 12, alignSelf: 'center'}}
            text={`${currentPage}/${totalPage}`}
          />

          <TouchableOpacity
            onPress={clickedPageNumber}
            style={{
              backgroundColor: theme.backgroundColor2,
              position: 'absolute',
              top: 12,
              right: 12,
              flexDirection: 'row',
              paddingHorizontal: 8,
              paddingVertical: 3,
              alignItems: 'center',
              borderRadius: 20,
            }}>
            <TextView
              text={label.page_number}
              textStyle={{
                fontSize: 16,
                color: theme.backgroundColor1,
              }}
            />
            <AntDesign
              name={'rightcircleo'}
              size={16}
              color={theme.backgroundColor1}
              style={{marginLeft: 6}}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
      <Modal
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        hasBackdrop={true}
        onBackdropPress={() => {
          setIsVisbleModal(false);
        }}
        isVisible={isVisibleModal}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: theme.backgroundColor,
              width: '80%',
              padding: 12,
              borderRadius: 15,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextView
                text={`${label.page_number}:`}
                textStyle={{fontSize: 16}}
              />

              <TextInput
                keyboardType="number-pad"
                onChangeText={(text: string) => setGoPageNumber(text)}
                style={{
                  width: 40,
                  backgroundColor: theme.backgroundColor3,
                  marginLeft: 10,
                  borderRadius: 6,
                  paddingVertical: 3,
                  paddingLeft: 3,
                  color: theme.textColor,
                }}
              />
              <TextView
                textStyle={{fontSize: 16, marginLeft: 3}}
                text={`/${totalPage}`}
              />

              <TouchableOpacity
                onPress={clickedGo}
                style={{
                  backgroundColor: theme.backgroundColor2,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  position: 'absolute',
                  right: 0,
                }}>
                <TextView
                  text={label.go}
                  textStyle={{fontSize: 14, color: theme.backgroundColor1}}
                />
              </TouchableOpacity>
            </View>
            {readPageAt == -1 ? (
              <></>
            ) : (
              <TouchableOpacity
                onPress={clickedGoBookmarkPage}
                style={{
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Ionicons
                  style={{marginRight: 3}}
                  name="bookmark"
                  size={16}
                  color={GeneralColor.blue}
                />
                <TextView
                  text={label.go_to_bookmark_page}
                  textStyle={{
                    fontSize: 14,
                    textDecorationLine: 'underline',
                    color: GeneralColor.blue,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default connector(PDFView);
