const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

var fs = require('fs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));


app.post('/upload', (req, res, next) => {
  let imageFile = req.files.file;

  imageFile.mv(`${__dirname}/public/${imageFile.name}.csv`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({file: [`public/${req.body.filename}.csv`, 'public/test.csv']});
  });

})

app.post('/getFiles', (req, res, next) => {
  console.log('getting files');
	fs.readdir("./public",function(err, files){
	   if (err) {
		   console.log('error reading files');
		  return console.error(err);
	   }
	   console.log('successful read - Files:');
	   console.log(files);
	   res.json({file: files});
   });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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

app.listen(8001, () => {
  console.log('8001');
});

module.exports = app;
