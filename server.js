var PORT = process.env.PORT || 3000;

var express = require("express");
var cookieParser = require("cookie-parser");

var app = express();
app.use(cookieParser());

var mysql = require("mysql");

var SMSru = require('sms_ru'),
sms = new SMSru('secret-key');

var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
app.use(jsonParser);

var passwordHash = require('password-hash');

app.use(express.static("public/"));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept-Type');

    next();
});  

var db_config = {
    host: "host",
    user: "user",
    password: "password",
    database: "database_name",
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); 
                                                    
    connection.connect(function(err) {              
        if(err) setTimeout(handleDisconnect, 2000);                                      
    });                                     
                                            
    connection.on('error', function(err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
          handleDisconnect();                         
        } else {                                      
          throw err;                                  
        }
    });
}

handleDisconnect(); 

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/signIn.html");
});

app.get("/login_check", function(req, res) {
    (req.cookies['id'] && req.cookies['login'] && req.cookies['pass']) ? res.send("1") : res.send("0");
});

app.post("/login", function(req, res) {

    connection.query("SELECT id,pass FROM users WHERE login='"+req.body.phone+"'", function (error, users) {
        if(users != "" && users != undefined) { 
            if(passwordHash.verify(req.body.pass, users[0].pass)) {

                res.cookie('id', users[0].id, {maxAge:3600000,httpOnly:true});
                res.cookie('login', req.body.phone, {maxAge:3600000,httpOnly:true});
                res.cookie('pass', users[0].pass, {maxAge:3600000,httpOnly:true});
                res.send("1");
            } else {
                res.send("0");
            }
        } else {
            res.send("0");
        }
    });
});

app.get("/get_user_data", function (req, res) {
    console.log(req.cookies['id']);
    connection.query("SELECT pass, alias FROM users WHERE id='"+req.cookies['id']+"'", function (error, users) {
        if(users != "" && users != undefined) { 
            if(users[0].pass == req.cookies['pass']) {
                connection.query("SELECT id,first_pair,second_pair,value FROM pairs WHERE user_id='"+req.cookies['id']+"'", function (error, pairs) {
                    if(pairs != "" && pairs != undefined) { 
                        res.send(JSON.stringify([users[0].alias,pairs]));
                    } else {
                        res.send(JSON.stringify([users[0].alias,0]));
                    }
                });
            } else {
                res.cookie('id', "", {maxAge:0,httpOnly:true});
                res.cookie('login', "", {maxAge:0,httpOnly:true});
                res.cookie('pass', "", {maxAge:0,httpOnly:true});
                res.send("0");
            }
        } else {
            res.cookie('id', "", {maxAge:0,httpOnly:true});
            res.cookie('login', "", {maxAge:0,httpOnly:true});
            res.cookie('pass', "", {maxAge:0,httpOnly:true});
            res.send("0");
        }
    });
}); 

app.post("/save_pair",function (req, res) {
    connection.query("SELECT pass FROM users WHERE id='"+req.cookies['id']+"'", function (error, users) {
        if(users != "" && users != undefined) {
            if(users[0].pass == req.cookies['pass']) {
                connection.query("INSERT INTO pairs (first_pair, second_pair, user_id, value) VALUES ('" + req.body.first_pair + "', '" + req.body.second_pair + "', '" + req.cookies['id'] + "', '" + req.body.val + "')", function (error, result) {
                    if(result.insertId != 0) {
                        res.send(""+result.insertId+"");
                    } else {
                        res.send('0');
                    }
                });
            } else {
                res.cookie('id', "", {maxAge:0,httpOnly:true});
                res.cookie('login', "", {maxAge:0,httpOnly:true});
                res.cookie('pass', "", {maxAge:0,httpOnly:true});
                res.send("0");
            }
        } else {
            res.cookie('id', "", {maxAge:0,httpOnly:true});
            res.cookie('login', "", {maxAge:0,httpOnly:true});
            res.cookie('pass', "", {maxAge:0,httpOnly:true});
            res.send('0');
        }
    });
});

