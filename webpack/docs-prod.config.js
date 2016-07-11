import {extend} from 'lodash';
import baseConfig from './base.config';
import webpack from 'webpack';

baseConfig.plugins.push( 
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }) 
);
baseConfig.plugins.push( 
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

export default extend({}, baseConfig, {
	entry: {
    main: [
      './docs/index'
    ],
    vendor: ['react', 'react-dom']
  }
})