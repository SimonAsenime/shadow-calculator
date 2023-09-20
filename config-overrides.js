const webpack = require('webpack');

module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.resolve.fallback = {
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        fs: require.resolve('browserify-fs')
    }

    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ["buffer", "Buffer"],
          }));
    return config;
}