import { Store } from './store';
import { getDocumentId } from './utils/get-document-id';
import { getConnections } from './utils/get-connections';

let store;

beforeEach(() => {
  store = new Store();
});

describe('mutation operations', () => {
  it('can add a document', () => {
    store.mutate(({add}) => {
      add('Person', {
        name: 'Ronald'
      });
    });

    const ronald = store.data.Person.find(person => person.name === 'Ronald');
    expect(ronald.name).toEqual('Ronald');
    expect(getDocumentId(ronald)).not.toBeNull();
  });

  it('can find a document given a key within a mutation operation', () => {
    let ronaldKey;
    let ronaldDoc;

    store.mutate(({add, find}) => {
      ronaldKey = add('Person', {
        name: 'Ronald'
      });

      ronaldDoc = find(ronaldKey);
    });

    expect(ronaldDoc.name).toEqual('Ronald');
    expect(getDocumentId(ronaldDoc)).toEqual(ronaldKey);
  });

  it('can connect one document to another', () => {
    store.mutate(({add, connect}) => {
      const ronald = add('Person', {
        name: 'Ronald'
      });

      const june = add('Person', {
        name: 'June'
      });

      connect([ronald, 'friend'], [june]);
    });

    const ronald = store.data.Person.find(person => person.name === 'Ronald');
    const june = store.data.Person.find(person => person.name === 'June');

    expect(
      getConnections(ronald).friend.has(getDocumentId(june))
    ).toBe(true);
  });
});

describe('data', () => {
  beforeEach(() => {
    store.mutate(({add, connect}) => {
      const ronald = add('Person', {
        name: 'Ronald'
      });

      const jessica = add('Person', {
        name: 'Jessica'
      });

      connect([ronald, 'bestFriend'], [jessica, 'friend']);
    });
  });

  it('can retrieve simple data from a document', () => {
    expect(store.data.Person[0].name).toEqual('Ronald');
  });

  it('can retrieve connected documents from a document', () => {
    expect(store.data.Person[0].bestFriend.name).toEqual('Jessica');
  });

  it('can retrieve cyclical connected documents from a document', () => {
    expect(store.data.Person[0].bestFriend.friend.name).toEqual('Ronald');
  });
});
