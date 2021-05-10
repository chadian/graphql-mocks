// import { expect } from 'chai';
import { Store } from '../../src/store';
import { Document } from '../../src/types';
import { buildSchema } from 'graphql';
import { expect } from 'chai';
import { getDocumentKey } from '../../src/utils/get-document-key';

const schemaString = `
  schema {
    query: Query
  }

  type Query {
    apps: App
  }

  type Account {
    id: ID!
    email: String!
  }

  type Team {
    id: ID!
    name: String!
    owner: Account!
  }

  union AppOwner = Account | Team

  type App {
    id: ID!
    name: String!
    owner: AppOwner!
    releasedAt: String
    archivedAt: String
  }
`;
const graphqlSchema = buildSchema(schemaString);

describe('happy path', () => {
  let store: Store;
  let account: Document;

  beforeEach(async () => {
    store = new Store(graphqlSchema);

    await store.mutate(({ add }) => {
      add('Account', {
        id: '1',
        email: 'windows95@aol.com',
      });
    });

    account = store.find('Account', (account) => account.id === '1') as Document;
  });

  describe('look ups', () => {
    it('looks up a document on the store via find', () => {
      const account = store.find('Account', (account) => account.id === '1') as Document;
      expect(account.id).to.equal('1');
      expect(account.email).to.equal('windows95@aol.com');
    });

    it('looks up a document on the store via findDocument', () => {
      const foundAccount = store.findDocument(account) as Document;
      expect(foundAccount.id).to.equal('1');
      expect(foundAccount.email).to.equal('windows95@aol.com');
    });

    it('provides the data store structure available', () => {
      expect(store.data.Account).to.have.length(1);
      expect(store.data.Account?.[0]?.id).to.equal('1');
      expect(store.data.Account?.[0]?.email).to.equal('windows95@aol.com');
    });
  });

  describe('mutations', () => {
    it('creates a new document', async () => {
      await store.mutate(({ add }) => {
        add('Account', {
          id: '2',
          email: 'macos9@aol.com',
        });
      });

      const account = store.find('Account', (document) => document.id === '2');
      expect(account?.id).to.equal('2');
      expect(account?.email).to.equal('macos9@aol.com');
    });

    it('creates a new document with a connected document, implictly on property', async () => {
      await store.mutate(({ add }) => {
        add('App', {
          id: '1',
          name: 'my-fancy-app',
          owner: account,
        });
      });

      const app = store.find('App', (document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('creates a new document with a connected document, explicitly by `connect`', async () => {
      await store.mutate(({ add, connect }) => {
        const app = add('App', {
          id: '1',
          name: 'my-fancy-app',
        });

        connect([app, 'owner'], [account]);
      });

      const app = store.find('App', (document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('edits an existing document', async () => {
      const originalAccount = account;
      await store.mutate(({ find, put }) => {
        const acc = find(account as Document);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        put(acc!, {
          email: 'beos@aol.com',
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updatedAccount = store.find('Account', (document) => document.id === '1')!;
      expect(getDocumentKey(originalAccount)).to.equal(getDocumentKey(updatedAccount));
      expect(originalAccount.email).to.equal('windows95@aol.com');
      expect(updatedAccount.email).to.equal('beos@aol.com');
    });
  });
});