import React from 'react';
import {jsonServerRestClient, Admin, Resource, Delete} from 'admin-on-rest';
import {StudentList, StudentEdit, StudentCreate} from './students';
import {GradeList, GradeEdit, GradeCreate} from './grades';
//import authClient from './authClient';
//import myApiRestClient from './restClient';

const App = () => (
  <Admin /*authClient={authClient}*/ restClient={jsonServerRestClient('http://54.200.82.249:3001')}>
    <Resource name="students" list={StudentList} edit={StudentEdit} create={StudentCreate} remove={Delete}/>
    <Resource name="grades" list={GradeList} edit={GradeEdit} create={GradeCreate} remove={Delete}/>
  </Admin>
);

export default App;
