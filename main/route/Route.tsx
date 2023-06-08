import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LandingScreen} from '../screens/landing/LandingScreen';
import {BookListViewmoreScreen} from '../screens/view_more/BookListViewmoreScreen';
import {RootStackParamList} from './StackParamsTypes';
import {SignUpScreen} from '../screens/profile/SignUpScreen';
import {AlbumListViewmoreScreen} from '../screens/view_more/AlbumListViewmoreScreen';
import BookDetailScreen from '../screens/books/BookDetailScreen';
import {AuthorListViewmoreScreen} from '../screens/view_more/AuthorListViewmoreScreen';
import {ConnectedProps, connect} from 'react-redux';
import i18n from '../language/i18n';
import PDFView from '../screens/pdf_view/PDFView';
import ImageView from '../screens/image_view/ImageView';
import AlbumScreen from '../screens/album/AlbumScreen';
import AuthorScreen from '../screens/author/AuthorScreen';
import FavouriteBookScreen from '../screens/favourites/FavouriteBookScreen';
import FavouriteLyricScreen from '../screens/favourites/FavouriteLyricScreen';
import LyricListViewmoreScreen from '../screens/view_more/LyricListViewmoreScreen';
import VerifyScreen from '../screens/profile/VerifyScreen';
import ChangePassword from '../screens/profile/ChangePassword';
import {ForgotPassword} from '../screens/profile/ForgotPassword';
import SearchScreen from '../screens/search/SearchScreen';

const mapstateToProps = (state: {app_language: string}) => {
  return {
    app_language: state.app_language,
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
  return {};
};

const connector = connect(mapstateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

const Route = (props: Props) => {
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  const option = {
    headerShown: false,
  };

  React.useEffect(() => {
    if (props.app_language === 'en') {
      i18n.locale = 'en';
    } else {
      i18n.locale = 'mm';
    }
  }, [props.app_language]);

  return (
    <RootStack.Navigator initialRouteName="LandingScreen">
      <RootStack.Screen
        options={option}
        name="LandingScreen"
        component={LandingScreen}
      />
      <RootStack.Screen
        options={option}
        name="BookListViewmoreScreen"
        component={BookListViewmoreScreen}
      />
      <RootStack.Screen
        options={option}
        name="AuthorScreen"
        component={AuthorScreen}
      />
      <RootStack.Screen
        options={option}
        name="AlbumScreen"
        component={AlbumScreen}
      />
      <RootStack.Screen
        options={option}
        name="SignUpScreen"
        component={SignUpScreen}
      />
      <RootStack.Screen
        options={option}
        name="VerifyScreen"
        component={VerifyScreen}
      />
      <RootStack.Screen
        options={option}
        name="LyricListViewmoreScreen"
        component={LyricListViewmoreScreen}
      />
      <RootStack.Screen
        options={option}
        name="AlbumListViewmoreScreen"
        component={AlbumListViewmoreScreen}
      />
      <RootStack.Screen
        options={option}
        name="BookDetailScreen"
        component={BookDetailScreen}
      />

      <RootStack.Screen
        options={option}
        name="ChangePassword"
        component={ChangePassword}
      />

      <RootStack.Screen
        options={option}
        name="ForgotPassword"
        component={ForgotPassword}
      />
      <RootStack.Screen
        options={option}
        name="FavouriteBookScreen"
        component={FavouriteBookScreen}
      />

      <RootStack.Screen
        options={option}
        name="SearchScreen"
        component={SearchScreen}
      />

      <RootStack.Screen
        options={option}
        name="FavouriteLyricScreen"
        component={FavouriteLyricScreen}
      />
      <RootStack.Screen
        options={option}
        name="AuthorListViewmoreScreen"
        component={AuthorListViewmoreScreen}
      />
      <RootStack.Screen options={option} name="PDFView" component={PDFView} />

      <RootStack.Screen
        options={option}
        name="ImageView"
        component={ImageView}
      />
    </RootStack.Navigator>
  );
};

export default connector(Route);
