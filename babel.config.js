module.exports = function (api) {
  api.cache(true);
  const plugins = ['nativewind/babel'];

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.EXPO_PUBLIC_APP_ENV === 'production';

  if (isProduction) {
    try {
      require.resolve('babel-plugin-transform-remove-console');
      plugins.push('transform-remove-console');
    } catch {
      // 플러그인이 설치되지 않은 경우 무시
    }
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};

