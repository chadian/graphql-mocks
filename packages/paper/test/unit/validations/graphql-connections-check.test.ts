import { buildSchema } from 'graphql';
import { createDocument } from '../../../src/utils/create-document';
import { graphqlConnectionsCheck } from '../../../src/validations/graphql-connections-check';
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
  it('throws if graphql type does not exist in the schema', () => {
    const document = createDocument('Person', {});
    const graphqlSchema = buildTestSchema();

    expect(() =>
      graphqlConnectionsCheck({
        data: {},
        graphqlSchema,
        document,
        typename: 'NotATypeInTheSchema',
      }),
    ).to.throw('The type "NotATypeInTheSchema" does not exist in the the graphql schema.');
  });

  it('throws if the graphql type is not an object type', () => {
    const document = createDocument('Person', {});

    const graphqlSchema = buildTestSchema();
    expect(() => graphqlConnectionsCheck({ data: {}, graphqlSchema, document, typename: 'Food' })).to.throw(
      'The type "Food" is a EnumTypeDefinition but cannot be represented by a document',
    );
  });

  it('throws when a non-null field does not have a document value or connection value', () => {
    const graphqlSchema = buildTestSchema(`bestFriend: Person!`);

    const document = createDocument('Person', {});

    expect(() => graphqlConnectionsCheck({ data: {}, graphqlSchema, document, typename: 'Person' })).to.throw(
      'The field "bestFriend" represents a graphql "Person! (non-null)" type and on the document should be a non-null Person, but got undefined or null',
    );
  });

  it('throws when multiple connections exist for a non-list singular connection', () => {
    const graphqlSchema = buildTestSchema(`bestFriend: Person!`);

    const steve = createDocument('Person', {
      name: 'Steve Prefontaine',
    });

    const bill = createDocument('Person', {
      name: 'Bill Bowerman',
    });

    const phil = createDocument('Person', {
      name: 'Phil Knight',
    });

    connectDocument(steve, 'bestFriend', bill);
    connectDocument(steve, 'bestFriend', phil);

    expect(() => graphqlConnectionsCheck({ data: {}, graphqlSchema, document: steve, typename: 'Person' })).to.throw(
      'Multiple connections can only exist for fields with a list return type. Field bestFriend on Person has a singular return type of Person',
    );
  });
});
