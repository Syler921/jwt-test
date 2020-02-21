require('dotenv').config()



const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const axios = require('axios').default;
//import * as util from 'util' // has no default export
// or 
var util = require('util')

const 
    passport          =     require('passport')
  , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , config            =     require('./configFBPassport')
  //, mysql             =     require('mysql');



console.log('config---',config)
app.use(express.json())

let refreshTokens = []
let logoutedTokens = [];

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  //res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});


const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]

var users = [
  {
    username: 'SC2',
    userid:'testid',
    password:'null',
    name: 'test name',
    email:'test@abv.bg'
  },
  {
    username: 'Stefan Cankov',
    userid:'3501069813253120',
    password:'null',
    name: 'test name',
    email:'test@abv.bg'
  },
  {
    username: 'sc',
    userid:'fbid',
    password:'sc',
    name: 'test name ',
    email:'test2@abv.bg'
  }
]

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
 


app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts)
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  console.log('token---',token)
  console.log(logoutedTokens)
  console.log(logoutedTokens.includes(token))
  console.log('logoutedTokens[token]---',logoutedTokens[token])
  if (token == null || logoutedTokens.includes(token) == true ) return res.sendStatus(403) // forbidden

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //console.log(err)
    if (err) return res.sendStatus(401) // Unauthorized
    req.user = user
    next()
  })
}


app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.refresh_token)
  
  if ( logoutedTokens.includes(req.body.token) == false ) {
    logoutedTokens.push(req.body.token);
  }
  console.log('test ---- ',logoutedTokens)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User

  var username = req.body.username
  var password = req.body.password
  var userid = req.body.userid
  //console.log('username',username)
  console.log(username + "----" +  password + '----' + userid)
  var user = null;
  for( var i = 0; i < users.length; i++) {
    console.log(username == users[i].username)
    console.log(username + ' //// name ' + users[i].username)
    console.log(userid == users[i].userid)
    console.log(userid + ' //// id ' + users[i].userid)
    if ( 
      (username == users[i].username && password == users[i].password) 
      ||  
      ( username == users[i].username && userid == users[i].userid ) 
    ) {
      user = users[i];
    }
    
  }
  console.log(user)
  if ( (user && username !== "" && password !== "") ) {
    console.log(user)
    var accessToken = generateAccessToken(user)
    var refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1111000' })
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
  }
  else { 
    res.json({ error : 'user not found' }) 
  }
})

function generateAccessToken(user) {
  return jwt.sign( { name: user.name ,mutatePayload:true}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10000' })
}

// ---------------------------- FB Login implementation 





//Define MySQL parameter in Config.js file.
// const pool = mysql.createPool({
//   host     : config.host,
//   user     : config.username,
//   password : config.password,
//   database : config.database
// });

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log('here---')
      //Check whether the User exists or not using profile.id
      console.log(accessToken)
      console.log(refreshToken)
      console.log(profile)
      
      if(config.use_database) {
        // if sets to true
        // pool.query("SELECT * from user_info where user_id="+profile.id, (err,rows) => {
        //   if(err) throw err;
        //   if(rows && rows.length === 0) {
        //       console.log("There is no such user, adding now");
        //       pool.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
        //   } else {
        //       console.log("User already exists in database");
        //   }
        // });
      }
      return done(null, profile);
    });
  }
));


app.set('views','C:/JWT_server/VUE JWT/my-jwt/servers/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ 
  secret: 'keyboard cat', 
  key: 'sid',
  resave: true,
  saveInitialized: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(express.static(__dirname + '/public'));

//app.get('/', function(req, res){
 // res.render('index', { user: req.user });
//});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));


app.get('/auth/facebook/callback',
  
  passport.authenticate('facebook', { }),
  function(req, res, next) {
    
    console.log('fb  callback ????')
    console.log('redirectg ? ')

    //console.log(util.inspect(res))
    //console.log('essss',res.sessionStore)
    //res.render('account', { user: res.sessionStore });
     //res.render({ user: req.user })
    console.log('ioser !!! ',req.user['_json'].id)
    console.log('ioser !!! ',req.user['_json'].name)
    
    //http://localhost:4000/login
    //Content-Type: application/json
    //
    //{
    //  "username": "Jim"
    //}
    console.log(1)

    //res.cookie('accessToken',req.user['_json'].id, { maxAge: 900000, httpOnly: false });
    //res.cookie('refreshToken',req.user['_json'].name, { maxAge: 900000, httpOnly: false });
      //res.json({
      //  accessToken:response.data.accessToken,
      //  refreshToken:response.data.refreshToken
     // })
    //res.redirect('http://localhost:8080');
    
    axios.post('http://localhost:4000/login', {
      'username': req.user['_json'].name,
      'password':'not needed',
      'userid': req.user['_json'].id
    })
    .then(function (response) {
      console.log(2)

      console.log(response.data);
      res.cookie('accessToken',response.data.accessToken, { maxAge: 900000, httpOnly: false });
      res.cookie('refreshToken',response.data.refreshToken, { maxAge: 900000, httpOnly: false });
      //res.json({
      //  accessToken:response.data.accessToken,
      //  refreshToken:response.data.refreshToken
     // })
      res.redirect('http://localhost:8080');
      //next()
    })
    .catch(function (error) {
      //console.log(error);
      res.sendStatus(204)
    });


    //res.sendStatus(204)
    //console.log(res)
   // res.json(util.inspect(res))
   // res.redirect('/');
   //next();
  });

app.get('/logoutFB', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}



app.listen(4000)