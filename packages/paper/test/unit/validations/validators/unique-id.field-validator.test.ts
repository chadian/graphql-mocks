import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../../src/utils/create-document';
import { createDocumentStore } from '../../../../src/utils/create-document-store';
import { uniqueIdFieldValidator } from '../../../../src/validations/validators/unique-id';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws with duplicates ids from the same type', () => {
  const graphqlSchema = buildTestSchema(`
    id: ID!
    name: String!
  `);

  const potato = createDocument('Person', {
    id: '1',
    name: 'Potato',
  });

  const carrot = createDocument('Person', {
    id: '1',
    name: 'Carrot',
  });

  const store = createDocumentStore();
  store.Person = [potato, carrot];

  expect(() =>
    uniqueIdFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document: potato,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'id',
        store,
      }),
    ),
  ).to.throw(
    `Found duplciate documents with same ID ("1") for type "Person" on field "id":

{
  "id": "1",
  "name": "Potato"
}

{
  "id": "1",
  "name": "Carrot"
}"`,
  );
});
