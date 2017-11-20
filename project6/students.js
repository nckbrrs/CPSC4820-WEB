import React from 'react';
import { Responsive, List, SimpleList, Edit, Create, Datagrid, TextField, EditButton, DeleteButton, DisabledInput, SimpleForm, TextInput} from 'admin-on-rest';

export const StudentList = (props) => (
  <List {...props}>
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

/* FILTER ID AND NAME
const GradeFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput label="id" source="id" reference="grades" allowEmpty>
      <SelectInput optionText="id" />
    </ReferenceInput>
    <ReferenceInput label="type" source="type" reference="grades" allowEmpty>
      <SelectInput optionText="type" />
    </ReferenceInput>
  </Filter>
);
*/
