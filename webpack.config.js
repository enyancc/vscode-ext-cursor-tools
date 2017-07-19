module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    filename: 'dist/extension.js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
  externals: {
    'vscode': 'vscode'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "env",
                {
                  targets: {
                    node: 6
                  },
                  modules: false,
                  loose: true,
                  useBuiltIns: true,
                  debug: true
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
