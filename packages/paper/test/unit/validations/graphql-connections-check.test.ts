import { buildSchema, GraphQLObjectType } from 'graphql';
import { createDocument } from '../../../src/utils/create-document';
import { graphqlTypeCheck } from '../../../src/validations/graphql-type-check';
import { expect } from 'chai';
import { connectDocument } from '../../../src/utils/connect-document';

function buildTestSchema(personFields?: string) {
  personFields = personFields ?? `name: String`;

  const schemaString = `
    schema {
      query: Query
    }

    type Query {
      person: Person
    }

    type Person {
      ${personFields}
    }

    enum Food {
      PIZZA
      POTATOES
      CEREAL
    }
  `;

  return buildSchema(schemaString);
}

describe('graphql-connections-check', () => {
  it('throws when multiple connections exist for a non-list singular connection', () => {
    const graphqlSchema = buildTestSchema(`bestFriend: Person!`);

    const steve = createDocument('Person', {});
    const bill = createDocument('Person', {});
    const phil = createDocument('Person', {});

    connectDocument(steve, 'bestFriend', bill);
    connectDocument(steve, 'bestFriend', phil);

    expect(() =>
      graphqlTypeCheck.validate({
        data: {},
        graphqlSchema,
        document: steve,
        type: graphqlSchema.getType('Person') as GraphQLObjectType,
      }),
    ).to.throw(
      'Multiple connections can only exist for fields with a list return type. Field bestFriend on Person has a singular return type of Person',
    );
  });
});
