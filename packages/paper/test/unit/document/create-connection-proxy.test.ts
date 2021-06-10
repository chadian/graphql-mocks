import { expect } from 'chai';
import { buildSchema } from 'graphql';
import { collapseConnections } from '../../../src/document/collapse-connections';
import { createConnectionProxy } from '../../../src/document/create-connection-proxy';
import { createDocument } from '../../../src/document/create-document';
import { createDocumentStore } from '../../../src/store/create-document-store';
import { Document, DocumentStore } from '../../../src/types';

const createSchema = (songField: string) =>
  buildSchema(`
  schema {
    query: Query
  }

  type Query {
    song: Song
  }

  type Song {
    title: String!
  }

  type Album {
    title: String!
    ${songField}
  }
`);

describe('create-connection-proxy', () => {
  let song: Document;
  let album: Document;
  let store: DocumentStore;
  
  beforeEach(() => {
    song = createDocument('Song', {
      title: 'I Wanna Get Better',
    });

    album = createDocument('Album', {
      title: 'Strange Desire',
      songs: [song],
      song: [song],
    });

    store = createDocumentStore();
    store.Song = [song];
    store.Album = [album];
  });

  context('with the writable option set to false', () => {
    it('throws when trying to set a property', () => {
      const schema = createSchema('songs: [Song!]!');
      const proxyAlbum = createConnectionProxy(schema, store, album, { writable: false });

      expect(() => {
        proxyAlbum.title = 'throws because writable is false';
      }).to.throw('Setting on data pulled from the store is not allowed, use the `mutate` method.');
    });
  });

  context('direct connections', () => {
    it('can access uncollapsed connections', () => {
      const schema = createSchema('songs: [Song!]!');
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.title).to.equal(album.title);
      expect(proxyAlbum.songs[0].title).to.equal(song.title);
    });

    it('prefers direct connections over collapsed connections', () => {
      const schema = createSchema('songs: [Song!]!');
      collapseConnections(schema, store);

      const newSong = createDocument('Song', { title: 'Shadow' });
      album.songs = [newSong];

      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.title).to.equal(store.Album[0].title);
      expect(proxyAlbum.songs[0].title).to.equal(newSong.title);
    });
  });

  context('with collapsed connections', () => {
    it('can access collapased singular', () => {
      const schema = createSchema('song: Song');
      collapseConnections(schema, store);
      expect(album.song).to.equal(undefined);
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.title).to.equal(store.Album[0].title);
      expect(proxyAlbum.song.title).to.equal(store.Song[0].title);
    });

    it('can access a collapased list', () => {
      const schema = createSchema('songs: [Song]');
      collapseConnections(schema, store);
      expect(album.songs).to.equal(undefined);
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.title).to.equal(store.Album[0].title);
      expect(proxyAlbum.songs[0].title).to.equal(store.Song[0].title);
    });
  });

  describe('when neither a collapsed nor direct connection exists', () => {
    beforeEach(() => {
      delete store.Album[0].songs;
      delete store.Album[0].song;
    });

    it('returns an empty array for a non-null list without any connections', () => {
      const schema = createSchema('songs: [Song!]!');
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(Array.isArray(proxyAlbum.songs)).to.be.true;
      expect(proxyAlbum.songs.length).to.equal(0);
    });

    it('returns null for a nullable list without any connections', () => {
      const schema = createSchema('songs: [Song!]');
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.songs).to.be.equal(null);
    });

    it('returns null for a nullable singular type without any connections', () => {
      const schema = createSchema('song: Song');
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.songs).to.be.equal(null);
    });

    it('returns undefined for a non-nullable singular type without any connections', () => {
      const schema = createSchema('song: Song!');
      const proxyAlbum = createConnectionProxy(schema, store, album);
      expect(proxyAlbum.song).to.be.equal(undefined);
    });
  });
});
