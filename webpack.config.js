const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production', // Minifies output by default in production mode
  entry: {
    main: './src/main.raw.js', // Your JavaScript entry point
    // styles: './src/styles.raw.css' // Your CSS entry point
  },
  output: {
    filename: '[name].min.js', // Output file for minified JS
    path: path.resolve(__dirname, 'public/dist'), // Output directory
    clean: true, // Clean the dist folder before each build
  },
  module: {
    rules: [
      {
        test: /\.css$/i, // Target .css files
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Use MiniCssExtractPlugin to extract CSS
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].min.css', // Output file for minified CSS
    }),
  ],
  optimization: {
    minimize: true, // Enable minification
    minimizer: [
      new TerserPlugin(), // Minify JavaScript
      new CssMinimizerPlugin(), // Minify CSS
    ],
  },
  watchOptions: {
    ignored: /node_modules/, // Ignore changes in node_modules directory
    aggregateTimeout: 300,   // Delay the rebuild after the first change (in ms)
    poll: 1000,              // Check for changes every second (useful for networked file systems)
  },
};
