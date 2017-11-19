import React from 'react';
import {jsonServerRestClient, Admin, Resource} from 'admin-on-rest';
import {PostList} from './posts';

const App = () => (
  <Admin restClient={jsonServerRestClient('http://jsonplaceholder.typicode.com')}>
    <Resrouce name="posts" list={PostList} />
  </Admin>
);

export default App;
