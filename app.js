
/*var express = require('express');
var app = express();

var loginController = require('./controllers/loginController');
app.use('/', loginController);

var questionController = require('./controllers/questionController');
app.use('/question', questionController);

/*
app.get("/",(req,res,next)=>{
    console.log('Password : 123456');
    var ancrypt  = saltHashPassword('123456');
    console.log('Encrypt :'+ancrypt.passwordHash);
    console.log('Salt :'+ancrypt.salt);
});
*/

//const express = require('express'),

const express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
const nodemailer = require('nodemailer');
var host = "http://lucypix.eu-4.evennode.com";
var crypto = require('crypto');
var uuid = require('uuid');
var mysql = require('mysql');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var dateFormat = require('dateformat');
//email config
let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ninjakun867@gmail.com',
        pass: 'Roufa55705089'
    }
});
/// DataBase Connection :
var connection = mysql.createConnection({
    host: "remotemysql.com",
    user: "No9kqbSwOu",
    password: "pynSBU8DBc",
    database: "No9kqbSwOu",
    port: 3306
});

var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    }
};

function saltHashPassword(userPassword) {
    var salt = genRandomString(16);
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

function stringToDate(_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
}


function checkHashPassword(userpassword, salt) {
    var passwordData = sha512(userpassword, salt);
    return passwordData;
}


//var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('/upload'));
app.use(fileUpload());

// Get Image
app.get("/upload/:img", (req, res, next) => {
    var img = './upload/' + req.params.img;
    console.log(img);
    res.sendfile(img);

});


///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ----- LoginController ----- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////



// User Register
app.post("/register", (req, res, next) => {

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


    console.log("Date Of Birth " + post_data.birth_date);
    var birth_date = stringToDate(post_data.birth_date, "dd-mm-yyyy", "-");
    console.log("Date Of Birth " + birth_date);
    var reason = post_data.reason;
    var specialty = post_data.specialty;

    connection.query('SELECT * FROM user WHERE email=?', [email], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
        });

        if (result && result.length) {
            res.json('User already exists');
        } else {
            connection.query('INSERT INTO `user`(`firstname`, `lastname`, `email`, `password`, `salt`, `gender`, `username`, `country`, `birth_date`, `specialty`, `reason`) ' +
                ' VALUES (?,?,?,?,?,?,?,?,?,?,?)', [fname, lname, email, password, salt, gender, username, country, birth_date, specialty, reason], function (err, result, field) {
                    connection.on('error', function (err) {
                        console.log('MySQL Error', err);
                        res.json('Register Error', err);
                        console.log(err);
                    });
                    res.json('Register Successfull');
                    console.log('NRegister Successfull');
                });
            const message = {
                from: 'ninjakun867@gmail.com', // Sender address
                to: email,         // List of recipients
                subject: 'Welcome To Askful', // Subject line
                html: '<h1>Welcome To Askful!</h1><p>Please verify your email : <b>' + host + '/verify?id=' + salt + '</b> </p>' // Plain text body
            };

            transport.sendMail(message, function (err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            });

        }
    });
});

app.get("/userId", (req, res) => {
    console.log("User Id " + uid);
});

app.post("/registerWithImg", (req, res, next) => {

    var uid = uuid.v4();

    var post_data = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
        var filename = "avatar.jpg";
    } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files.file;
        //var filename = dateFormat(Date.now(), "yyyy-mm-dd-hh.MM.ss") +'.jpg';
        var filename = uid + '.jpg';
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv('./upload/' + filename, function (err) {
            if (err)
                return res.status(500).send(err);
            console.log('File uploaded!');
        });
    }


    var img = filename;

    var plain_password = post_data.password;
    var hash_data = saltHashPassword(plain_password);
    var password = hash_data.passwordHash;
    var salt = hash_data.salt;

    var fname = post_data.fname;
    var lname = post_data.lname;
    var username = post_data.username;
    var email = post_data.email;

    var gender = post_data.gender;
    var country = post_data.country;

    console.log("Date Of Birth " + post_data.birth_date);
    var birth_date = stringToDate(post_data.birth_date, "dd-mm-yyyy", "-");
    console.log("Date Of Birth " + birth_date);
    var reason = post_data.reason;
    var specialty = post_data.specialty;

    console.log(img);
    console.log(fname);
    console.log(lname);
    console.log(email);


    connection.query('SELECT * FROM user WHERE email=? OR username=?', [email, username], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
        });

        if (result && result.length) {
            res.json('User already exists');
        } else {
            connection.query('INSERT INTO `user`(`firstname`, `lastname`, `email`, `password`, `salt`, `gender`, `username`, `country`, `birth_date`, `specialty`, `reason`, `avatar`) ' +
                ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [fname, lname, email, password, salt, gender, username, country, birth_date, specialty, reason, img], function (err, result, field) {
                    connection.on('error', function (err) {
                        console.log('MySQL Error', err);
                        res.json('Register Error', err);
                    });
                    res.json('Register Successfull');
                });
            const message = {
                from: 'ninjakun867@gmail.com', // Sender address
                to: email,         // List of recipients
                subject: 'Welcome To Askful', // Subject line
                html: '<h1>Welcome To Askful!</h1><p>Please verify your email : <b>' + host + '/verify?id=' + salt + '</b> </p>' // Plain text body
            };

            transport.sendMail(message, function (err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            });
        }
    });

});

