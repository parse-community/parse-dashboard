module.exports = {
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/transform-runtime', { corejs: 3 }],
  ],
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', { corejs: '3.25', useBuiltIns: 'entry' }],
  ],
};
