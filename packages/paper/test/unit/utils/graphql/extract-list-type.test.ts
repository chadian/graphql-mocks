import { buildSchema, GraphQLObjectType } from 'graphql';
import { extractListType } from '../../../../src/utils/graphql/extract-list-type';
import { expect } from 'chai';

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
  `;

  return buildSchema(schemaString);
}

describe('extract-list-type', () => {
  it('extracts list type from a non-null wrapper', () => {
    const schema = buildTestSchema(`friends: [Person]!`);
    const friendsField = (schema.getType('Person') as GraphQLObjectType).getFields()?.friends;
    expect(extractListType(friendsField.type)?.ofType.name).to.equal('Person');
  });

  it('extracts list type from a list type', () => {
    const schema = buildTestSchema(`friends: [Person]`);
    const friendsField = (schema.getType('Person') as GraphQLObjectType).getFields()?.friends;
    expect(extractListType(friendsField.type)?.ofType.name).to.equal('Person');
  });
});
