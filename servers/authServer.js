require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

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
  res.sendfile('index.html');
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
  console.log('check3333 ----',token == null || logoutedTokens.includes(token) == true )
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
  console.warn('check11 ---- !refreshTokens.includes(refreshToken --- ',!refreshTokens.includes(refreshToken))
  console.log('after 1 ?????? ')
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  console.log('after 2 ?????? ')
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    console.log('check 2-----',err)
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
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '12000' })
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
  return jwt.sign( { name: user.name ,mutatePayload:true}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3000' })
}

app.listen(4000)