// User Login
app.post('/login', (req, res, next) => {
    var post_data = req.body;
    var userpassword = post_data.password;
    var email = post_data.email;
    if (email.indexOf("@") != -1) {
        var strQuery = 'SELECT * FROM user WHERE email=?';
    } else {
        var strQuery = 'SELECT * FROM user WHERE username=? ';
    }
    connection.query(strQuery, [email], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
        });

        if (result && result.length) {
            var salt = result[0].salt;
            var encrypted_password = result[0].password;
            var hashed_password = checkHashPassword(userpassword, salt).passwordHash;
            if (encrypted_password == hashed_password) {
                res.end(JSON.stringify(result[0]));
                console.log('User Found');
            } else {
                console.log('Wrong password');
                res.end(JSON.stringify('Wrong password'))

            }

        } else {
            console.log('User Not Found');
            res.json('User Not exists');
        }

    });
});


// Get User
app.post('/getUserByEmail', (req, res, next) => {
    console.log("User Get AFTER Login");
    var post_data = req.body;
    var email = post_data.email;
    if (email.indexOf("@") != -1) {
        var strQuery = 'SELECT * FROM user WHERE email=?';
    } else {
        var strQuery = 'SELECT * FROM user WHERE username=? ';
    }
    console.log(strQuery);
    connection.query(strQuery, [email], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
        });
        console.log(result);
        res.send(result[0]);
    });
});




///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// --- QuestionController ---  //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////



// Add Question
app.post("/addquestion", (req, res, next) => {

    var post_data = req.body;

    var user_id = post_data.id;
    var title = post_data.title;
    var category = post_data.category;
    var img = post_data.img;
    var text = post_data.text;

    connection.query('INSERT INTO `question` (`user_id`, `title`, `category`, `img`, `text`) VALUES (?,?,?,?,?)', [user_id, title, category, img, text], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        connection.query('UPDATE `user` SET `defance`= `defance`+ 10 WHERE  `id` = ?', [user_id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            console.log("User Defance Updated");
            //res.json('User Modified');
        });
        res.json('Question Added');
    });

});


app.post("/addFilequestion", (req, res, next) => {

    var post_data = req.body;
    var user_id = post_data.id;
    var title = post_data.title;
    var category = post_data.category;
    var text = post_data.text;

    if (!req.files || Object.keys(req.files).length === 0) {
        filename = "Q.jpg";
    } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files.file;
        var filename = user_id + "-" + dateFormat(Date.now(), "yyyy-mm-dd-hh.MM.ss") + '.jpg';
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv('./upload/' + filename, function (err) {
            if (err)
                return res.status(500).send(err);
            console.log('File uploaded!');
        });
    }
    var img = filename;

    console.log(img);
    console.log(user_id);
    console.log(title);
    console.log(category);
    console.log(text);

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");

        connection.query('INSERT INTO `question` (`user_id`, `title`, `category`, `img`, `text`) VALUES (?,?,?,?,?)', [user_id, title, category, img, text], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            console.log("Enter 3")
            connection.query('UPDATE `user` SET `defance`= `defance`+ 5 WHERE  `id` = ?', [user_id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User defance Updated");
                //res.json('User Modified');
            });

            res.json('Question Added');
        });

    });


});


