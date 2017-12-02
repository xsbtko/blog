var express = require('express');
var path = require('path');
var methodoverride=require('method-override');
var session=require('express-session');
var settings=require('./settings');
var flash=require('connect-flash');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var index = require('./routes/index');//导入主页请求处理文件
var users = require('./routes/users');//导入用户请求处理文件
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置视图存放的文件
app.set('view engine', 'ejs');//设置渲染引擎
app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodoverride());
app.use(session({
  secret:settings.cookieSecret,
  name:settings.db,
  cookie:{maxAge:1000*60*60*24*30},
  resave:false,
  saveUninitialized:true
}));

app.use(express.static(path.join(__dirname, 'public')));//设置public文件夹存放静态文件

app.use('/', index);
/* index(app); */
app.use('/users', users);//路由处理

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
