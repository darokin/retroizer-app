const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/ui.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ui.bundle.js',
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
  }
}; 