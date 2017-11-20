import React from 'react';
import { Filter, Responsive, List, SimpleList, Edit, Create, Datagrid, TextField, EditButton, DeleteButton, DisabledInput, SimpleForm, TextInput} from 'admin-on-rest';

export const StudentList = (props) => (
  <List {...props} filters={<StudentFilter />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const StudentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <DisabledInput source="id" />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const StudentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

const StudentFilter = (props) => (
  <Filter {...props}>
    <TextInput source="id" />
    <TextInput source="name" />
  </Filter>
);
