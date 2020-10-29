import webpack from 'webpack'
import uglify from 'uglifyjs-webpack-plugin'
import htmlPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { PORT, BUILD_DIR, NAME_SPACE, SDK_EXE, THIRD_PARTY } from './constants'
import { resolvePath as resolve } from './path'
const isDev = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'
const isPrd = !isDev && !isTest
let define = isDev
  ? require('../env.development.js')
  : isTest
  ? require('../env.test.js')
  : require('../env.production.js')
const prdVersion = process.env.BUILD_VERSION || ''
const staticAssetName = isDev ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]'

const thirdPartyJS = THIRD_PARTY
const getCssLoader = () => {
  return {
    loader: 'css-loader',
    options: {
      sourceMap: !isPrd
    }
  }
}
const cssLoader = getCssLoader()

const entry = {}
entry[`${NAME_SPACE.toLowerCase()}${isPrd && prdVersion ? '-' + prdVersion : ''}`] = './src/index.js'
entry[`${NAME_SPACE.toLowerCase()}-latest`] = './src/index.js'

const options = {
  entry,
  mode: isPrd ? 'production' : 'development',
  output: {
    path: BUILD_DIR,
    filename: '[name].min.js',
    library: NAME_SPACE,
    libraryTarget: 'window',
    libraryExport: 'default'
  },
  devtool: !isPrd ? 'source-map' : 'none',
  resolve: {
    alias: {
      '@': resolve('src'),
      utils: resolve('src/utils'),
      config: resolve('src/config'),
      comp: resolve('src/component'),
      api: resolve('src/api')
    }
  },

  devServer: {
    contentBase: BUILD_DIR,
    disableHostCheck: true,
    compress: true,
    port: PORT,
    host: '0.0.0.0'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', cssLoader, 'postcss-loader']
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', cssLoader, 'postcss-loader', 'less-loader']
      },
      {
        test: /[\\/]?template[\\/].*[\s\S]+\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: isPrd,
              removeComments: isPrd,
              collapseWhitespace: isPrd
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: staticAssetName,
            limit: 4096
          }
        }
      }
    ]
  },
  plugins: [
    new htmlPlugin({
      hash: true,
      filename: 'index.html',
      template: './src/index.ejs',
      inject: 'head',
      files: {
        js: thirdPartyJS
      },
      SDKExec: SDK_EXE
    }),
    new htmlPlugin({
      hash: true,
      filename: 'test.html',
      template: './src/test.ejs',
      inject: 'head',
      files: {
        js: thirdPartyJS
      },
      SDKExec: SDK_EXE
    }),
    new webpack.DefinePlugin({
      __DEV__: isDev,
      __TEST__: isTest,
      __PRD__: isPrd,
      'process.env': define
    }),
    new CopyWebpackPlugin([
      {
        from: resolve('./public'),
        to: BUILD_DIR,
        ignore: ['*.md']
      }
    ])
  ]
}

if (isPrd) {
  const prodPlugins = [
    new uglify({
      uglifyOptions: {
        compress: {
          drop_console: true
        },
        output: {
          comments: false,
          beautify: false
        }
      }
    })
  ]
  options.plugins.push(...prodPlugins)
}

export default options