// Edit Question
app.put("/editquestion", (req, res, next) => {

    var post_data = req.body;
    var id = post_data.id;
    var title = post_data.title;
    var category = post_data.category;
    var text = post_data.text;
    var uid = uuid.v4();

    var filename = uid + '.jpg';
    if (!req.files || Object.keys(req.files).length === 0) {
        filename = null;
    } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let sampleFile = req.files.file;

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv('./upload/' + filename, function (err) {
            if (err)
                return res.status(500).send(err);
            console.log('File uploaded!');
        });
    }

    var img = filename;
    console.log(img);
    console.log(id);
    console.log(title);
    console.log(category);
    console.log(text);


    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");
        if (img != null) {


            connection.query('UPDATE `question` SET `title`= ? ,`category`= ?,`text`= ? ,`img` = ? WHERE  `id` = ?', [title, category, text, img, id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                res.json('Question With Img Modified');
            });
        } else {
            connection.query('UPDATE `question` SET `title`= ? ,`category`= ?,`text`= ? WHERE  `id` = ?', [title, category, text, id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                res.json('Question Without IMG Modified');
            });
        }

    });
});


// Delete Qutestion
app.delete("/deletequestion/:id/:uid", (req, res, next) => {

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");

        connection.query('DELETE FROM `question` WHERE id = ?', [req.params.id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });

            connection.query('UPDATE `user` SET `defance`= `defance` - 5 WHERE  `id` = ?', [req.params.uid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User defance Updated");
                //res.json('User Modified');
            });

            connection.query('UPDATE `user` SET `defance`= `defance` - 5 WHERE  `id` = ?', [req.params.uid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User defance Updated");
                //res.json('User Modified');
            });


            connection.query('DELETE FROM `reponse` WHERE question_id = ?', [req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("Reponse Deleted");
                //res.json('User Modified');
            });

            res.send('Question deleted');
        });
    });

});


// Search Questions By Id
app.get("/getQuestion/:id", (req, res, next) => {

    connection.query('SELECT * , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment FROM `question` q WHERE id = ?', [req.params.id], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        res.send(result[0]);
    });

});


// Search Questions By User Id
app.get("/getMyquestion/:id", (req, res, next) => {


    connection.query('SELECT * , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment FROM `question` q WHERE user_id = ?', [req.params.id], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        res.send(result);
    });

});


// Search Question By Category
app.get("/getquestions/:category", (req, res, next) => {

    connection.query('SELECT q.*,u.firstname ,u.lastname, u.avatar , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment FROM `question` q,`user`u WHERE q.category = ? AND q.user_id = u.id', [req.params.category], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        res.send(result);
    });

});


// Search Question By Title
app.get("/searchquestions/:search", (req, res, next) => {

    var strQuery = "SELECT q.*,u.firstname ,u.lastname ,u.avatar FROM `question` q,`user`u WHERE q.title LIKE '%" + req.params.search + "%' AND q.user_id = u.id";
    console.log(strQuery);
    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        //console.log(res);
        res.send(result);
    });

});


// Select ALL Question
app.get("/allquestions", (req, res, next) => {
    console.log("Enter Get ALL Question");

    //SELECT q.* , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment  FROM `question` q 

    var strQuery = "SELECT q.*,u.firstname ,u.lastname ,u.avatar , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment FROM `question` q,`user`u WHERE q.user_id = u.id ";
    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        console.log(result);
        res.send(result);
    });

});


// Search Question By Competition
app.get("/getquestionsbycompetition/:uid/:cid", (req, res, next) => {
    console.log(req.params.uid + " ------------- " + req.params.cid);
    connection.query('SELECT q.*,u.firstname ,u.lastname, u.avatar , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 1) AS nbreponse , (SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 0) AS nbcomment,(SELECT COUNT(*) FROM reponse WHERE question_id = q.id AND reponse.type = 3 AND reponse.user_id = ?) AS answerdbyme_comp FROM `question` q,`user`u WHERE q.competition_id = ? AND q.user_id = u.id', [req.params.uid, req.params.cid], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        console.log(result);
        res.send(result);
    });

});



///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ---- ReponseController ---- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////


// Add Reponse
app.post("/addreponse", (req, res, next) => {

    var post_data = req.body;

    var user_id = post_data.id;
    var question_id = post_data.qid;
    var text = post_data.text;
    var type = post_data.type;

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");
        connection.query('INSERT INTO `reponse` (`user_id`, `question_id`, `text`, `type`) VALUES (?, ?, ?, ?)', [user_id, question_id, text, type], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Reponse Error', err);
            });

            if (type == 1) {
                connection.query('UPDATE `user` SET `power`= `power`+ 1 WHERE  `id` = ?', [user_id], function (err, result, field) {
                    connection.on('error', function (err) {
                        console.log('MySQL Error', err);
                        res.json('Question Error', err);
                    });
                    console.log("User Power Updated");
                    //res.json('User Modified');
                });
            }
            res.json('Reponse Added And User User Power Updated');
        });
    });
});


