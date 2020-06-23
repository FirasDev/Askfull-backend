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

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
}

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512',salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    }
};

function saltHashPassword(userPassword){
    var salt = genRandomString(16);
    var passwordData  = sha512(userPassword,salt);
    return passwordData;
}

function stringToDate(_date,_format,_delimiter)
{
            var formatLowerCase=_format.toLowerCase();
            var formatItems=formatLowerCase.split(_delimiter);
            var dateItems=_date.split(_delimiter);
            var monthIndex=formatItems.indexOf("mm");
            var dayIndex=formatItems.indexOf("dd");
            var yearIndex=formatItems.indexOf("yyyy");
            var month=parseInt(dateItems[monthIndex]);
            month-=1;
            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
            return formatedDate;
}


function checkHashPassword(userpassword,salt){
    var passwordData  = sha512(userpassword,salt);
    return passwordData;
}


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.post("/register",(req,res,next)=>{

    var post_data = req.body;
    var uid = uuid.v4();
    var plain_password = post_data.password;
    var hash_data = saltHashPassword(plain_password);
    var password = hash_data.passwordHash;
    var salt = hash_data.salt;

    var fname = post_data.fname;
    var lname = post_data.lname;
    var username = post_data.username;
    var email = post_data.email;
    var gender = post_data.gender;
    var phone = post_data.phone;
    var country = post_data.country;

    console.log("Date Of Birth "+post_data.birth_date);
    var birth_date = stringToDate(post_data.birth_date,"dd-mm-yyyy","-");
    console.log("Date Of Birth "+birth_date);
    var reason = post_data.reason;
    var specialty = post_data.specialty;

    connection.query('SELECT * FROM user WHERE email=?',[email],function(err,result,field){
        connection.on('error',function(err){
            console.log('MySQL Error',err);
        });

        if(result && result.length){
            res.json('User already exists');
        }else{
            connection.query('INSERT INTO `user`(`firstname`, `lastname`, `username`, `email`, `password`, `salt`, `gender`, `phone`, `country`, `birth_date`, `specialty`, `reason`) '+
            ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[fname,lname,username,email,password,salt,gender,phone,country,birth_date,specialty,reason],function(err,result,field){
                connection.on('error',function(err){
                    console.log('MySQL Error',err);
                    res.json('Register Error',err);
                });
                res.json('Register Successfull');
            });
        }
    });
});
app.post('/login',(req,res,next)=>{  
    var post_data = req.body;
    var userpassword = post_data.password;
    var email = post_data.email;
    console.log();
    if(email.indexOf("@") != -1 ){
        var strQuery = 'SELECT * FROM user WHERE email=?';
    }else{
        var strQuery = 'SELECT * FROM user WHERE username=?';
    }
    connection.query(strQuery,[email],function(err,result,field){
        connection.on('error',function(err){
            console.log('MySQL Error',err);
        });

        if(result && result.length){
            var salt = result[0].salt;
            var encrypted_password = result[0].password;    
            var hashed_password = checkHashPassword(userpassword,salt).passwordHash;
            if( encrypted_password == hashed_password){
                res.end(JSON.stringify(result[0]));
                console.log('User Found');
            }else{
                res.end(JSON.stringify('Wrong password'))
               
            }
            
        }else{
            res.json('User Not exists');
        }
        
    });
});