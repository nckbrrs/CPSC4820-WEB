import React from 'react';
import {jsonServerRestClient, Admin, Resource, Delete} from 'admin-on-rest';
import {PostList, PostEdit, PostCreate} from './posts';
import {UserList} from './users';
import Dashboard from './Dashboard';
import authClient from './authClient';
import myApiRestClient from './restClient';

const App = () => (
  <Admin authClient={authClient} dashboard={Dashboard} restClient={myApiRestClient}>
    <Resource name="students" list={PostList} edit={PostEdit} create={PostCreate} remove={Delete}/>
    <Resource name="grades" list={UserList} />
  </Admin>
);

export default App;
