import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../../src/utils/create-document';
import { buildTestSchema } from '../test-helpers';
import { exclusiveDocumentFieldsOnType } from '../../../../src/validations/validators/exclusive-document-fields-on-type';
import { createDocumentStore } from '../../../../src/utils/create-document-store';

it('throws if the document has a field that does not exist on the graphql type', () => {
  const graphqlSchema = buildTestSchema(`
      name: String
    `);

  const document = createDocument('Person', {
    name: 'Jerry',
    age: 25,
  });

  expect(() =>
    exclusiveDocumentFieldsOnType.validate({
      store: createDocumentStore(),
      graphqlSchema,
      document,
      type: graphqlSchema.getType('Person') as GraphQLObjectType,
    }),
  ).to.throw('The field "age" does not exist on the type Person.');
});
