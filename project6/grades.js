import React from 'react';
import { Responsive, List, SimpleList, Edit, Create, Datagrid, TextField, EditButton, DeleteButton, DisabledInput, ReferenceInput, SelectInput, SimpleForm, TextInput, Filter, ReferenceField} from 'admin-on-rest';

export const GradeList = (props) => (
  <List {...props} filters={<GradeFilter />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="type" />
      <TextField source="grade" />
      <TextField source="max" />
      <TextField source="studentId" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const GradeEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <DisabledInput label="id" source="id" />
      <TextInput source="studentId" />
      <TextInput source="type" />
      <TextInput source="grade" />
      <TextInput source="max" />
    </SimpleForm>
  </Edit>
);

export const GradeCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="studentId" />
      <TextInput source="type" />
      <TextInput source="grade" />
      <TextInput source="max" />
    </SimpleForm>
  </Create>
);

const GradeFilter = (props) => (
  <Filter {...props}>
    <TextInput source="studentId" />
    <TextInput source="type" />
    <TextInput source="grade" />
    <TextInput source="max" />
  </Filter>
);
