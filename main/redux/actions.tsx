export const BEARER_TOKEN = 'BEARER_TOKEN';
export const PROFILE = 'PROFILE';
export const FAV_BOOK_COUNT = 'FAV_BOOK_COUNT';
export const FAV_LYRIC_COUNT = 'FAV_LYRIC_COUNT';
export const APP_LANG = 'APP_LANGUAGE';
export const APP_THEME = 'APP_THEME';
export interface Profile {
  id: 0;
  username: '';
  email: '';
  bookCollectionId: 0;
  lyricCollectionId: 0;
}
export function setToken(token: any) {
  return {type: BEARER_TOKEN, token};
}

export function setProfile(profile?: Profile) {
  return {type: PROFILE, profile};
}

export function setFavBookCount(count: number) {
  return {type: FAV_BOOK_COUNT, count};
}

export function setFavLyricCount(count: number) {
  return {type: FAV_LYRIC_COUNT, count};
}

export function setAppLanguage(app_language: string) {
  return {type: APP_LANG, app_language};
}

export function setAppTheme(app_theme: string) {
  return {type: APP_THEME, app_theme};
}
