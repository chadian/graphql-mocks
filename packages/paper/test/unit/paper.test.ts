import { expect } from 'chai';
import { Paper } from '../../src/paper';
import { getDocumentKey } from '../../src/document/get-document-key';
import { getConnections } from '../../src/document/get-connections';
import { buildSchema } from 'graphql';

const schemaString = `
  schema {
    query: Query
  }

  type Query {
    person: Person
  }

  type Person {
    name: String
    friends: [Person]
    bestFriend: Person
  }
`;
const graphqlSchema = buildSchema(schemaString);

describe('mutation operations', () => {
  let paper: Paper;

  beforeEach(() => {
    paper = new Paper(graphqlSchema);
  });

  it('can create a document', async () => {
    await paper.mutate(({ create }) => {
      create('Person', {
        name: 'Ronald',
      });
    });

    const ronald = paper.data.Person.find((person) => person.name === 'Ronald');
    expect(ronald?.name).to.equal('Ronald');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(getDocumentKey(ronald!)).not.to.be.null;
  });

  it('can find a document given a key within a mutation operation', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ronaldDoc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let foundRonaldDoc: any;

    await paper.mutate(({ create, find }) => {
      ronaldDoc = create('Person', {
        name: 'Ronald',
      });

      foundRonaldDoc = find(ronaldDoc);
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(ronaldDoc).to.deep.equal(foundRonaldDoc);
  });

  it('can connect one document to another', async () => {
    await paper.mutate(({ create }) => {
      const ronald = create('Person', {
        name: 'Ronald',
      });

      const june = create('Person', {
        name: 'June',
      });

      ronald.bestFriend = june;
    });

    const ronald = paper.data.Person.find((person) => person.name === 'Ronald');
    const june = paper.data.Person.find((person) => person.name === 'June');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(getConnections(ronald!).bestFriend.includes(getDocumentKey(june!)!)).to.equal(true);
  });

  it('can queue a custom event within a mutation', async () => {
    const events: Event[] = [];
    paper.events.addEventListener('hello', (e) => events.push(e));
    await paper.mutate(({ queueEvent }) => queueEvent(new Event('hello')));
    expect(events).to.have.lengthOf(1);
    expect(events[0].type).to.equal('hello');
  });

  it('can queue a custom event within a hook', async () => {
    const events: Event[] = [];
    paper.events.addEventListener('hello', (e) => events.push(e));
    paper.hooks.beforeTransaction.push(({ queueEvent }) => queueEvent(new Event('hello')));
    await paper.mutate(() => 'noop');
    expect(events).to.have.lengthOf(1);
    expect(events[0].type).to.equal('hello');
  });
});

describe('data', () => {
  let paper: Paper;

  beforeEach(async () => {
    paper = new Paper(graphqlSchema);

    await paper.mutate(({ create }) => {
      const ronald = create('Person', {
        name: 'Ronald',
      });

      const jessica = create('Person', {
        name: 'Jessica',
      });

      ronald.bestFriend = jessica;
      jessica.bestFriend = ronald;
    });
  });

  it('can retrieve simple data from a document', () => {
    expect(paper.data.Person[0].name).to.equal('Ronald');
  });

  it('can retrieve connected documents from a document', () => {
    expect(paper.data.Person[0].bestFriend.name).to.equal('Jessica');
  });

  it('can retrieve cyclical connected documents from a document', () => {
    expect(paper.data.Person[0].bestFriend.bestFriend.name).to.equal('Ronald');
  });
});
