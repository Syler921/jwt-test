<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    TEST
  </div>
</template>

<script>


import axios from 'axios';
import { Promise } from "es6-promise";
import { TokenStorage } from "../services/LocalStorageService.js";




  


export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted(){
    axios.interceptors.response.use( (response) => {
      // Return a successful response back to the calling service
      return response;
    }, (error) => {
      // Return any error which is not due to authentication back to the calling service
      if (error.response.status !== 401) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }

      // Logout user if token refresh didn't work or user is disabled
      if (error.config.url == '/api/token/refresh' || error.response.message == 'Account is disabled.') {
        
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
    })
    .catch(function (error) {
      console.log(error);
    });
   


  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
