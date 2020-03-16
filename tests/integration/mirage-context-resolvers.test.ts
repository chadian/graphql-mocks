import { expect } from 'chai';
import { buildHandler } from './executable-schema';
import defaultResolvers from './mirage-static-resolvers';
import { server as mirageServer } from './mirage-sample';
import { addMirageToContextWrapper } from '../../src/mirage/wrappers/add-context';
import defaultScenario from './mirage-sample/scenarios/default';
import { pack } from '../../src/resolver-map/pack';

const wrappers = [addMirageToContextWrapper(mirageServer)];
const { resolvers } = pack(defaultResolvers, wrappers);

const graphQLHandler = buildHandler(resolvers);

describe('it can resolve from resolver files', function() {
  beforeEach(() => {
    mirageServer.db.loadData(defaultScenario);
  });

  afterEach(() => {
    mirageServer.db.emptyData();
  });

  it('handles a root query (scalar)', async function() {
    const query = `query {
      hello
    }`;

    const result = await graphQLHandler(query);
    expect(result).to.deep.equal({
      data: {
        hello: 'hi',
      },
    });
  });

  it('handles a root query (custom type)', async function() {
    const query = `query {
      person(id: 1) {
        name
        age
      }
    }`;

    const result = await graphQLHandler(query);
    expect(result).to.deep.equal({
      data: {
        person: {
          name: 'Fred Flinstone',
          age: 43,
        },
      },
    });
  });

  it('handles nested objects', async function() {
    const query = `query {
      person(id: 1) {
        name
        age
        friends {
          name
          age
        }
      }
    }`;

    const result = await graphQLHandler(query);
    expect(result).to.deep.equal({
      data: {
        person: {
          name: 'Fred Flinstone',
          age: 43,
          friends: [
            {
              name: 'Barney Rubble',
              age: 40,
            },
          ],
        },
      },
    });
  });
});