// Edit Reponse
app.put("/editreponse", (req, res, next) => {
    var post_data = req.body;
    var id = post_data.id;
    var text = post_data.text;
    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        connection.query('UPDATE `reponse` SET `text`= ? WHERE  `id` = ?', [text, id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            res.json('Reponse Modified');
        });
    });

});


// Delete Reponse
app.delete("/deletereponse/:id/:type/:uid", (req, res, next) => {

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        if (req.params.type == 1) {
            connection.query('UPDATE `user` SET `power`= `power`- 1 WHERE  `id` = ?', [req.params.uid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User Power Updated");
                //res.json('User Modified');
            });
        }

        connection.query('DELETE FROM `approve` WHERE reponse_id = ?', [req.params.id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            console.log("Approve deleted");
        });

        connection.query('DELETE FROM `reponse` WHERE id = ?', [req.params.id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            res.send('Reponse deleted');
        });
    });

});


// Select Reponse By Question
app.get("/getreponses/:qid/:uid", (req, res, next) => {

    //SELECT r.* , u.firstname ,u.lastname,u.avatar , (SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id AND approve.user_id = "+req.params.uid+") as me FROM `reponse` r,`user`u r.user_id = u.id AND r.question_id = "+req.params.qid;
    //var strQuery = "SELECT r.id, r.user_id , r.question_id, r.text , r.type , r.date_create , u.firstname ,u.lastname,u.avatar FROM `reponse` r,`user`u WHERE r.user_id = u.id AND r.question_id = "+req.params.qid;
    var strQuery = "SELECT r.*, u.firstname ,u.lastname,u.avatar , (SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id AND approve.user_id = " + req.params.uid + ") as approvedbyme,(SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id ) as approvedby FROM `reponse` r,`user`u WHERE r.user_id = u.id AND r.question_id = " + req.params.qid;
    console.log(strQuery);

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        console.log(result);
        res.send(result);
    });


});

// Select Reponse By Id
app.get("/getreponsebyid/:id/:uid", (req, res, next) => {

    //SELECT r.* , u.firstname ,u.lastname,u.avatar , (SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id AND approve.user_id = "+req.params.uid+") as me FROM `reponse` r,`user`u r.user_id = u.id AND r.question_id = "+req.params.qid;
    //var strQuery = "SELECT r.id, r.user_id , r.question_id, r.text , r.type , r.date_create , u.firstname ,u.lastname,u.avatar FROM `reponse` r,`user`u WHERE r.user_id = u.id AND r.question_id = "+req.params.qid;
    var strQuery = "SELECT r.* , u.firstname ,u.lastname,u.avatar , (SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id AND approve.user_id = " + req.params.uid + ") as approvedbyme,(SELECT COUNT(*) FROM approve WHERE approve.reponse_id = r.id ) as approvedby FROM `reponse` r,`user`u WHERE r.user_id = u.id AND r.id = " + req.params.id;
    console.log(strQuery);

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        console.log(result);
        res.send(result[0]);
    });


});

