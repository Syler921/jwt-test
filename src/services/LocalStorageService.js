import axios, { AxiosRequestConfig } from 'axios';
//import { ApiUrlService } from 'shared/services';
import { Promise } from 'es6-promise';

var TokenStorage = {

  LOCAL_STORAGE_TOKEN: 'token',
  LOCAL_STORAGE_REFRESH_TOKEN: 'refresh_token',

  isAuthenticated: function() {
    return TokenStorage.getToken() !== null;
  },

  getAuthentication: function() {
    return {
      headers: { 'Authorization': 'Bearer ' + TokenStorage.getToken() }
    };
  },

  getNewToken: function() {
    return new Promise((resolve, reject) => {
      axios
        .post('http://localhost:4000/token', { token: TokenStorage.getRefreshToken() })
        .then(response => {
            console.log('response ??? - --- ', response)
            TokenStorage.storeToken(response.data.accessToken);
            //TokenStorage.storeRefreshToken(response.data.refresh_token);

          resolve(response.data.accessToken);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  storeToken: function(token) {
    localStorage.setItem(TokenStorage.LOCAL_STORAGE_TOKEN, token);
  },

  storeRefreshToken: function(refreshToken) {
    localStorage.setItem(TokenStorage.LOCAL_STORAGE_REFRESH_TOKEN, refreshToken);
  },

clear: function() {
    localStorage.removeItem(TokenStorage.LOCAL_STORAGE_TOKEN);
    localStorage.removeItem(TokenStorage.LOCAL_STORAGE_REFRESH_TOKEN);
  },

  getRefreshToken: function() {
    return localStorage.getItem(TokenStorage.LOCAL_STORAGE_REFRESH_TOKEN);
  },

    getToken: function() {
    return localStorage.getItem(TokenStorage.LOCAL_STORAGE_TOKEN);
  }
}

export {TokenStorage}