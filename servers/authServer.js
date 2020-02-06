require('dotenv').config()



const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')



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


app.get('/', function(req, res) {
  res.sendfile('servers/index.html');
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

  const username = req.body.username
  console.log('username',username)
  const user = { name: 'test' }

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '11000' })
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
  return jwt.sign( { name: user.name ,mutatePayload:true}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10000' })
}

// ---------------------------- FB Login implementation 

passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret:config.facebook_api_secret ,
  callbackURL: config.callback_url
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    //Check whether the User exists or not using profile.id
    if(config.use_database) {
       //Further code of Database.
    }
    return done(null, profile);
  });
}
));



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


app.set('views', __dirname + '/views');
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
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    console.log('redirectg ? ')
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}



app.listen(4000)