// Approve Reponse
app.post("/approvereponse/:uid/:uqid/:urid/:id/:qid", (req, res, next) => {

    console.log(req.params.uid + " - " + req.params.id);
    if (req.params.uid == req.params.uqid) {

        connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });


            connection.query('UPDATE `reponse` SET `approved`= 1 WHERE  `id` = ?', [req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });
            connection.query('UPDATE `question` SET `stats`= 1 WHERE  `id` = ?', [req.params.qid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Question Modified');
            });
            connection.query('UPDATE `user` SET `power`= `power`+ 10 WHERE  `id` = ?', [req.params.urid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User Power Updated");
                //res.json('User Modified');
            });

            connection.query('INSERT INTO `approve`(`user_id`, `reponse_id`) VALUES (?,?)', [req.params.urid, req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });


            connection.query('SELECT * FROM `question` WHERE  `id` = ?', [req.params.qid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("" + result[0].competition_id);
                if (result[0].competition_id != null) {

                    connection.query('SELECT * FROM `competition` WHERE id = ? ', [result[0].competition_id], function (err, competition, field) {
                        connection.on('error', function (err) {
                            console.log('MySQL Error', err);
                            res.json('Question Error', err);
                        });
                        console.log("Competetion NbQuestion : " + competition[0].nbquestion);
                        connection.query('SELECT COUNT(*) As "count" FROM `question` WHERE competition_id = ? AND stats = 1', [result[0].competition_id], function (err, count, field) {
                            connection.on('error', function (err) {
                                console.log('MySQL Error', err);
                                res.json('Question Error', err);
                            });
                            console.log("Count Question : " + count[0].count);

                            if (count[0].count == competition[0].nbquestion) {
                                connection.query('SELECT count(*) as "countWin" FROM `reponse` r , `question` q, `competition` c WHERE c.id = q.competition_id AND r.question_id = q.id AND r.user_id = ? AND c.id = ? AND r.approved = 1', [competition[0].user_one, result[0].competition_id], function (err, countWin, field) {
                                    connection.on('error', function (err) {
                                        console.log('MySQL Error', err);
                                        res.json('Question Error', err);
                                    });
                                    console.log("Player One id : " + competition[0].user_one + " Win : " + countWin[0].countWin)

                                    if (countWin[0].countWin > competition[0].nbquestion / 2) {
                                        connection.query('UPDATE `competition` SET `date_end`= CURRENT_TIMESTAMP ,`stat`= 3 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Updated TO END - Player One WIN");
                                        });
                                    } else if (countWin[0].countWin < competition[0].nbquestion / 2) {
                                        connection.query('UPDATE `competition` SET `date_end`= CURRENT_TIMESTAMP ,`stat`= 4 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Updated TO END - Player Two WIN");
                                        });
                                    } else {
                                        connection.query('UPDATE `competition` SET `date_end`= CURRENT_TIMESTAMP ,`stat`= 5 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Updated TO END - DRAW");
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
        console.log('Approved C1');
        res.json('Approved C1');

    } else {

        connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });

            connection.query('INSERT INTO `approve`(`user_id`, `reponse_id`) VALUES (?,?)', [req.params.uid, req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });
            connection.query('UPDATE `user` SET `power`= `power`+ 3 WHERE  `id` = ?', [req.params.urid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User Power Updated");
                //res.json('User Modified');
            });

        });
        console.log('Approved C2');
        res.json('Approved C2');
    }
});


// DeApprove Reponse
app.post("/desapprovereponse/:uid/:uqid/:urid/:id/:qid", (req, res, next) => {

    console.log(req.params.urid + " - " + req.params.uqid);
    if (req.params.uid == req.params.uqid) {

        connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });

            connection.query('UPDATE `reponse` SET `approved`= 0 WHERE  `id` = ?', [req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });
            connection.query('UPDATE `question` SET `stats`= 0 WHERE  `id` = ?', [req.params.qid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });
            connection.query('UPDATE `user` SET `power`= `power`- 10 WHERE  `id` = ?', [req.params.urid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User Power Updated");
                //res.json('User Modified');
            });

            connection.query('DELETE FROM `approve` WHERE user_id = ? AND reponse_id = ?', [req.params.urid, req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });


            connection.query('SELECT * FROM `question` WHERE  `id` = ?', [req.params.qid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("" + result[0].competition_id);
                if (result[0].competition_id != null) {

                    connection.query('SELECT * FROM `competition` WHERE id = ? ', [result[0].competition_id], function (err, competition, field) {
                        connection.on('error', function (err) {
                            console.log('MySQL Error', err);
                            res.json('Question Error', err);
                        });
                        console.log("Competetion NbQuestion : " + competition[0].nbquestion);
                        connection.query('SELECT COUNT(*) As "count" FROM `question` WHERE competition_id = ? AND stats = 1', [result[0].competition_id], function (err, count, field) {
                            connection.on('error', function (err) {
                                console.log('MySQL Error', err);
                                res.json('Question Error', err);
                            });
                            console.log("Count Question : " + count[0].count);

                            if (count[0].count == competition[0].nbquestion) {
                                connection.query('SELECT count(*) as "countWin" FROM `reponse` r , `question` q, `competition` c WHERE c.id = q.competition_id AND r.question_id = q.id AND r.user_id = ? AND c.id = ? AND r.approved = 1', [competition[0].user_one, result[0].competition_id], function (err, countWin, field) {
                                    connection.on('error', function (err) {
                                        console.log('MySQL Error', err);
                                        res.json('Question Error', err);
                                    });
                                    console.log("Player One id : " + competition[0].user_one + " Win : " + countWin[0].countWin)

                                    if (countWin[0].countWin > competition[0].nbquestion / 2) {
                                        connection.query('UPDATE `competition` SET `date_end`= NULL ,`stat`= 1 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Reset 1");
                                        });
                                    } else if (countWin[0].countWin < competition[0].nbquestion / 2) {
                                        connection.query('UPDATE `competition` SET `date_end`= NULL ,`stat`= 1 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Reset 2");
                                        });
                                    } else {
                                        connection.query('UPDATE `competition` SET `date_end`= NULL ,`stat`= 1 WHERE  `id` = ?', [result[0].competition_id], function (err, result, field) {
                                            connection.on('error', function (err) {
                                                console.log('MySQL Error', err);
                                                res.json('Question Error', err);
                                            });
                                            console.log("Competition Reset 3");
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
        res.json('Approved C1');

    } else {

        connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });

            connection.query('DELETE FROM `approve` WHERE user_id = ? AND reponse_id = ?', [req.params.uid, req.params.id], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log('Reponse Modified');
            });
            connection.query('UPDATE `user` SET `power`= `power`- 3 WHERE  `id` = ?', [req.params.urid], function (err, result, field) {
                connection.on('error', function (err) {
                    console.log('MySQL Error', err);
                    res.json('Question Error', err);
                });
                console.log("User Power Updated");
                //res.json('User Modified');
            });

        });
        res.json('Approved C2');
    }
});



///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// -- CompetitionController -- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////



// Create Competition
app.post("/createcompetition", (req, res, next) => {

    var post_data = req.body;

    var type = "NULL";
    var nbquestion = post_data.nbquestion;
    var category = post_data.category;
    var user_one = post_data.userone;
    var user_two = post_data.usertwo;

    console.log(user_one);
    console.log(user_two);

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");

        connection.query('INSERT INTO `competition` ( `type`,`nbquestion`, `category`, `user_one`, `user_two`) VALUES (?,?,?,?,?)', [type, nbquestion, category, user_one, user_two], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Question Error', err);
            });
            console.log("Create Competition");
            //res.json(result.insertId);
            res.json(result.insertId);
        });

    });

});


// Edit Competition
app.put("/editCompetition/", (req, res, next) => {
    var post_data = req.body;
    var competition_id = post_data.cid;

    var strQuery = "UPDATE `competition` SET `date_start`= CURRENT_TIMESTAMP ,`stat`= 1 WHERE id = " + competition_id;

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Approved Competition Error', err);
        });
        res.send("Approved Competition DONE");
    });
});