app.post("/delete_pair",function (req, res) {
    connection.query("SELECT pass FROM users WHERE id='"+req.cookies['id']+"'", function (error, users) {
        if(users != "" && users != undefined) {
            if(users[0].pass == req.cookies['pass']) {
                connection.query("DELETE FROM pairs WHERE id='"+req.body.id+"' and user_id='"+req.cookies['id']+"'" , function (error, result) {
                    if(result != false) {
                        res.send('1');
                    } else {
                        res.send('0');
                    }
                });
            } else {
                res.cookie('id', "", {maxAge:0,httpOnly:true});
                res.cookie('login', "", {maxAge:0,httpOnly:true});
                res.cookie('pass', "", {maxAge:0,httpOnly:true});
                res.send("0");
            }
        } else {
            res.cookie('id', "", {maxAge:0,httpOnly:true});
            res.cookie('login', "", {maxAge:0,httpOnly:true});
            res.cookie('pass', "", {maxAge:0,httpOnly:true});
            res.send('0');
        }
    });
});

app.post("/notify",function (req, res) {
    connection.query("SELECT login,pass,alias FROM users WHERE id='"+req.cookies['id']+"'", function (error, users) {
        if(users != "" && users != undefined) {
            if(users[0].pass == req.cookies['pass']) {

                sms.sms_send({to: users[0].login,text: req.body.first_pair + " в " + req.body.second_pair + " " + req.body.second_pair + "=" + req.body.value}, function(e){
                    console.log(e.description);
                });
                
                res.send("1");
            } else {
                res.cookie('id', "", {maxAge:0,httpOnly:true});
                res.cookie('login', "", {maxAge:0,httpOnly:true});
                res.cookie('pass', "", {maxAge:0,httpOnly:true});
                res.send("0");
            }
        } else {
            res.cookie('id', "", {maxAge:0,httpOnly:true});
            res.cookie('login', "", {maxAge:0,httpOnly:true});
            res.cookie('pass', "", {maxAge:0,httpOnly:true});
            res.send('0');
        }
    });
});

app.post("/registration_code", function (req, res) {

    connection.query("SELECT login FROM users WHERE login='"+req.body.phone+"'", function (error, login) {
        
        if(login == "" || login == undefined) {

            var code = Math.floor(Math.random()*90000) + 10000;
            
            sms.sms_send({to: req.body.phone,text: code.toString()}, function(e){
                 console.log(e.description);
            });
            
            var hashedCode = passwordHash.generate(code.toString());
            
            res.cookie('code', hashedCode, {maxAge:300000,httpOnly:true});
            
            console.log(req.cookies);
            
            res.send('1');
        } else {
            console.log(login);
            res.send('0');
        }
    });
});

app.post("/code_check", function (req, res) {

    if(passwordHash.verify(req.body.checkCode, req.cookies['code'])) {
        res.cookie('code', true, {maxAge:300000,httpOnly:true});
        res.send('1');
    } else {
        res.send('0');
    }
}); 

app.post("/registration", function (req, res) {
    
    console.log(req.cookies['code']);

    if(req.cookies['code'] == 'true') {

        var hashedpass = passwordHash.generate((req.body.pass).toString());
    
        connection.query("INSERT INTO users (login, pass, alias) VALUES ('" + req.body.phone + "', '" + hashedpass + "', '" + req.body.alias + "')", function (error, result) {
            if(result.insertId != 0) {
                res.cookie('code', "", {maxAge:0,httpOnly:true});
                res.cookie('id', result.insertId, {maxAge:3600000,httpOnly:true});
                res.cookie('login', req.body.phone, {maxAge:3600000,httpOnly:true});
                res.cookie('pass', hashedpass, {maxAge:3600000,httpOnly:true});
                res.sendStatus(200);
            } else {
                res.send('0');
            }
        });
    } else {
        res.send('Error');
    }
}); 

app.get("/exit", function (req, res) {
    
    res.cookie('id', "", {maxAge:0,httpOnly:true});
    res.cookie('login', "", {maxAge:0,httpOnly:true});
    res.cookie('pass', "", {maxAge:0,httpOnly:true});

    res.sendStatus(200);
}); 

var server = app.listen(PORT, ()=>console.log("Server started"));      