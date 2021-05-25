// import { expect } from 'chai';
import { Paper } from '../../src/paper';
import { Document } from '../../src/types';
import { buildSchema } from 'graphql';
import { expect } from 'chai';
import { getDocumentKey } from '../../src/utils/get-document-key';
import { RemoveEvent } from '../../src/events/remove';
import { ModifyEvent } from '../../src/events/modify-document';
import { ConnectEvent } from '../../src/events/connect';
import { DisconnectEvent } from '../../src/events/disconnect';

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

      const account = paper.find('Account', (document) => document.id === '2');
      expect(account?.id).to.equal('2');
      expect(account?.email).to.equal('macos9@aol.com');

      expect(events).to.have.lengthOf(1);
      expect(events[0]?.name).to.equal('create');
      expect(events[0]?.document?.id).to.equal('2');
      expect(events[0]?.document?.email).to.equal('macos9@aol.com');
    });

    it('creates a new document with a connected document, implictly on property', async () => {
      await paper.mutate(({ create }) => {
        create('App', {
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
      await paper.mutate(({ create, connect }) => {
        const app = create('App', {
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
      await paper.mutate(({ create, connect }) => {
        const team = create('Team', {
          id: '1',
          name: 'my-fancy-app',
          owner: {
            id: '2',
            email: 'test@aol.com',
          },
        });

        connect([team, 'nullList'], [null]);
        connect([team, 'nullList'], [null]);
        connect([team, 'nullList'], [account]);
      });

      const team = paper.find('Team', (document) => document.id === '1');
      expect(team?.nullList).to.deep.equal([null, null, { id: '1', email: 'windows95@aol.com' }]);
    });

    it('captures connect events', async () => {
      paper.events.addEventListener('connect', (e) => events.push(e));

      await paper.mutate(({ create, connect }) => {
        const app = create('App', {
          id: '1',
          name: 'my-fancy-app',
        });

        connect([app, 'owner'], [account]);
      });

      const app = paper.find('App', (document) => document.id === '1');
      expect(app?.name).to.equal('my-fancy-app');
      expect(app?.owner?.email).to.equal('windows95@aol.com');
      expect(events).to.have.lengthOf(1);

      const [connectEvent] = events;
      expect(connectEvent.name).to.equal('connect');
      expect((connectEvent as ConnectEvent).field).to.equal('owner');
      expect((connectEvent as ConnectEvent).document.name).to.equal('my-fancy-app');
      expect((connectEvent as ConnectEvent).connectedTo.email).to.equal('windows95@aol.com');
    });

    it('disconnects a connected document', async () => {
      let app: Document;
      paper.events.addEventListener('disconnect', (e) => events.push(e));

      await paper.mutate(({ create, connect }) => {
        app = create('App', {
          id: '1',
          name: 'my-fancy-app',
        });

        connect([app, 'owner'], [account]);
      });

      await paper.mutate(({ find, disconnect }) => {
        const $app = find(app);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        disconnect([$app!, 'owner'], [account]);
      });

      expect(events).to.have.length(1);
      const disconnectEvent = events?.[0] as DisconnectEvent;
      expect(disconnectEvent.name).to.equal('disconnect');
      expect(disconnectEvent.field).to.equal('owner');
      expect(disconnectEvent.document.name).to.equal('my-fancy-app');
      expect(disconnectEvent.disconnectedFrom.email).to.equal('windows95@aol.com');
    });

    it('edits an existing document', async () => {
      const originalAccount = account;
      paper.events.addEventListener('modify', (e) => events.push(e));

      await paper.mutate(({ find, put }) => {
        const acc = find(account as Document);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        put(acc!, {
          id: '5',
          email: 'beos@aol.com',
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updatedAccount = paper.find('Account', (document) => document.id === '5')!;
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

    // it('disconnects existing documents upon removal', async () => {
    //   let app: Document | null = null;

    //   paper.events.addEventListener('remove', (e) => events.push(e));
    //   paper.events.addEventListener('disconnect', (e) => events.push(e));

    //   await paper.mutate(({ create }) => {
    //     app = create('App', {
    //       id: 'app-id',
    //       name: 'the-coolest-app',
    //       owner: account,
    //     });
    //   });

    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   expect(paper.findDocument(app!)).to.exist;

    //   await paper.mutate(({ remove }) => {
    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     remove(app!);
    //   });

    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   expect(paper.findDocument(app!)).to.not.exist;
    //   expect(events).to.have.lengthOf(2);
    //   const removeEvent = events[0];
    //   const disconenctEvent = events[1];

    //   expect(removeEvent.name).to.equal('remove');
    //   expect(disconenctEvent.name).to.equal('disconnect');
    // });
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
