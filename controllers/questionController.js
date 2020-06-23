var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

/// DataBase Connection :
var connection = mysql.createConnection({
     host:'41.226.11.252',
    port:1180,
    user:'askful',
    password:'askful',
    database:'askful'
});


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.post("/addquestion",(req,res,next)=>{

    var post_data = req.body;
    
    var title = post_data.title;
    var category = post_data.category;
    var img = post_data.img;
    var text = post_data.text;

    connection.query('INSERT INTO `question`(`title`, `category`, `img`, `text`) VALUES (?,?,?,?)',[title,category,img,text],function(err,result,field){
                connection.on('error',function(err){
                    console.log('MySQL Error',err);
                    res.json('Register Error',err);
                });
                res.json('Register Successfull');
    });
});