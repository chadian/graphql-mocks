import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { connectDocument } from '../../../../src/utils/connect-document';
import { createDocument } from '../../../../src/utils/create-document';
import { exclusiveFieldOrConnectionValueForfield } from '../../../../src/validations/validators/exclusive-field-or-connection-value';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws if the document has a document connection and js property value for the same field', () => {
  const graphqlSchema = buildTestSchema(`
      bestFriend: Person
    `);

  const document = createDocument('Person', {
    bestFriend: 'Larry',
  });

  connectDocument(document, 'bestFriend', createDocument('Person', { name: 'Larry' }));

  expect(() =>
    exclusiveFieldOrConnectionValueForfield.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        fieldName: 'bestFriend',
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
      }),
    ),
  ).to.throw(
    'The field "bestFriend" on Person cannot be represented by both a Document connection and javascript value',
  );
});
