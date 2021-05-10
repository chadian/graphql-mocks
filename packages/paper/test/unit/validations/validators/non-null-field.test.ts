import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../../src/utils/create-document';
import { nonNullFieldValidator } from '../../../../src/validations/validators/non-null-field';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws on a graphql non-null list [Person]! field containing a null', () => {
  const graphqlSchema = buildTestSchema(`
      friends: [Person]!
    `);

  const document = createDocument('Person', {
    friends: null,
  });

  expect(() =>
    nonNullFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'friends',
      }),
    ),
  ).to.throw(
    'The field "friends" represents a graphql "[Person]! (non-null)" type and on the document should be a non-null, but got null',
  );
});

it('throws on a graphql non-null field mismatch', () => {
  const graphqlSchema = buildTestSchema(`
    name: String!
  `);

  const document = createDocument('Person', {
    name: null,
  });

  expect(() =>
    nonNullFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'name',
      }),
    ),
  ).to.throw(
    'The field "name" represents a graphql "String! (non-null)" type and on the document should be a non-null, but got null',
  );
});
