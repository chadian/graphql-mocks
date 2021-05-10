import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../../src/utils/create-document';
import { scalarFieldValidator } from '../../../../src/validations/validators/scalar-field';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws on a graphql scalar field mismatch', () => {
  const graphqlSchema = buildTestSchema(`
      donutsEaten: Int
    `);

  const document = createDocument('Person', {
    donutsEaten: {
      /* `donutsEaten` should be an Int, not an object */
    },
  });

  expect(() =>
    scalarFieldValidator.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'donutsEaten',
      }),
    ),
  ).to.throw(
    'The field "donutsEaten" represents a graphql "Int" type and on the document should be a boolean, number, string, but got object',
  );
});
