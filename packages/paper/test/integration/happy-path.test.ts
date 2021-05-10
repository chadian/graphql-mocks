// import { expect } from 'chai';
import { Paper } from '../../src/paper';
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
    nullList: [Account]
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
  let paper: Paper;
  let account: Document;

  beforeEach(async () => {
    paper = new Paper(graphqlSchema);

    await paper.mutate(({ add }) => {
      add('Account', {
        id: '1',
        email: 'windows95@aol.com',
      });
    });

    account = paper.find('Account', (account) => account.id === '1') as Document;
  });

  describe('look ups', () => {
    it('looks up a document on the store via find', () => {
      const account = paper.find('Account', (account) => account.id === '1') as Document;
      expect(account.id).to.equal('1');
      expect(account.email).to.equal('windows95@aol.com');
    });

    it('looks up a document on the store via findDocument', () => {
      const foundAccount = paper.findDocument(account) as Document;
      expect(foundAccount.id).to.equal('1');
      expect(foundAccount.email).to.equal('windows95@aol.com');
    });

    it('provides the document store structure available', () => {
      expect(paper.data.Account).to.have.length(1);
      expect(paper.data.Account?.[0]?.id).to.equal('1');
      expect(paper.data.Account?.[0]?.email).to.equal('windows95@aol.com');
    });
  });

  describe('mutations', () => {
    it('creates a new document', async () => {
      await paper.mutate(({ add }) => {
        add('Account', {
          id: '2',
          email: 'macos9@aol.com',
        });
      });

      const account = paper.find('Account', (document) => document.id === '2');
      expect(account?.id).to.equal('2');
      expect(account?.email).to.equal('macos9@aol.com');
    });

    it('creates a new document with a connected document, implictly on property', async () => {
      await paper.mutate(({ add }) => {
        add('App', {
          id: '1',
          name: 'my-fancy-app',
          owner: account,
        });
      });

      const app = paper.find('App', (document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('creates a new document with a connected document, explicitly by `connect`', async () => {
      await paper.mutate(({ add, connect }) => {
        const app = add('App', {
          id: '1',
          name: 'my-fancy-app',
        });

        connect([app, 'owner'], [account]);
      });

      const app = paper.find('App', (document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('connects to null documents', async () => {
      await paper.mutate(({ add, connect, getNullDocument }) => {
        const team = add('Team', {
          id: '1',
          name: 'my-fancy-app',
          owner: {
            id: '2',
            email: 'test@aol.com',
          },
        });

        connect([team, 'nullList'], [getNullDocument()]);
        connect([team, 'nullList'], [getNullDocument()]);
        connect([team, 'nullList'], [account]);
      });

      const team = paper.find('Team', (document) => document.id === '1');
      expect(team?.nullList).to.deep.equal([null, null, { id: '1', email: 'windows95@aol.com' }]);
    });

    it('edits an existing document', async () => {
      const originalAccount = account;
      await paper.mutate(({ find, put }) => {
        const acc = find(account as Document);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        put(acc!, {
          email: 'beos@aol.com',
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updatedAccount = paper.find('Account', (document) => document.id === '1')!;
      expect(getDocumentKey(originalAccount)).to.equal(getDocumentKey(updatedAccount));
      expect(originalAccount.email).to.equal('windows95@aol.com');
      expect(updatedAccount.email).to.equal('beos@aol.com');
    });
  });

  describe('validations', () => {
    it('provides validation feedback on transactions', async () => {
      let caughtError;
      try {
        await paper.mutate(({ add }) => {
          add('Account', {
            id: '1',
            email: null,
          });
        });
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError.message).to.equal(
        'The field "email" represents a graphql "String! (non-null)" type and on the document should be a non-null, but got null',
      );
    });
  });
});
