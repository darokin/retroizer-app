const webpack = require('webpack');
const config = require('./webpack.config.js');

console.log('Building React UI...');

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed:', err || stats.toString());
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
  console.log(stats.toString({
    chunks: false,
    colors: true
  }));
}); 