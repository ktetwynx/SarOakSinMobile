import {
  APP_LANG,
  APP_THEME,
  BEARER_TOKEN,
  FAV_BOOK_COUNT,
  FAV_LYRIC_COUNT,
  PROFILE,
} from './actions';

const initialState = {
  token: null,
  app_language: 'en',
  app_theme: 'light',
};

export function App(state = initialState, action: any) {
  switch (action.type) {
    case BEARER_TOKEN:
      return Object.assign({}, state, {token: action.token});
    case PROFILE:
      return Object.assign({}, state, {profile: action.profile});
    case FAV_BOOK_COUNT:
      return Object.assign({}, state, {fav_book_count: action.count});
    case FAV_LYRIC_COUNT:
      return Object.assign({}, state, {fav_lyric_count: action.count});
    case APP_LANG:
      return Object.assign({}, state, {app_language: action.app_language});
    case APP_THEME:
      return Object.assign({}, state, {app_theme: action.app_theme});
    default:
      return state;
  }
}
