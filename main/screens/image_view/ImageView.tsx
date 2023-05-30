import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {RootStackScreenProps} from '../../route/StackParamsTypes';
import ImageViewer from 'react-native-image-zoom-viewer';
import {API_URL} from '../../config/Constant';
import {TextView} from '../../components/TextView';
import {ThemeContext} from '../../utility/ThemeProvider';
import {BackButton} from '../../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ConnectedProps, connect} from 'react-redux';
import {setFavBookCount, setFavLyricCount} from '../../redux/actions';
import {ApiFetchService} from '../../service/ApiFetchService';
import i18n from '../../language/i18n';
import Modal from 'react-native-modal';
import {GeneralColor} from '../../utility/Themes';
import {TouchableOpacity, View} from 'react-native';

const mapstateToProps = (state: {profile: any; token: any}) => {
  return {
    profile: state.profile,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {
    setFavLyricCount: (fav_lyric_count: number) => {
      dispatch(setFavLyricCount(fav_lyric_count));
    },
  };
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> &
  RootStackScreenProps<'ImageView'>;

function ImageView(props: Props) {
  const context = useContext(ThemeContext);
  const {theme} = context;
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [lyricsImages, setLyricsImages] = useState<any>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    setLyricsImages(props.route.params.lyricsImages);
    setCurrentImageIndex(props.route.params.currentImageIndex);
    initialCheckFav();
  }, [props.route.params]);

  const initialCheckFav = useCallback(() => {
    let data: any =
      props.route.params.lyricsImages[props.route.params.currentImageIndex];
    if (data.isSaved) {
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }
  }, []);

  const fetchSaveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricsImages[currentImageIndex].lyricsId);
    formData.append('bookListId', props.profile.lyricCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/add-lyric-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${props.token}`,
      },
    ).then((response: any) => {
      if (response.code == 200) {
        props.setFavLyricCount(response.data);
        lyricsImages[currentImageIndex].isSaved = true;
        setIsFavourite(true);
      }
    });
  }, [props.profile, lyricsImages, currentImageIndex]);

  const fetchRemoveLyricsApi = useCallback(async () => {
    let formData = new FormData();
    formData.append('bookId', lyricsImages[currentImageIndex].lyricsId);
    formData.append('bookListId', props.profile.lyricCollectionId);
    formData.append('userId', props.profile?.id);
    await ApiFetchService(
      API_URL + 'user/register-user/remove-lyric-collection',
      formData,
      {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + props.token,
      },
    ).then((response: any) => {
      if (response.code == 200) {
        props.setFavLyricCount(response.data);
        lyricsImages[currentImageIndex].isSaved = false;
        setIsFavourite(false);
      }
    });
  }, [props.profile, lyricsImages, currentImageIndex]);

  const goBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  const changeImages = useCallback(
    (index?: number) => {
      setCurrentImageIndex(index ? index : 0);
      if (lyricsImages[index ? index : 0].isSaved) {
        setIsFavourite(true);
      } else {
        setIsFavourite(false);
      }
    },
    [lyricsImages],
  );

  const clickedFavourite = useCallback(() => {
    if (isFavourite) {
      fetchRemoveLyricsApi();
    } else {
      fetchSaveLyricsApi();
    }
  }, [isFavourite, props.profile, lyricsImages, currentImageIndex]);

  return (
    <View style={{flex: 1}}>
      <ImageViewer
        style={{
          backgroundColor: theme.backgroundColor,
          width: '100%',
          height: '100%',
        }}
        onSwipeDown={() => {
          goBack();
        }}
        onChange={(index?: number) => changeImages(index)}
        enableImageZoom={true}
        enableSwipeDown={true}
        index={props.route.params.currentImageIndex}
        imageUrls={props.route.params.lyricsImages}
        useNativeDriver={true}
      />

      <View
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
        }}>
        <TouchableOpacity
          style={{justifyContent: 'center', alignItems: 'center'}}
          onPress={goBack}>
          <View
            style={{
              width: 45,
              height: 45,
              backgroundColor: 'black',
              opacity: 0.6,
              position: 'absolute',
              borderRadius: 45,
            }}
          />
          <Ionicons
            name="ios-arrow-back-circle-sharp"
            size={38}
            style={{marginLeft: 2}}
            color={GeneralColor.white}
          />
        </TouchableOpacity>
      </View>
      {props.token ? (
        <View
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
          }}>
          <TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center'}}
            onPress={clickedFavourite}>
            <View
              style={{
                width: 45,
                height: 45,
                backgroundColor: 'black',
                opacity: 0.6,
                position: 'absolute',
                borderRadius: 45,
              }}
            />
            <AntDesign
              name={isFavourite ? 'heart' : 'hearto'}
              size={30}
              color={isFavourite ? 'red' : GeneralColor.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}

export default connector(ImageView);
