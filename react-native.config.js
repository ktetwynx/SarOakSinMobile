module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./main/assets/fonts'],
  dependencies: {
    ...(process.env.NO_FLIPPER
      ? {'react-native-flipper': {platforms: {ios: null}}}
      : {}),
  },
};
