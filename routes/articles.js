const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//Brong in Models
let Article = require('../models/article');
let User = require('../models/user');


// Add Route
router.get('/add',ensureAuthenticated,function(req,res){
    console.log('heeey');
    res.render('add_article', {
        title:'Add Article'
    });
});

//Add Submit POST Route
router.post('/add', [
    check('title','Title Required').not().isEmpty(),
    check('body', 'Body Required').not().isEmpty(),
    check('title').custom(value => {
        return Article.find({
            title: value 
        }).then(title => {
            if (title.length > 0) {
                return Promise.reject('Title already in use');
            }
        });
    }),
  ], function(req,res){
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('add_article', {
            title: 'Add Article',
            errors:errors.array()
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        
        article.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success', 'Article Added')
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated,function(req,res){
    Article.findById(req.params.id,function(err, article){
        
        if (article.author != req.user._id){
            req.flash('danger','You are not authorized!');
            return res.redirect('/');
        }
        res.render('edit_article', {
            title:'Edit Article',
            article:article
        });
        
    });
});

//Update Submit
router.post('/edit/:id', function(req,res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}
    
    Article.updateOne(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success','Article Updated')
            res.redirect('/');
        }
    });
});

//Deleting specific article
router.delete('/:id', ensureAuthenticated,function(req,res){
    if(!req.user._id){
        return res.status(500).send();
    }
    let query = {_id:req.params.id}

    Article.findById(req.params.id,function(err, article){
        
        if (article.author != req.user._id){
            return res.status(500).send();
        }else{
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                }else{
                    res.send('Success');
                }
            });
        }
        
    });

    
});

// Get Single Article Route
router.get('/:id',function(req,res){
    Article.findById(req.params.id,function(err, article){
        if(err){
            console.log(err);
        }else{
            User.findById(article.author, function(err, user){
                res.render('article', {
                    article:article,
                    author: user.username
                });
            });
            
        }
    })
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger','Please log in!');
        res.redirect('/users/login');
    }

}


module.exports = router;