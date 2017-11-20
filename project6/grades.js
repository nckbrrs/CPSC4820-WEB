import React from 'react';
import { Responsive, List, SimpleList, Edit, Create, Datagrid, TextField, EditButton, DeleteButton, DisabledInput, ReferenceInput, SelectInput, SimpleForm, TextInput, Filter, ReferenceField} from 'admin-on-rest';

export const GradeList = (props) => (
  <List {...props} /*filters={<GradeFilter />}*/>
    <Responsive
      small={
        <SimpleList
          primaryText={record => record.id}
          secondaryText={record => record.type}
          tertiaryText={record => `${record.grade} / ${record.max}`}
        />
      }
      medium={
        <Datagrid>
          <TextField source="id" />
          <TextField source="type" />
          <TextField source="grade" />
          <TextField source="max" />
          <ReferenceField label="user" source="id" reference="students">
            <TextField source="id" />
          </ReferenceField>
          <EditButton />
          <DeleteButton />
        </Datagrid>
      }
    />
  </List>
);

export const GradeEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="type" />
      <TextInput source="grade" />
      <TextInput source="max" />
    </SimpleForm>
  </Edit>
);

export const GradeCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="type" />
      <TextInput source="grade" />
      <TextInput source="max" />
    </SimpleForm>
  </Create>
);

/* FILTER ID TYPE GRADE AND MAX
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
