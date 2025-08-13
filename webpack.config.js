const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/ui.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ui.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
}; 