const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');



mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open',function(){
    console.log('Connected to MongoDB')
});

//Check for db errors
db.on('error',function(err){
    console.log(err);
});

//Init app
const app = express();

//Brong in Models
let Article = require('./models/article');

//Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname,'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

//Express Session Middleware
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express Validator Middleware
app.use(express.json());

//Express Flash Middleware
app.use(flash());

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
    res.locals.user = req.user || null;
    next();

});

//Home Route
app.get('/', function(req,res){
    Article.find({}, function(err,articles){
        if(err){
            console.log(err);
        }else{
            res.render('index', {
            title:'Articles',
            articles: articles
        });
    }
        
    });
    
});


//Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users',users);


//Start Server
app.listen(3000, function (){
    console.log('Server started on port 3000...');
});

