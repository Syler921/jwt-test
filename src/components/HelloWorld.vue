<template>
  <div class="hello">

    <a href="http://localhost:4000/auth/facebook">Login Facebook *** </a>
    <a href="http://localhost:4000/logoutFB">Logout Facebook</a>
    <h1>{{ msg }}</h1>
    <div class="login">
     
        <img class="mb-4" src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72">
        <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required="" autofocus="">
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" required="">
        <div class="checkbox mb-3">
          <label>
            <input type="checkbox" value="remember-me"> Remember me
          </label>
        </div>
        <button class="btn btn-lg btn-primary btn-block" @click="login()">Login</button>
        <a class="btn btn-lg btn-primary btn-block" href="http://localhost:4000/auth/facebook">Login with FB</a>
        <p class="mt-5 mb-3 text-muted">© 2017-2018</p>
      
    </div>
  </div>
</template>

<script>


import axios from 'axios';
import { Promise } from "es6-promise";
import { TokenStorage } from "../services/LocalStorageService.js";

import jwt_decode from 'jwt-decode';

  


export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods:{
    getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    simulateWork(){
        var jwtDecode = require('jwt-decode');
       setInterval(()=> {
        
          const config = {
              headers: { 
                Authorization: `Bearer ${TokenStorage.getToken()}`,
                'Access-Control-Allow-Origin': '*'
              }
          }          
            

          const bodyParameters = {
            key: "value"
          };


          const AuthStr = 'Bearer '.concat(TokenStorage.getToken()); 


          console.log('jwtDecode,',jwtDecode(TokenStorage.getToken()))
          var test = jwtDecode(TokenStorage.getToken());

          var decoded = jwt_decode(TokenStorage.getToken());
            console.log('***',decoded);

          axios.get('http://localhost:4000/posts', { headers: { Authorization: AuthStr } })
          .then(response => {
              // If request is good...
              console.log(response);
            })
          .catch((error) => {
              console.log('error ' + error);
            });


        },3000)
    },
    login(){
      var jwtDecode = require('jwt-decode');
      var username = document.getElementById('inputEmail').value
      var password = document.getElementById('inputPassword').value

      axios.post('http://localhost:4000/login', {
          username: username,
          password: password
        })
      .then(function (response) {
        console.log(response);
        console.log('response.data.accessToken-----',response.data.accessToken)
        TokenStorage.storeToken(response.data.accessToken)
        TokenStorage.storeRefreshToken(response.data.refreshToken)
        
      
       
      }).catch(function(err){
        console.log(err)
      });
    }
  },
  mounted(){
    //console.warn('coookie ??? ----', this.getCookie('accessToken'))
   



    axios.interceptors.response.use( (response) => {
      // Return a successful response back to the calling service
      return response;
    }, (error) => {
      console.warn(error)
      // Return any error which is not due to authentication back to the calling service
      if (error.response.status !== 401) {
        return new Promise((resolve, reject) => {
          console.log('error.config.url---',error.config.url)
          console.warn('greshen error handler',error)
          reject(error);
        });
      }

      // Logout user if token refresh didn't work or user is disabled
      if (error.config.url == 'http://localhost:4000/token' || error.response.message == 'Account is disabled.') {
        
        TokenStorage.clear();
        //router.push({ name: 'root' });
        console.log('redirect to root ')

        return new Promise((resolve, reject) => {
          reject(error);
        });
      }

      // Try request again with new token
      return TokenStorage.getNewToken()
        .then((token) => {

          // New request with new token
          const config = error.config;
          config.headers['Authorization'] = `Bearer ${token}`;

          return new Promise((resolve, reject) => {
            axios.request(config).then(response => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            })
          });

        })
        .catch((error) => {
          Promise.reject(error);
        });
    });


    var accessTokenFromCookie = this.getCookie('accessToken')
    var refreshTokenFromCookie =  this.getCookie('refreshToken')
    
     
    if ( accessTokenFromCookie != "" && refreshTokenFromCookie != "" ) {
      console.log('empty ??? ')
      TokenStorage.storeToken(accessTokenFromCookie)
      TokenStorage.storeToken(refreshTokenFromCookie)
      this.simulateWork();
    }
    /*
    var jwtDecode = require('jwt-decode');
    axios.interceptors.response.use( (response) => {
      // Return a successful response back to the calling service
      return response;
    }, (error) => {
      console.warn(error)
      // Return any error which is not due to authentication back to the calling service
      if (error.response.status !== 401) {
        return new Promise((resolve, reject) => {
          console.log('error.config.url---',error.config.url)
          console.warn('greshen error handler',error)
          reject(error);
        });
      }

      // Logout user if token refresh didn't work or user is disabled
      if (error.config.url == 'http://localhost:4000/token' || error.response.message == 'Account is disabled.') {
        
        TokenStorage.clear();
        //router.push({ name: 'root' });
        console.log('redirect to root ')

        return new Promise((resolve, reject) => {
          reject(error);
        });
      }

      // Try request again with new token
      return TokenStorage.getNewToken()
        .then((token) => {

          // New request with new token
          const config = error.config;
          config.headers['Authorization'] = `Bearer ${token}`;

          return new Promise((resolve, reject) => {
            axios.request(config).then(response => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            })
          });

        })
        .catch((error) => {
          Promise.reject(error);
        });
    });

    
    axios.post('http://localhost:4000/login', {
      firstName: 'Fred',
      lastName: 'Flintstone'
    })
    .then(function (response) {
      console.log(response);
      console.log('response.data.accessToken-----',response.data.accessToken)
      TokenStorage.storeToken(response.data.accessToken)
      TokenStorage.storeRefreshToken(response.data.refreshToken)
      
     
      setInterval(()=> {
        function getCookie(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        }
       console.warn('coookie ??? ----', getCookie('accessToken'))
      console.warn('coookie ??? ----', getCookie('refreshToken'))
       
        const config = {
            headers: { 
              Authorization: `Bearer ${TokenStorage.getToken()}`,
              'Access-Control-Allow-Origin': '*'
            }
        }          
           

        const bodyParameters = {
          key: "value"
        };


        const AuthStr = 'Bearer '.concat(TokenStorage.getToken()); 


         console.log('jwtDecode,',jwtDecode(TokenStorage.getToken()))
         var test = jwtDecode(TokenStorage.getToken());

         var decoded = jwt_decode(TokenStorage.getToken());
console.log('***',decoded);

        axios.get('http://localhost:4000/posts', { headers: { Authorization: AuthStr } })
        .then(response => {
            // If request is good...
            console.log(response);
          })
        .catch((error) => {
            console.log('error ' + error);
          });


      },3000)
   


    })
    .catch(function(err){
      console.log(err)
    });
    */
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login { 
  width:400px
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
