const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Brong in Models
let User = require('../models/user');

// Register Form
router.get('/register', function(req,res){
    res.render('register');
});

router.post('/register', [
    check('username','Username Required').not().isEmpty(),
    check('email', 'Only real Emails').isEmail(),
    check('password', 'Password must be at least 4 char long').isLength({min:4}),
    check('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password does not match');
        }
    
        // Indicates the success of this synchronous custom validator
        return true;
      }),
    check('username').custom(value => {
        return User.find({
            username: value 
        }).then(username => {
            if (username.length > 0) {
                c
                return Promise.reject('Username already in use');
            }
        });
    }),
  ], function(req,res){
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log();
        return res.render('register', {
            errors:errors.array()
        });
    }else{
        
        let newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:req.body.password

        });
        

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password,salt, function(err,hash){
                if(err){
                    console.log(err);
                }
                newUser.password = hash;

                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success', 'Your are now Registered')
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

router.get('/login', function(req,res){
    res.render('login');
});

router.post('/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect: '/', 
        failureRedirect: '/users/login',
        failureFlash:true
    })(req,res,next);
    
});

router.get('/logout', function(req,res){
    req.logOut();
    req.flash('success','You have been logged out!');
    res.redirect('/users/login');
});

module.exports = router;