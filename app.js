var express = require('express');
var bodyparser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app= express();

//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Global vars
app.use(function(req,res,next){
    res.locals.errors = null;
    next();
});

//Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift()+']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value 
        };
    }
}));

//Body parser middle ware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

//Set static content path
app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
    db.users.find(function (err, docs) {
        
        res.render('index',{
            title: 'Customers',
            users: docs
        });
    });
    
   
});

app.post('/users/add',function(req,res){
    req.checkBody('first_name','First Name is Required').notEmpty();
    req.checkBody('last_name','Last Name is Required').notEmpty();
    req.checkBody('email','Email is Required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        console.log('Errors');
        res.render('index',{
            title: 'Customers',
            users: users,
            errors: errors
        });
    }
    else{
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
    
        db.users.insert(newUser,function(err,result){
            if(err){
                console.log(err);
            } else{
                res.redirect('/');
            }
            
        });
        
        
    }
    
    
});

app.delete('/users/delete/:id', function(req,res){
    
    db.users.remove({_id: ObjectId(req.params.id)},function(err, result){
        if(err){
            console.log(err);
        }
        //res.redirect('/');
        res.send();

    });
});

app.listen(3000, function(){
    console.log('Server started on port 3000');
})