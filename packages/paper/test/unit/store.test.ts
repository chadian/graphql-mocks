import { expect } from 'chai';
import { Store } from '../../src/store';
import { getDocumentId } from '../../src/utils/get-document-id';
import { getConnections } from '../../src/utils/get-connections';

describe('mutation operations', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  it('can add a document', async () => {
    await store.mutate(({ add }) => {
      add('Person', {
        name: 'Ronald',
      });
    });

    const ronald = store.data.Person.find((person) => person.name === 'Ronald');
    expect(ronald?.name).to.equal('Ronald');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(getDocumentId(ronald!)).not.to.be.null;
  });

  it('can find a document given a key within a mutation operation', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ronaldDoc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let foundRonaldDoc: any;

    await store.mutate(({ add, find }) => {
      ronaldDoc = add('Person', {
        name: 'Ronald',
      });

      foundRonaldDoc = find(ronaldDoc);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(ronaldDoc).to.deep.equal(foundRonaldDoc);
  });

  it('can connect one document to another', async () => {
    await store.mutate(({ add, connect }) => {
      const ronald = add('Person', {
        name: 'Ronald',
      });

      const june = add('Person', {
        name: 'June',
      });

      connect([ronald, 'friend'], [june]);
    });

    const ronald = store.data.Person.find((person) => person.name === 'Ronald');
    const june = store.data.Person.find((person) => person.name === 'June');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(getConnections(ronald!).friend.has(getDocumentId(june!)!)).to.equal(true);
  });
});

describe('data', () => {
  let store: Store;

  beforeEach(async () => {
    store = new Store();

    await store.mutate(({ add, connect }) => {
      const ronald = add('Person', {
        name: 'Ronald',
      });

      const jessica = add('Person', {
        name: 'Jessica',
      });

      connect([ronald, 'bestFriend'], [jessica, 'friend']);
    });
  });

  it('can retrieve simple data from a document', () => {
    expect(store.data.Person[0].name).to.equal('Ronald');
  });

  it('can retrieve connected documents from a document', () => {
    expect(store.data.Person[0].bestFriend.name).to.equal('Jessica');
  });

  it('can retrieve cyclical connected documents from a document', () => {
    expect(store.data.Person[0].bestFriend.friend.name).to.equal('Ronald');
  });
});
