/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { embed, GraphQLHandler } from 'graphql-mocks';
import { relayWrapper } from 'graphql-mocks/relay';
import { Model, Server, hasMany } from 'miragejs';
import { expect } from 'chai';
import { mirageMiddleware, mirageCursorForNode } from '../../src';

const schemaString = `
  schema {
    query: Query
  }

  type Query {
    person: Person!
  }

  type PersonConnection {
    pageInfo: PageInfo!
    edges: [PersonEdge!]!
  }

  type PersonEdge {
    cursor: String!
    node: Person!
  }

  type PageInfo {
    startCursor: String!
    endCursor: String!
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type Person {
    name: String!
    friends(first: Int, last: Int, before: String, after: String): PersonConnection!
  }
`;

describe('integration/mirage-relay', function () {
  let mirageServer: Server;
  let handler: GraphQLHandler;

  beforeEach(async function () {
    mirageServer = new Server({
      models: {
        person: Model.extend({
          friends: hasMany('person'),
        }),
      },
    });

    const rootFriends = [
      mirageServer.schema.create<any, any, any>('person', {
        name: 'Darth Vader',
      }),
      mirageServer.schema.create<any, any, any>('person', {
        name: 'Princess Leia',
      }),
      mirageServer.schema.create<any, any, any>('person', {
        name: 'R2-D2',
      }),
      mirageServer.schema.create<any, any, any>('person', {
        name: 'Greedo',
      }),
    ];

    const rootPerson = mirageServer.schema.create<any, any, any>('person', {
      name: 'Rooty',
      friends: rootFriends,
    });

    handler = new GraphQLHandler({
      resolverMap: {
        Query: {
          person: (): unknown => rootPerson,
        },
      },
      middlewares: [mirageMiddleware(), embed({ wrappers: [relayWrapper({ cursorForNode: mirageCursorForNode })] })],
      dependencies: {
        mirageServer,
        graphqlSchema: schemaString,
      },
    });
  });

  afterEach(function () {
    (mirageServer as any) = null;
    (handler as any) = null;
  });

  describe('field query relay pagination', function () {
    it('automatically relay paginates all models from a relationship', async function () {
      const result = await handler.query(`{
        person {
          name
          friends {
            edges {
              cursor
              node {
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      }`);

      expect((result.data as any)?.person.name).to.equal('Rooty');
      expect((result.data as any)?.person.friends.edges).to.deep.equal([
        {
          cursor: 'model:person(1)',
          node: {
            name: 'Darth Vader',
          },
        },
        {
          cursor: 'model:person(2)',
          node: {
            name: 'Princess Leia',
          },
        },
        {
          cursor: 'model:person(3)',
          node: {
            name: 'R2-D2',
          },
        },
        {
          cursor: 'model:person(4)',
          node: {
            name: 'Greedo',
          },
        },
      ]);

      expect((result.data as any)?.person.friends.pageInfo).to.deep.equal({
        startCursor: 'model:person(1)',
        endCursor: 'model:person(4)',
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });
});