// Delete Competition
app.delete("/deleteCompetition/:id", (req, res, next) => {

    connection.query('UPDATE `question` SET `competition_id`= null WHERE competition_id =  ?', [req.params.id], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Competition Error', err);
        });
        connection.query('DELETE FROM `competition` WHERE id = ?', [req.params.id], function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Competition Error', err);
            });
            res.send('Competition deleted');
        });
        console.log('Competition deleted')
    });



});


// Questions For Competition
app.get("/getCompetitionQuestion/:category/:limit/:uid", (req, res, next) => {
    console.log("Enter getCompetitionQuestion");
    console.log(req.params.uid);
    if (req.params.category != 'All') {
        var strQuery = 'SELECT * FROM `question` WHERE competition_id is null AND user_id <> ' + req.params.uid + ' AND stats = 0 AND category = "' + req.params.category + '"ORDER BY RAND() LIMIT ' + req.params.limit;
    } else {
        var strQuery = 'SELECT * FROM `question` WHERE competition_id is null AND user_id <> ' + req.params.uid + ' AND stats = 0 ORDER BY RAND() LIMIT ' + req.params.limit;
    }
    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Questions For Competition Error', err);
        });
        res.send(result);
        console.log(result);
    });

});


// Approve Competition Questions
app.put("/approveCompetitionQuestion", (req, res, next) => {
    console.log("Enter Approve CQ");
    var post_data = req.body;
    var competition_id = post_data.cid;
    console.log(competition_id);
    console.log(post_data.qid);
    var qid = post_data.qid.split("-");
    var strQuery = "UPDATE `question` SET `competition_id` = " + competition_id + " WHERE id IN ("
    console.log(qid);
    for (var index in qid) {
        strQuery += qid[index];
        if (index < qid.length - 1)
            strQuery += ",";
    }
    strQuery += ")";
    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Approved Questions For Competition Error', err);
        });
        res.send("Approved Questions For Competition DONE");
    });
});


