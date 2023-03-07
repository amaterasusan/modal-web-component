const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, '/src'), //absolute path to Dir/src
  dist: path.join(__dirname, '/dist'), //absolute path to Dir/dist
  build: path.join(__dirname, '/build'), //absolute path to Dir/build for single bundle
};

const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: 'string-replace-loader',
      options: {
        search: /(\\r\\n|\\n|\\r|\s{2,})/gm,
        replace: '',
      },
    },
    'css-loader',
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

// common config
const config = {
  resolve: {
    extensions: ['.js', '.json'],
  },
  resolveLoader: {
    // own loader
    alias: {
      'remove-extra-spaces': path.resolve(__dirname, 'loaders/remove-extra-spaces.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'remove-extra-spaces',
          },
        ],
      },
    ],
  },
  performance: { hints: false },
};

const configDev = Object.assign({}, config, {
  name: 'configDev',
  entry: {
    main: PATHS.src + '/index.js',
  },
  output: {
    filename: 'modal-win-component.min.js',
    path: PATHS.dist,
  },
  devServer: {
    port: 3000,
    hot: true,
  },
  plugins: [
    new HTMLPlugin({
      template: './index.html',
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: './demo.css', to: 'demo.css' },
        { from: './demo.js', to: 'demo.js' },
        { from: './img', to: 'img' },
        { from: './favicon.ico', to: 'favicon.ico' },
      ],
    }),
  ],
});

const configBuild = Object.assign({}, config, {
  name: 'configBuild',
  entry: {
    main: PATHS.src + '/index.js',
  },
  output: {
    filename: 'modal-win-component.min.js',
    path: PATHS.build,
  },
});

module.exports = [configDev, configBuild];
