var express = require('express');
var router = express.Router();
// var connection = require('../db');
var session =  require('express-session');

var bodyParser = require('body-parser');
var ejs = require('ejs');
var path = require('path');
var models = require('../models');
var Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {

	console.log(req.session.token)
	res.render('register',{errors:req.session});
    
});

router.get('/login', function(req, res, next) {

	res.render('login',{errors:''});
    
});

router.post('/register', function(req, res, next) {

	console.log(req.body)
    req.session = req;

     var matched_users_promise = models.User.findAll({
        where:  Sequelize.or(
                {username: req.body.username},
                {email: req.body.email}
            )
    });
    matched_users_promise.then(function(users){ 
        if(users.length == 0){
            const passwordHash = bcrypt.hashSync(req.body.password,10);
            models.User.create({
                username: req.body.username,
                email: req.body.email,
                password: passwordHash
            }).then(function(){
                let newSession = req.session;
                newSession.email = req.body.email;
                newSession.save = req.body.email;
                res.redirect('/');
            });
        }
        else{
            res.render('register',{errors: "Username or Email already in user"});
        }
    })


	// connection.query("SELECT * FROM user WHERE name = ? ",[req.body.username], (err, result, fields)=>{
 //     	if (err)console.log(err);
 //     	else 
 //      	    req.session.username = JSON.stringify(result);
 //      	    res.render('register',{errors:result,loguser:req.session});
 //     		//res.end(JSON.stringify({status:'OK', pAppList: result}));
 //     	// process.exit(1);
 //   	});
   	// connection.end();
});

router.post('/logincheck',function(req,res){
    var matched_users_promise = models.User.findAll({
        where: Sequelize.and(
            {email: req.body.email},
        )
    }).then(result=>{
    	 req.session = req;
        if(result.length > 0){
            let user = result[0];
            let passwordHash = user.password;
            if(bcrypt.compareSync(req.body.password,passwordHash)){
                req.session.email = {'email':req.body.email};                
                req.session.save;
                res.redirect('/');
            }
            else{
                res.redirect('/register');
            }
        }
        else{
            res.redirect('/login');
        }

    }).catch(errprs=>{
    	console.log(errprs)
    });
})

module.exports = router;
