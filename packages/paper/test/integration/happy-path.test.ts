// import { expect } from 'chai';
import { Paper } from '../../src/paper';
import { Document } from '../../src/types';
import { buildSchema } from 'graphql';
import { expect } from 'chai';
import { getDocumentKey } from '../../src/document/get-document-key';
import { RemoveEvent } from '../../src/events/remove';
import { ModifyEvent } from '../../src/events/modify-document';

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
    admin: Account!
    nullList: [Account]
  }

  union AppOwner = Account | Team

  type App {
    id: ID!
    name: String!
    owner: AppOwner!
    secondaryOwner: AppOwner
    releasedAt: String
    archivedAt: String
  }
`;
const graphqlSchema = buildSchema(schemaString);

describe('happy path', () => {
  let paper: Paper;
  let account: Document;
  let events: any[];

  beforeEach(async () => {
    paper = new Paper(graphqlSchema);

    await paper.mutate(({ create }) => {
      create('Account', {
        id: '1',
        email: 'windows95@aol.com',
      });
    });

    events = [];
    account = paper.data.Account.find((account) => account.id === '1') as Document;
  });

  describe('look ups', () => {
    it('provides a __typename property via the document', () => {
      expect(account.__typename).to.equal('Account');
    });

    it('looks up a document on the store via find', () => {
      const account = paper.data.Account.find((account) => account.id === '1') as Document;
      expect(account.id).to.equal('1');
      expect(account.email).to.equal('windows95@aol.com');
    });

    it('looks up a document on the store via findDocument', () => {
      const foundAccount = paper.find(account) as Document;
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
    it('provides __typename on documents within #mutate', async () => {
      await paper.mutate(({ find }) => {
        const $account = find(account);
        expect($account?.__typename).to.equal('Account');
      });
    });

    it('returns the transaction payload from #mutate', async () => {
      const payload = await paper.mutate(() => {
        return 'from the transaction';
      });

      expect(payload).to.equal('from the transaction');
    });

    it('creates a new document', async () => {
      paper.events.addEventListener('create', (e) => events.push(e));

      await paper.mutate(({ create }) => {
        create('Account', {
          id: '2',
          email: 'macos9@aol.com',
        });
      });

      const account = paper.data.Account.find((document) => document.id === '2');
      expect(account?.id).to.equal('2');
      expect(account?.email).to.equal('macos9@aol.com');

      expect(events).to.have.lengthOf(1);
      expect(events[0]?.name).to.equal('create');
      expect(events[0]?.document?.id).to.equal('2');
      expect(events[0]?.document?.email).to.equal('macos9@aol.com');
    });

    it('can hop multiple document connections within mutation transactions', async () => {
      await paper.mutate(({ create, find }) => {
        const $account = find(account);

        const team = create('Team', {
          id: '1',
          name: 'my-fancy-app',
          admin: $account,
        });

        create('App', {
          id: '1',
          name: 'my-fancy-app',
          owner: team,
        });
      });

      await paper.mutate(({ getDocumentsForType }) => {
        const apps = getDocumentsForType('App');
        const app = apps.find((app: Document) => app.id === '1');
        expect(app.owner?.admin?.email).to.equal('windows95@aol.com');
      });
    });

    it('creates a new document with a connected document, implictly on property at creation', async () => {
      await paper.mutate(({ create }) => {
        create('App', {
          id: '1',
          name: 'my-fancy-app',
          owner: account,
        });
      });

      const app = paper.data.App.find((document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('creates a new document with a connected document, explicitly by property reference', async () => {
      await paper.mutate(({ create }) => {
        const app = create('App', {
          id: '1',
          name: 'my-fancy-app',
        });

        app.owner = account;
      });

      const app = paper.data.App.find((document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
    });

    it('connects to null documents', async () => {
      await paper.mutate(({ create }) => {
        const team = create('Team', {
          id: '1',
          name: 'my-fancy-app',
          admin: {
            id: '2',
            email: 'test@aol.com',
          },
        });

        team.nullList = [null, null, account];
      });

      const team = paper.data.Team.find((document) => document.id === '1');
      expect(team?.nullList).to.deep.equal([null, null, { id: '1', email: 'windows95@aol.com' }]);
    });

    it('edits an existing document', async () => {
      const originalAccount = account;
      paper.events.addEventListener('modify', (e) => events.push(e));

      await paper.mutate(({ find }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const acc = find(account as Document)!;
        acc.id = '5';
        acc.email = 'beos@aol.com';
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updatedAccount = paper.data.Account.find((document) => document.id === '5')!;
      expect(getDocumentKey(originalAccount)).to.equal(getDocumentKey(updatedAccount));
      expect(originalAccount.email).to.equal('windows95@aol.com');
      expect(updatedAccount.email).to.equal('beos@aol.com');
      expect(events).to.have.lengthOf(1);

      const [event] = events;
      expect((event as ModifyEvent).document.id).to.equal('5');
      expect((event as ModifyEvent).document.email).to.equal('beos@aol.com');
      expect((event as ModifyEvent).changes.id.value).to.equal('5');
      expect((event as ModifyEvent).changes.id.previousValue).to.equal('1');
    });

    it('clones an existing document', async () => {
      await paper.mutate(({ find, clone }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const acc = find(account)!;
        const cloned = clone(acc);
        cloned.id = 'cloned';
      });

      const accounts = paper.data.Account;
      expect(accounts).to.have.lengthOf(2);
      expect(accounts[0].email).to.equal(account.email);
      expect(accounts[1].email).to.equal(account.email);
    });

    it('supports promises within a mutate transaction', async () => {
      let called = false;

      const timeout = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            called = true;
            resolve(called);
          }, 100);
        });

      await paper.mutate(async () => {
        const resolved = await timeout();
        expect(resolved).to.equal(true);
      });

      expect(called).to.equal(true);
    });

    it('removes existing documents', async () => {
      paper.events.addEventListener('remove', (e) => events.push(e));

      await paper.mutate(({ remove }) => {
        remove(account);
      });

      expect(events).to.have.lengthOf(1);
      expect(events[0]?.name).to.equal('remove');
      expect((events[0] as RemoveEvent).document?.id).to.deep.equal('1');
      expect((events[0] as RemoveEvent).document?.email).to.deep.equal('windows95@aol.com');
    });
  });

  describe('validations', () => {
    it('provides validation feedback on transactions', async () => {
      let caughtError;
      try {
        await paper.mutate(({ create }) => {
          create('Account', {
            id: '2',
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
