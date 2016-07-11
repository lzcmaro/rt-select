import {extend} from 'lodash';
import path from 'path';
import baseConfig from './base.config';
import webpack from 'webpack';

export default extend({}, baseConfig, {
  output: {
    path: path.resolve('./dist'),
    filename: 'react-bootstrap-datatable.js'
  },
	entry: './src/index',
  externals: [{
    'react': {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  }, {
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    }
  }],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
})