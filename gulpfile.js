const {src, dest, watch, series, parallel} = require("gulp");
const browserSync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const sass = require('gulp-sass')(require('sass'));
const concat = require("gulp-concat");
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');

let dev = 'src',
    pub = 'public',
    preprocessor = "sass";

let paths = {
    html: {
        src: dev + '/html/**/*.html',
        dest: pub,
    },

    style: {
        src: dev + '/css/style.*',
        dest: pub + '/css',
    },

    images: {
      src: dev + '/img-origin/**/*.*',
      dest: pub + '/img',
    },

    js: {
      src: dev + '/js/**/*.*',
      dest: pub + '/js/',
    },
  
    cssOutputName: 'style.css', 
  }

  const server = () => {
    browserSync.init({
      server: {
        baseDir: pub
      },
      port: 4000
      
    })
  }

  const clear = () => {
    return del(['public/**', '!public']);
  }

  const html = () => {
    return src(paths.html.src)
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream())
  }

  const styles = () => {
      return src(paths.style.src)
      .pipe(eval(preprocessor)())
      .pipe(concat(paths.cssOutputName))
      .pipe(autoprefixer({
        cascade: false,
        overrideBrowserslist: ['last 10 versions']
      }))
      .pipe(cleanCss())
      .pipe(dest(paths.style.dest))
      .pipe(browserSync.stream())
  }

  const images = () => {
    return src(paths.images.src)
    .pipe(imagemin())
    .pipe(dest(paths.images.dest))
  }

  const js = () => {
    return src(paths.js.src)
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(dest(paths.js.dest))
  }

  const watches = () => {
    watch(dev + "/html/**/*.html", html).on('change', browserSync.reload);
    watch(dev + "/css/**/*", styles).on('change', browserSync.reload);
    watch(dev + "/img-origin/**/*.*", images).on('change', browserSync.reload);
    watch(dev + "/js/**/*.js", js).on('change', browserSync.reload);
  }

  exports.html = html;
  exports.styles = styles;
  exports.clear = clear;
  exports.images = images;
  exports.watches = watches;
  exports.server = server;
  exports.js = js;

  exports.default = series(clear,parallel(html,styles,images,js),parallel(server, watches))

  