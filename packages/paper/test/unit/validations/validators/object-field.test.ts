import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../../src/utils/create-document';
import { objectFieldValidator } from '../../../../src/validations/validators/object-field';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws on a graphql object field mismatch', () => {
  const graphqlSchema = buildTestSchema(`
      bestFriend: Person
    `);

  const document = createDocument('Person', {
    bestFriend: 'This is a string but should be a Person object',
  });

  expect(() =>
    objectFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'bestFriend',
      }),
    ),
  ).to.throw(
    'The field "bestFriend" represents a graphql "Person" type and on the document should be a object, but got string',
  );
});
