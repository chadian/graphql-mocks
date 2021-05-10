import { expect } from 'chai';
import { GraphQLObjectType } from 'graphql';
import { connectDocument } from '../../../../src/utils/connect-document';
import { createDocument } from '../../../../src/utils/create-document';
import { multipleConnectionsForNonListField } from '../../../../src/validations/validators/multiple-connections-for-non-list-field';
import { buildTestSchema, createMockFieldValidatorOptions } from '../test-helpers';

it('throws when multiple connections exist for a non-list singular connection', () => {
  const graphqlSchema = buildTestSchema(`bestFriend: Person!`);

  const steve = createDocument('Person', {});
  const bill = createDocument('Person', {});
  const phil = createDocument('Person', {});

  connectDocument(steve, 'bestFriend', bill);
  connectDocument(steve, 'bestFriend', phil);

  expect(() =>
    multipleConnectionsForNonListField.validate(
      createMockFieldValidatorOptions({
        graphqlSchema,
        document: steve,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
        fieldName: 'bestFriend',
      }),
    ),
  ).to.throw(
    'Multiple connections can only exist for fields with a list return type. Field bestFriend on Person has a singular return type of Person',
  );
});