// Approve Competition
app.put("/approveCompetition/", (req, res, next) => {
    var post_data = req.body;
    var competition_id = post_data.cid;

    var strQuery = "UPDATE `competition` SET `date_start`= CURRENT_TIMESTAMP ,`stat`= 1 WHERE id = " + competition_id;

    connection.query('SET FOREIGN_KEY_CHECKS=0;', function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });

        console.log("SET FOREIGN_KEY_CHECKS=0;");
        connection.query(strQuery, function (err, result, field) {
            connection.on('error', function (err) {
                console.log('MySQL Error', err);
                res.json('Approved Competition Error', err);
            });
            res.send("Approved Competition DONE");
        });
    });
});

// InCour Competition
/*
app.get("/getInCourCompetition/:id",(req,res,next)=>{
    console.log("Enter getInCourCompetition");
    
    var strQuery ='SELECT * FROM `competition` WHERE stat = 1 AND user_one = '+req.params.id;
   
    connection.query(strQuery,function(err,result,field){
        connection.on('error',function(err){
            console.log('MySQL Error',err);
            res.json('Questions For Competition Error',err);
        });
        res.send(result);
        console.log(result);
    });

});
*/

// InCour Competition
app.get("/getInCourCompetition/:id", (req, res, next) => {
    console.log("Enter getInCourCompetition");

    //var strQuery ='SELECT * FROM `competition` WHERE stat = 1 AND ( user_one = '+req.params.id+' OR user_two ='+req.params.id+')';

    var strQuery = 'SELECT uone.firstname as user_onefirstname ,uone.lastname as user_onelastname,uone.avatar as user_oneavatar,uone.username as username_one,'
        + 'utwo.firstname as user_twofirstname ,utwo.lastname as user_twolastname  ,utwo.avatar as user_twoavatar,utwo.username as username_two ,c.* ' +
        'FROM `competition` c ,user uone,user utwo WHERE c.user_one = uone.id AND c.user_two = utwo.id AND stat = 1 AND ( user_one = ' + req.params.id + ' OR user_two =' + req.params.id + ')';

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('InCour Competition', err);
        });
        res.send(result);
        console.log(result);
    });

});

// Finished Competition
app.get("/getFinishedCompetition/:id", (req, res, next) => {
    console.log("Enter getInCourCompetition");
    //var strQuery ='SELECT * FROM `competition` WHERE stat != 0 AND ( user_one = '+req.params.id+' OR user_two ='+req.params.id+')';

    var strQuery = 'SELECT uone.firstname as user_onefirstname ,uone.lastname as user_onelastname,uone.avatar as user_oneavatar,uone.username as username_one,'
        + 'utwo.firstname as user_twofirstname ,utwo.lastname as user_twolastname  ,utwo.avatar as user_twoavatar,utwo.username as username_two , c.* ' +
        'FROM `competition` c ,user uone,user utwo WHERE c.user_one = uone.id AND c.user_two = utwo.id AND stat != 0 AND stat != 1 AND ( user_one = ' + req.params.id + ' OR user_two =' + req.params.id + ')';


    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Questions For Competition Error', err);
        });
        res.send(result);
        console.log(result);
    });
});

// Attend Approve Competition
app.get("/getAttentedCompetition/:id", (req, res, next) => {
    console.log("Enter getAttentedCompetition");
    console.log(req.params.id);

    var strQuery = 'SELECT uone.firstname as user_onefirstname ,uone.lastname as user_onelastname,uone.avatar as user_oneavatar,uone.username as username_one,'
        + 'utwo.firstname as user_twofirstname ,utwo.lastname as user_twolastname  ,utwo.avatar as user_twoavatar,utwo.username as username_two , c.* ' +
        'FROM `competition` c ,user uone,user utwo WHERE c.user_one = uone.id AND c.user_two = utwo.id AND stat = 0 AND ( user_one = ' + req.params.id + ' OR user_two =' + req.params.id + ')';



    // var strQuery ='SELECT * FROM `competition` WHERE stat = 0 AND ( user_one = '+req.params.id+' OR user_two ='+req.params.id+')';

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Questions For Competition Error', err);
        });
        res.send(result);
        console.log(result);
    });

});




///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ------ UserController ----- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////



app.get("/getUserInfo/:id", (req, res, next) => {

    console.log("Enter getUser");
    var strQuery = 'SELECT *,(SELECT COUNT(*) FROM `question` WHERE question.user_id = ' + req.params.id
        + ') AS question , (SELECT COUNT(*) FROM `reponse` WHERE reponse.user_id = ' + req.params.id
        + ' AND reponse.type = 0) AS comment ,(SELECT COUNT(*) FROM `reponse` WHERE reponse.user_id = ' + req.params.id
        + ' AND reponse.type = 1) AS reponse FROM `user`WHERE id =' + req.params.id;

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('UserController Error', err);
        });
        console.log(result);
        res.send(result[0]);

    });

});


