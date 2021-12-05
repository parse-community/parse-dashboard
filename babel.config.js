module.exports = {
  plugins: [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    '@babel/transform-regenerator',
    '@babel/transform-runtime'
  ],
  presets: ['@babel/preset-react', '@babel/preset-env']
};
