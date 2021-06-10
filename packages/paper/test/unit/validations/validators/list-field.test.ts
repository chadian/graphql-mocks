import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { DOCUMENT_CONNECTIONS_SYMBOL } from '../../../../src/constants';
import { createDocument } from '../../../../src/document/create-document';
import { key as nullDocumentKey } from '../../../../src/document/null-document';
import { listFieldValidator } from '../../../../src/validations/validators/list-field';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws on a graphql list field mismatch', () => {
  const graphqlSchema = buildTestSchema(`
      friends: [Person!]
    `);

  const document = createDocument('Person', {
    friends: 'Not an Array, `friends` should be an array to match the graphql List type',
  });

  expect(() =>
    listFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'friends',
      }),
    ),
  ).to.throw(
    'The field "friends" represents a graphql "[Person!]" type and on the document should be a Array, but got string',
  );
});

it('throws on a graphql non-null item list [Person!] field containing a null', () => {
  const graphqlSchema = buildTestSchema(`
    friends: [Person!]
  `);

  const document = createDocument('Person', {
    friends: [{ name: 'Larry' }, null],
  });

  expect(() =>
    listFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'friends',
      }),
    ),
  ).to.throw(
    'The field "friends" represents a graphql "[Person!]" type and on the document should be a non-null list, but got null in the array',
  );
});

it('throws on a graphql non-null item list [Person!] field connected to a null document', () => {
  const graphqlSchema = buildTestSchema(`
    friends: [Person!]
  `);

  const document = createDocument('Person', {
    [DOCUMENT_CONNECTIONS_SYMBOL]: {
      friends: [nullDocumentKey],
    },
  });

  expect(() =>
    listFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'friends',
      }),
    ),
  ).to.throw(
    'The field "friends" represents a graphql "[Person!]" type and on the document should be a non-null list, but got connected null document',
  );
});
