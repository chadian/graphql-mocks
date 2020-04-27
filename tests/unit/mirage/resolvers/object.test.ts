import { mirageObjectResolver } from '../../../../src/mirage/resolvers/object';
import { generatePackOptions } from '../../../mocks';
import { GraphQLSchema, buildSchema, GraphQLNonNull, GraphQLString } from 'graphql';
import { expect } from 'chai';
import { Model, Server, belongsTo } from 'miragejs';
import { MirageGraphQLMapper } from '../../../../src/mirage/mapper';

describe('mirage/resolvers/object', function () {
  let schema: GraphQLSchema | undefined;

  const mirageServer = new Server({
    models: {
      user: Model.extend({
        favoriteMovie: belongsTo('movie'),
      }),
      movie: Model.extend({}),
    },
  });

  beforeEach(() => {
    schema = buildSchema(`
      type User {
        name: String!
        favoriteFood: String!
        favoriteMovie: Movie!
      }

      type Movie {
        name: String!
      }
    `);
  });

  afterEach(() => {
    schema = undefined;
  });

  it('resolves a simple scalar field from a parent', async function () {
    const user = mirageServer.create('user', {
      id: '1',
      name: 'George',
    });

    const context = {
      pack: generatePackOptions({ dependencies: { graphqlSchema: schema } }),
    };

    const info = {
      parentType: schema?.getType('User'),
      fieldName: 'name',
      returnType: new GraphQLNonNull(GraphQLString),
    };

    const result = mirageObjectResolver(user, {}, context, info);
    expect(result).to.equal('George');
  });

  it('resolves a field from a parent using a mapper', async function () {
    const user = mirageServer.create('user', {
      id: '1',
      name: 'George',
      foodPreference: 'Pizza',
    });

    const mapper = new MirageGraphQLMapper().add(['User', 'favoriteFood'], ['User', 'foodPreference']);

    const context = {
      pack: generatePackOptions({ dependencies: { graphqlSchema: schema, mapper } }),
    };

    const info = {
      parentType: schema?.getType('User'),
      fieldName: 'favoriteFood',
      returnType: new GraphQLNonNull(GraphQLString),
    };

    const result = mirageObjectResolver(user, {}, context, info);
    expect(result).to.equal('Pizza');
  });

  it('resolves a mirage relationship field from a parent', async function () {
    const starwars = mirageServer.create('movie', { id: '1', name: 'Star Wars: A New Hope' });
    const user = mirageServer.create('user', {
      id: '1',
      name: 'George',
      favoriteMovie: starwars,
    });

    const context = {
      pack: generatePackOptions({ dependencies: { graphqlSchema: schema } }),
    };

    const info = {
      parentType: schema?.getType('User'),
      fieldName: 'favoriteMovie',
      returnType: new GraphQLNonNull(schema?.getType('Movie')!),
    };

    const result = mirageObjectResolver(user, {}, context, info);
    expect(result.name).to.equal('Star Wars: A New Hope');
  });

  it('throws an error when a nullish result is returned for a non-null field', () => {
    const user = mirageServer.create('user', {
      id: '1',
    });

    const context = {
      pack: generatePackOptions({ dependencies: { graphqlSchema: schema } }),
    };

    const info = {
      parentType: schema?.getType('User'),
      fieldName: 'name',
      returnType: new GraphQLNonNull(GraphQLString),
    };

    expect(() => mirageObjectResolver(user, {}, context, info)).to.throw(
      'Failed to resolve field "name" on type "User". Tried to resolve the parent object model:user(1), with the following attrs: name',
    );
  });

  it('throws an error when the parent passed in is not an object', () => {
    const context = {
      pack: generatePackOptions({ dependencies: { graphqlSchema: schema } }),
    };

    const info = {
      parentType: schema?.getType('User'),
      fieldName: 'name',
      returnType: new GraphQLNonNull(GraphQLString),
    };

    expect(() => mirageObjectResolver('PARENT IS A STRING', {}, context, info)).to.throw(
      'Expected parent to be an object, got string, when trying to resolve field "name" on type "User"',
    );
  });
});