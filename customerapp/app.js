var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp'  , ['users']); 

var ObjectId = mongojs.ObjectId;
var app = express();

/*
var logger = function(req, res, next){
	console.log('logging...');
	next();
}
app.use(logger);
*/

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// body parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static path
app.use(express.static(path.join(__dirname, 'public')));

// global vars
app.use(function(req, res, next){
	res.locals.errors = null;
	next();
})

// Express Validator Middleware
app.use(expressValidator({
	customValidators: {
		isArray: function(value) {
			return Array.isArray(value);
		},
		gte: function(param, num) {
			return param >= num;
		}
	}
}));


var users = [
	{
		name: 'Akshay',
		age: 23
	},
	{
		name: 'Bill',
		age: 22
	},
	{
		name: 'Ygritte',
		age: 24
	}
];

app.get('/', function(req, res){
	//res.send('Hello');
	//res.json(users);
	
	db.users.find(function (err, docs) {
	    //console.log(docs) 

		res.render('index', {
			title: 'Customers',
			users: docs
		});
	});

});

app.post('/users/add', function(req, res){
		
	req.checkBody('name', 'Name Required.').notEmpty();
	req.checkBody('age', 'Age Required.').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('index', {
			title: 'Customers',
			users: users,
			errors: errors
		});
		console.log('ERRORS');
	}else{	
		var newUser = {
			name: req.body.name,
			age: req.body.age
		};

		db.users.insert(newUser, function(err, result){
			if (err) {
				console.log(err);		
			}
			res.redirect('/');
		});		
	}

});

app.delete('/users/delete/:id', function(req, res){
	db.users.remove({_id: ObjectId(req.params.id)},  function(err){
		if(err){
			console.log(err);
		}
		res.redirect('/');
	})
})

app.listen(80, function(){
	console.log('server started at port 3000');
});