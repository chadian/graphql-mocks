import { buildSchema } from 'graphql';
import { createDocument } from '../../../src/utils/create-document';
import { graphqlTypeCheck } from '../../../src/validations/graphql-type-check';
import { expect } from 'chai';
import { connectDocument } from '../../../src/utils/connect-document';

function buildTestSchema(personTypeSchema = 'name: String') {
  const schemaString = `
  schema {
    query: Query
  }

  type Query {
    person: Person
  }

  type Person {
    ${personTypeSchema}
  }

  enum Food {
    PIZZA
    POTATOES
    CEREAL
  }
`;

  return buildSchema(schemaString);
}

describe('graphql-type-check', () => {
  it('throws if graphql type does not exist in the schema', () => {
    const graphqlSchema = buildTestSchema();
    const document = createDocument('Person', {});
    expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'NotATypeInTheSchema' })).to.throw(
      'The type "NotATypeInTheSchema" does not exist in the the graphql schema.',
    );
  });

  it('throws if the graphql type is not an object type', () => {
    const graphqlSchema = buildTestSchema();
    const document = createDocument('Person', {});

    expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Food' })).to.throw(
      'The type "Food" is a EnumTypeDefinition but cannot be represented by a document',
    );
  });

  it('throws if the document has a field that does not exist on the graphql type', () => {
    const graphqlSchema = buildTestSchema(`
      name: String
    `);

    const document = createDocument('Person', {
      name: 'Jerry',
      age: 25,
    });

    expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
      'The field "age" does not exist on the type Person.',
    );
  });

  context('connections', () => {
    it('throws if the document has a document connection and js property value for the same field', () => {
      const graphqlSchema = buildTestSchema(`
        bestFriend: Person
      `);

      const document = createDocument('Person', {
        bestFriend: 'Larry',
      });

      connectDocument(document, 'bestFriend', createDocument('Person', { name: 'Larry' }));

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "bestFriend" on Person cannot be represented by both a Document connection and javascript value',
      );
    });

    it('passes checks with fields without a js property value and are handled by connections', () => {
      const graphqlSchema = buildTestSchema(`
        bestFriend: Person
      `);

      const document = createDocument('Person', {});
      connectDocument(document, 'bestFriend', createDocument('Person', { name: 'Larry' }));
      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.not.throw();
    });
  });

  describe('when the graphql field type and document field mismatch', () => {
    it('throws on a graphql object field mismatch', () => {
      const graphqlSchema = buildTestSchema(`
        bestFriend: Person
      `);

      const document = createDocument('Person', {
        bestFriend: 'This is a string but should be a Person object',
      });

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "bestFriend" represents a graphql "Person" type and on the document should be a object, but got string',
      );
    });

    it('throws on a graphql list field mismatch', () => {
      const graphqlSchema = buildTestSchema(`
        friends: [Person!]
      `);

      const document = createDocument('Person', {
        friends: 'Not an Array, `friends` should be an array to match the graphql List type',
      });

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
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

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "friends" represents a graphql "[Person!]" type and on the document should be a non-null list, but got null in the array',
      );
    });

    it('throws on a graphql non-null list [Person]! field containing a null', () => {
      const graphqlSchema = buildTestSchema(`
        friends: [Person]!
      `);

      const document = createDocument('Person', {
        friends: null,
      });

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "friends" represents a graphql "[Person]! (non-null)" type and on the document should be a non-null, but got null',
      );
    });

    it('throws on a graphql scalar field mismatch', () => {
      const graphqlSchema = buildTestSchema(`
        donutsEaten: Int
      `);

      const document = createDocument('Person', {
        donutsEaten: {
          /* `donutsEaten` should be an Int, not an object */
        },
      });

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "donutsEaten" represents a graphql "Int" type and on the document should be a boolean, number, string, but got object',
      );
    });

    it('throws on a graphql non-null field mismatch', () => {
      const graphqlSchema = buildTestSchema(`
        name: String!
      `);

      const document = createDocument('Person', {
        name: null,
      });

      expect(() => graphqlTypeCheck({ graphqlSchema, document, typename: 'Person' })).to.throw(
        'The field "name" represents a graphql "String! (non-null)" type and on the document should be a non-null, but got null',
      );
    });
  });
});
