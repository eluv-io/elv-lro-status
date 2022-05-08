const path = require('path')
const webpack = require('webpack')

module.exports = function (env) {
  const config = {
    mode: 'production',
    entry: './build/main.js',
    optimization: {
      usedExports: true,
    },
    output: {
      filename: 'elv-lro-status.js',
      path: path.resolve(__dirname, 'build', 'dist'),
      library: {
        name: 'ElvLROStatus',
        type: 'var',
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    ],
  }
  if(env.analyze) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    config.plugins.push(new BundleAnalyzerPlugin())
  }
  return config
}
