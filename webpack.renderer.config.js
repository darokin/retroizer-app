const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    ui: './src/ui.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
    library: {
      type: 'window'
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  target: 'electron-renderer',
  externals: {
    electron: 'commonjs electron'
  },
  plugins: [
    new (require('webpack')).DefinePlugin({
      'global': 'globalThis',
    })
  ]
};
