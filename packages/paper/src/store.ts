import { produce, setAutoFreeze } from 'immer';
import { proxyWrap } from './utils/proxy-wrap';
import { transaction } from './transaction';
import {
  DataStore,
  TransactionCallback,
  ContextualOperationMap,
  DefaultContextualOperations,
  Document,
  KeyOrDocument,
} from './types';
import { graphqlCheck } from './validations/graphql-check';
import { GraphQLSchema } from 'graphql';
import { findDocument } from './utils/find-document';

// Auto Freezing needs to be disabled because it interfers with using
// of using js a `Proxy` on the resulting data, see:
// > 18.5.5.7 Example: non-writable non-configurable target properties
// > must be represented faithfully
// > https://exploringjs.com/deep-js/ch_proxies.html
setAutoFreeze(false);

export class Store {
  history: DataStore[] = [];
  current: DataStore = {};
  private sourceGrapQLSchema: GraphQLSchema;

  constructor(graphqlSchema: GraphQLSchema) {
    this.sourceGrapQLSchema = graphqlSchema;
  }

  get data(): DataStore {
    return proxyWrap(this, this.current);
  }

  findDocument(documentOrKey: KeyOrDocument): Document | undefined {
    return findDocument(this.data, documentOrKey);
  }

  find(typename: string, findFunction: (doc: Document) => boolean): Document | undefined {
    const typeStore = this.data[typename] ?? [];
    return typeStore.find(findFunction);
  }

  async mutate<T extends ContextualOperationMap = DefaultContextualOperations>(
    fn: TransactionCallback<T>,
  ): Promise<Store> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next: DataStore = produce(transaction)(this.current, this.sourceGrapQLSchema, fn as any);

    graphqlCheck(next, this.sourceGrapQLSchema);

    this.history.push(next);
    this.current = next;

    return this;
  }
}
