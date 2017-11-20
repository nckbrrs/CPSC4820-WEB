import React from 'react';
import { Responsive, List, SimpleList, Edit, Create, Datagrid, ReferenceField, TextField, EditButton, DeleteButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput} from 'admin-on-rest';

export const StudentsList = (props) => (
  <List {...props}>
    <Responsive
      small={
        <SimpleList
          primaryText={record => record.id}
          secondaryText={record => record.name}
        />
      }
      medium={
        <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
        </Datagrid>
      }
    />
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
