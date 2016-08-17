/**
 *  npm install gulp -g
 *  npm install --save-dev gulp-babel
 *  npm install --save-dev babel-preset-es2015
 *  npm install browser-sync gulp-compass gulp-sass gulp-rename gulp-jshint gulp-uglify gulp-concat gulp-imagemin gulp-cache gulp-connect gulp-minify-css gulp-sourcemaps gulp-notify gulp-livereload gulp-clean gulp-load-plugins gulp-rev-append gulp-make-css-url-version --save-dev
 *  var gulp = require('gulp'),　　　　　　　　　　　　　
        compass = require('gulp-compass'),          // compass编译Sass, 生成雪碧图
        sass = require('gulp-sass'),                // sass编译
        sourcemaps = require('gulp-sourcemaps'),    // sass地图
        rename = require('gulp-rename'),            // 重命名文件
        jshint = require('gulp-jshint'),            // JS语法检测
        uglify = require('gulp-uglify'),            // JS丑化
        concat = require('gulp-concat'),            // JS拼接
        imagemin = require('gulp-imagemin'),        // 图片压缩
        cache = require('gulp-cache'),              // 缓存通知
        connect = require('gulp-connect'),          // web服务
        minifycss = require('gulp-minify-css'),     // 压缩CSS
        cssver = require('gulp-make-css-url-version'),    // css文件引用URL加版本号
        clean = require('gulp-clean'),              // 清空文件夹
        notify = require('gulp-notify'),            // 更新通知
        rev = require('gulp-rev-append'),           // html添加版本号
        browserSync = require('browser-sync'),      // 浏览器同步
        reload = browserSync.reload;                // 自动刷新
 */
var gulp = require('gulp');
var babel = require("gulp-babel");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-ruby-sass');
var cssmin = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task("babel", function() {
    return gulp.src("xboss_web/js/EmailInput.jsx")
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest("xboss_web/js"));
});

gulp.task('imagemin', function() {
    gulp.src('xboss_web/images/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('xboss_web/dist/images'))
});

gulp.task('sass', function() {
    return sass('xboss_web/scss/wxbase.scss')
        .pipe(gulp.dest('xboss_web/css'))
        .pipe(cssmin())
        .pipe(gulp.dest('xboss_web/css'))
        .pipe(reload({ stream: true }));
});

/*
gulp.task('sass', function () {
    return gulp.src('xboss_web/scss/wxbase.scss')
        .pipe(sass({sourcemap: true, sourcemapPath: '../scss'}))
        .pipe(gulp.dest('xboss_web/css'));
});*/

gulp.task('jsmin', function() {
    gulp.src('xboss_web/js/util.js')
        .pipe(uglify())
        .pipe(rename('util.min.js'))
        .pipe(gulp.dest('xboss_web/js'));
});

// 监视文件改动并重新载入
// 监视 Sass 文件的改动，如果发生变更，运行 'sass' 任务，并且重载文件
gulp.task('serve', ['sass'], function() {
    browserSync({
        server: {
            baseDir: 'xboss_web'
        }
    });

    gulp.watch(['*.html', 'css/*.css', 'js/*.js'], { cwd: 'xboss_web' }, reload);
    gulp.watch('xboss_web/js/*.js', ['jsmin']);
    gulp.watch('xboss_web/scss/*.scss', ['sass']);
});
