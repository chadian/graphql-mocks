import { expect } from 'chai';
import { buildSchema } from 'graphql';
import { collapseDocument } from '../../../src/document/collapse-connections';
import { createDocument } from '../../../src/document/create-document';
import { getConnections } from '../../../src/document/get-connections';
import { getDocumentKey } from '../../../src/document/get-document-key';
import { nullDocument } from '../../../src/document/null-document';
import { Document } from '../../../src/types';

const schema = buildSchema(`
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
    titleTrack: Song
    songs: [Song]
  }
`);

describe('collapse-connections', () => {
  let song: Document;
  let anotherSong: Document;

  beforeEach(() => {
    song = createDocument('Song', {});
    anotherSong = createDocument('Song', {});
  });

  it('skips collapsing non-connection fields', () => {
    const document = createDocument('Album', {
      title: 'hello world',
    });

    expect(document.title).to.equal('hello world');
    collapseDocument(schema, document);
    expect(document.title).to.equal('hello world');
  });

  context('singular connection field', () => {
    it('collapses the field to its keys', () => {
      const document = createDocument('Album', {
        title: 'hello world',
        titleTrack: song,
      });

      expect(document.titleTrack).to.equal(song);
      collapseDocument(schema, document);
      expect(document.titleTrack).to.equal(undefined);
      expect(getConnections(document).titleTrack.length).to.equal(1);
      expect(getConnections(document).titleTrack[0]).to.equal(getDocumentKey(song));
    });

    it('preserves a null value on the field (skips collpasing to its connections)', () => {
      const document = createDocument('Album', {
        title: 'hello world',
        titleTrack: null,
      });

      expect(document.titleTrack).to.equal(null);
      collapseDocument(schema, document);
      expect(document.titleTrack).to.equal(null);
      expect(getConnections(document).titleTrack).to.not.exist;
    });
  });

  context('list connection field', () => {
    it('collapses the field to its keys', () => {
      const document = createDocument('Album', {
        title: 'hello world',
        songs: [song, anotherSong],
      });

      expect(document.songs).to.deep.equal([song, anotherSong]);
      collapseDocument(schema, document);
      expect(document.songs).to.not.exist;
    });

    it('preserves a null value on the field (skips collpasing to its connections)', () => {
      const document = createDocument('Album', {
        title: 'hello world',
        songs: null,
      });

      expect(document.songs).to.equal(null);
      collapseDocument(schema, document);
      expect(document.songs).to.equal(null);
      expect(getConnections(document).songs).to.not.exist;
    });

    it('collapses null documents into its connection field', () => {
      const document = createDocument('Album', {
        title: 'hello world',
        songs: [song, null, anotherSong],
      });

      collapseDocument(schema, document);
      expect(document.songs).to.not.exist;
      expect(getConnections(document).songs).to.deep.equal([
        getDocumentKey(song),
        getDocumentKey(nullDocument),
        getDocumentKey(anotherSong),
      ]);
    });
  });
});
