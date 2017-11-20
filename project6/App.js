import React from 'react';
import {jsonServerRestClient, Admin, Resource, Delete, fetchUtils} from 'admin-on-rest';
//import {StudentList, StudentEdit, StudentCreate} from './students';
import {GradeList, GradeEdit, GradeCreate} from './grades';
//import authClient from './authClient';
//import myApiRestClient from './restClient';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json',  });})
  }/*
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Basic ${token}`);*/
  return fetchUtils.fetchJson(url, options);
}

const restClient = jsonServerRestClient('http://54.200.82.249:3001', httpClient);

const App = () => (
  <Admin restClient={restClient}>
    <Resource name="grades" list={GradeList} edit={GradeEdit} create={GradeCreate} remove={Delete}/>
  </Admin>
);

export default App;
