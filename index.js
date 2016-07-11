const path = require('path');

const koa = require('koa');
const router = require('koa-router')();
const views = require('koa-views');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');

const app = koa();


/**
 * HTTP body parser
 */
app.use(bodyParser());

/**
 * logger
 */
app.use(require('koa-logger')());


if (process.env.NODE_ENV === 'production') {

  const compress = require('koa-compress');

  /**
   * respone compress
   */
  app.use(compress({
    // filter: function (content_type) {
    //  return /text/i.test(content_type)
    // },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }));

  /**
   * static server
   */
  app.use( serve(path.join(__dirname, '../docs/')) );

} else {

  const webpack = require('webpack');
  const config = require('../webpack-docs.config');
  const compiler = webpack(config);

  app.use(require('koa-webpack-dev-middleware')(compiler, {
    // noInfo: true,
    stats: {
      colors: true
    },
    publicPath: config.output.publicPath
  }));

  app.use(require('koa-webpack-hot-middleware')(compiler));

}

/**
 * 页面视图
 */
app.use(views(path.join(__dirname, '../docs/')));

/**
 * 页面路由
 */
router.get('/', function *() {
  yield this.render('index');
});

router.get('*', function *(){
  yield this.render('index');
});

app.use(router.routes());


app.listen(3000, 'localhost', function () {
  console.log('Listening at http://localhost:3000');
});

