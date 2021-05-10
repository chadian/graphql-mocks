import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { DOCUMENT_CONNECTIONS_SYMBOL } from '../../../../src/constants';
import { createDocument } from '../../../../src/utils/create-document';
import { key as nullDocumentKey } from '../../../../src/utils/null-document';
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

it('throws on a graphql non-null field connected to a null document', () => {
  const graphqlSchema = buildTestSchema(`
    bestFriend: Person!
  `);

  const document = createDocument('Person', {
    [DOCUMENT_CONNECTIONS_SYMBOL]: { bestFriend: [nullDocumentKey] },
  });

  expect(() =>
    nonNullFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'bestFriend',
      }),
    ),
  ).to.throw(
    'The field "bestFriend" represents a graphql "Person! (non-null)" type and on the document should be a non-null, but got null document',
  );
});
