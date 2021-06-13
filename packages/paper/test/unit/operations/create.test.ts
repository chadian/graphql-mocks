import { expect } from 'chai';
import { buildSchema } from 'graphql';
import { createOperation } from '../../../src/operations/create';
import { createDocumentStore } from '../../../src/store/create-document-store';
import { findDocument } from '../../../src/store/find-document';
import { OperationContext, Document } from '../../../src/types';

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

  union SongOrAlbum = Song | Album

  type Album {
    title: String!
    titleTrack: Song
    songs: [Song]
    songOrAlbum: SongOrAlbum
  }
`);

describe('operations/create', () => {
  let context: OperationContext;
  let song: Document;

  beforeEach(() => {
    context = {
      store: createDocumentStore(),
      schema,
    };

    song = createOperation(context, 'Song', {
      title: "Don't take the money",
    });
  });

  it('creates a document with non-connection fields', () => {
    expect(song.title).to.equal("Don't take the money");
    expect(findDocument(context.store, song)).to.equal(song, 'created document exists in the store');
  });

  it('creates a document, skipping creating existing connection document', () => {
    const album = createOperation(context, 'Album', {
      title: 'Gone Now',
      titleTrack: song,
    });

    expect(context.store.Album).to.deep.equal([album]);
    expect(context.store.Song).to.deep.equal([song]);
  });

  it('creates a document, automatically creating document for non-existing singular connection', () => {
    const album = createOperation(context, 'Album', {
      title: 'Gone Now',
      titleTrack: { title: 'All my Heroes' },
    });

    const newSong = album.titleTrack;
    expect(newSong.title).to.equal('All my Heroes');
    expect(context.store.Album).to.deep.equal([album]);
    expect(context.store.Song).to.deep.equal([song, newSong]);
  });

  it.only('creates a document, automatically creating document for non-existing list connection', () => {
    const album = createOperation(context, 'Album', {
      title: 'Gone Now',
      songs: [song, { title: 'All my Heroes' }, { title: 'Goodmorning' }],
    });

    const [existingSong, firstNewSong, secondNewSong] = album.songs;
    expect(firstNewSong.title).to.equal('All my Heroes');
    expect(secondNewSong.title).to.equal('Goodmorning');
    expect(context.store.Album).to.deep.equal([album]);
    expect(context.store.Song).to.deep.equal([existingSong, firstNewSong, secondNewSong]);
  });

  it('throws an error when it cannot automatically create a document for an abstract type', () => {
    expect(() => {
      createOperation(context, 'Album', {
        title: 'Gone Now',
        songOrAlbum: { title: 'All my Heroes' },
      });
    }).to.throw(
      'The "Album" with field "songOrAlbum" is represented by multiple types: Song, Album. Therefore, cannot create document automatically for:',
    );
  });
});
