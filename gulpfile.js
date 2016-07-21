'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

var DIR_DIST = 'dist/';
var DIR_DIST_CSS = 'dist/css'
var DIR_DIST_FONTS = 'dist/fonts'
var DIR_LIB = 'lib/'

gulp.task('webpack', function() {
	return gulp.src('./src/index.js')
		.pipe(webpack(webpackConfig))
		//输出未压缩JS
    .pipe(gulp.dest(DIR_DIST))
    //压缩JS
    .pipe(uglify())
    //重命名为.min.js
    .pipe(rename({ extname: '.min.js' }))
    //为min.js创建source map文件
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    //输出压缩后的JS
    .pipe(gulp.dest(DIR_DIST));
});

gulp.task('less', function() {
	return gulp.src('./src/less/rt-select.less')
		.pipe(less())
    .pipe(gulp.dest(DIR_DIST_CSS))
    .pipe(minifyCss())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(DIR_DIST_CSS))
});

gulp.task('fonts', function() {
    return gulp.src('./src/fonts/*')
        .pipe(gulp.dest(DIR_DIST_FONTS))
})

gulp.task('babel', function() {
	return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
    .pipe(babel())
    .pipe(gulp.dest(DIR_LIB))
});

gulp.task('clean', function() {
	return gulp.src([DIR_DIST, DIR_LIB], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
  gulp.run('webpack', 'less', 'fonts', 'babel');
});