////////////////////////////////////////////////////////




app.post('/upload', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./upload/' + dateFormat(Date.now(), "yyyy-mm-dd-h.MM.ss") + '.jpg', function (err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});


app.post("/fileup", (req, res, next) => {
    console.log("Etape 1")

    var title = req.body.title;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;
    var filename = dateFormat(Date.now(), "yyyy-mm-dd-hh.MM.ss") + '.jpg';
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./upload/' + filename, function (err) {
        if (err)
            return res.status(500).send(err);
        console.log('File uploaded!');
    });

    var img = filename;
    console.log("Upload Etap 2")
    connection.query('INSERT INTO `question` ( `title`, `img`) VALUES (?,?)', [title, "img"], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Question Error', err);
        });
        console.log("Enter 3")
        res.json('Question Added');
    });

});


///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ----- ChatController ----- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////

/*app.get('/', (req, res) => {

res.send('Chat Server is running on port 3000')
});*/
io.on('connection', (socket) => {

    console.log('user connected')

    socket.on('join', function (userNickname) {

        console.log(userNickname + " : has joined the chat ");

        socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat ");
    })


    socket.on('messagedetection', (senderNickname, messageContent) => {

        //log the message in console 

        console.log(senderNickname + " : " + messageContent)

        //create a message object 

        let message = { "message": messageContent, "senderNickname": senderNickname }

        // send the message to all users including the sender  using io.emit() 

        io.emit('message', message)

    })

    socket.on('disconnect', function () {

        //console.log(userNickname +' has left ')

        socket.broadcast.emit("userdisconnect", ' user has left')
    })
})


///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ----- EmailController ----- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////

app.get('/verify', function (req, res) {
    connection.query('SELECT * FROM user WHERE salt = ? ', [req.query.id]
        , function (err, rows) {
            if (err) {
                connection.end();
                return console.log(err);
            }
            if (!rows.length) {
                //console.log("zzzzzzz : "+req.query.id);
                console.log("email is not verified");

                //console.log("email is verified");
                //  res.end("<h1>Email has been Successfully verified");
            }
            else {

                var sql = "UPDATE user SET verified = 'yes' WHERE salt = '" + req.query.id + "'";
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + "Email has been Successfully verified");
                    setTimeout(function () {
                        res.end();

                    }, 2000);
                });

            }

        });
});

///////////// --------------------------- //////////////
///////////// --------------------------- //////////////
///////////// ----- FriendController ----- //////////////
///////////// --------------------------- //////////////
///////////// --------------------------- //////////////

// InCour Friends
app.get("/getFriends/:id", (req, res, next) => {
    console.log("Enter getFriends");

    //var strQuery ='SELECT * FROM `competition` WHERE stat = 1 AND ( user_one = '+req.params.id+' OR user_two ='+req.params.id+')';



    var strQuery = 'SELECT uone.firstname as user_onefirstname ,uone.lastname as user_onelastname,uone.avatar as user_oneavatar, c.* FROM `friend` c ,user uone WHERE c.user_two = uone.id  AND ( user_one = ' + req.params.id + ' OR user_two =' + req.params.id + ')';

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('InCour Competition', err);
        });
        res.send(result);
        console.log(result);
    });

});

// Delete Competition
app.delete("/deleteFriend/:id", (req, res, next) => {


    connection.query('DELETE FROM `friend` WHERE id = ?', [req.params.id], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Competition Error', err);
        });
        res.send('Competition deleted');
    });
});

// Approve Friend
app.put("/approveFriend/", (req, res, next) => {
    var post_data = req.body;
    var friend_id = post_data.cid;

    var strQuery = "UPDATE `friend` SET  `stats`= 1 WHERE id = " + friend_id;

    connection.query(strQuery, function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Approved Friendship Error', err);
        });
        res.send("Approved Friendship DONE");
    });
});

// Add Friend
app.post("/addFriend", (req, res, next) => {

    var post_data = req.body;

    var user_id = post_data.id;
    var user_two = post_data.id2;


    connection.query('INSERT INTO `friend` ( `user_one`, `user_two`) VALUES (?,?)', [user_id, user_two], function (err, result, field) {
        connection.on('error', function (err) {
            console.log('MySQL Error', err);
            res.json('Friend Request sent', err);
        });

        res.json('Friend Request sent');
        console.log('Friend Request sent');
    });

});

server.listen(process.env.PORT, () => {
    console.log('Node app is running on port 80');
})