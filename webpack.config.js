const ForkTsCheckerWebpackPlugin = require( 'fork-ts-checker-webpack-plugin' );
const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = ( env, argv ) => {
  const mode = argv.mode;
  const isProd = mode === 'production';

  const banner = isProd
    ? '(c) 2019 FMS_Cat - https://github.com/FMS-Cat/experimental/blob/master/LICENSE'
    : `@fms-cat/experimental v${ require( './package.json' ).version }
    Experimental edition of FMS_Cat

Copyright (c) FMS_Cat
@fms-cat/experimental is distributed under the MIT License
https://github.com/FMS-Cat/experimental/blob/master/LICENSE`;

  return {
    mode: mode,
    entry: path.resolve( __dirname, 'src', 'index.ts' ),
    output: {
      path: path.resolve( __dirname, 'dist' ),
      filename: isProd ? 'fms-cat-experimental.js' : 'fms-cat-experimental.dev.js',
      library: 'FMS_CAT_EXPERIMENTAL',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.(frag|vert)$/,
          use: 'raw-loader',
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: 'url-loader',
        },
      ],
    },
    resolve: {
      extensions: [ '.js', '.ts' ],
      modules: [ 'node_modules' ],
    },
    devServer: {
      port: 3000,
      contentBase: path.resolve( __dirname, './' ),
      publicPath: '/dist/',
      openPage: 'examples/index.html',
      watchContentBase: true,
      inline: true,
    },
    plugins: [
      new webpack.BannerPlugin( banner ),
      new webpack.DefinePlugin( { 'process.env': { NODE_ENV: mode } } ),
      ...( isProd ? [] : [ new ForkTsCheckerWebpackPlugin( { checkSyntacticErrors: true } ) ] ),
    ],
    devtool: isProd ? false : 'inline-source-map',
  };
};
