import {AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'admin-on-rest';

export default (type, params) => {
  // called when the user attempts to log in
  if (type === AUTH_LOGIN) {
    const {username, password} = params;
    if (username === 'teacher' && password === 't1g3rTester!@#') {
      const token = btoa(username + ":" + password);
      localStorage.setItem('token', token);
      return Promise.resolve();
    }
    return Promise.reject();
  }

  // called when user clicks on logout button
  if (type === AUTH_LOGOUT) {
    localStorage.removeItem('token');
    return Promise.resolve();
  }

  // called when the API returns an error
  if (type === AUTH_ERROR) {
    const {status} = params;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  }

  // called when user navigates to a new location
  if (type === AUTH_CHECK) {
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  }

  return Promise.reject('Unknown method');
};
