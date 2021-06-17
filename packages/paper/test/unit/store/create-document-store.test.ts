import { expect } from 'chai';
import { buildSchema } from 'graphql';
import { createDocumentStore } from '../../../src/store/create-document-store';

describe('create-connection-proxy', () => {
  it('returns an empty object when no schema is provided', () => {
    expect(createDocumentStore()).to.deep.equal({});
  });

  it('returns a store setup with types', () => {
    const schema = buildSchema(`
      schema {
        query: Query
      }

      type Query {
        songs: [Song!]!
      }

      type Song {
        title: String!
        artist: Artist!
        album: Album!
      }

      type Album {
        title: String!
      }

      type Artist {
        title: String!
      }
    `);

    expect(createDocumentStore(schema)).to.deep.equal({
      Album: [],
      Artist: [],
      Song: [],
    });
  });
});
