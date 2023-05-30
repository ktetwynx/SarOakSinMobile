import React, {createContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';
import {DarkThemeColor, LightThemeColor} from './Themes';
import {setAppTheme} from '../redux/actions';

export const ThemeContext = createContext();
const DEFAULT_THEME = LightThemeColor;
const ThemeProvider = props => {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    if (props.app_theme == 'dark') {
      setTheme(DarkThemeColor);
    } else {
      setTheme(LightThemeColor);
    }
  }, [props.app_theme]);

  const updateTheme = async currentTheme => {
    if (currentTheme === 'dark') {
      setTheme(DarkThemeColor);
    } else {
      setTheme(LightThemeColor);
    }
    props.setAppTheme(currentTheme);
  };

  return (
    <ThemeContext.Provider value={{theme, updateTheme}}>
      {props.children}
    </ThemeContext.Provider>
  );
};

const mapStateToProps = state => ({
  app_theme: state.app_theme,
});

const mapDispatchToProps = dispatch => {
  return {
    setAppTheme: app_theme => {
      dispatch(setAppTheme(app_theme));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ThemeProvider);
