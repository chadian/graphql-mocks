// Until older versions of Node support EventTarget, this will
// polyfill it
import 'event-target-polyfill';

import { GraphQLSchema } from 'graphql';
import { produce, setAutoFreeze } from 'immer';
import { createStoreEvents } from './events/dispatch';
import { defaultOperations } from './operations/index';
import { transaction } from './transaction/transaction';
import { Queue } from './transaction/queue';
import {
  AllowedTransactionCallbackReturnTypes,
  Document,
  DocumentStore,
  DocumentTypeValidator,
  FieldValidator,
  HooksMap,
  KeyOrDocument,
  OperationMap,
  TransactionCallback,
} from './types';
import { createDocumentStore } from './store/create-document-store';
import { findDocument } from './store/find-document';
import { proxyWrap } from './store/proxy-wrap';
import { validate } from './validations/validate';
import { exclusiveDocumentFieldsOnType } from './validations/validators/exclusive-document-fields-on-type';
import { listFieldValidator } from './validations/validators/list-field';
import { nonNullFieldValidator } from './validations/validators/non-null-field';
import { objectFieldValidator } from './validations/validators/object-field';
import { scalarFieldValidator } from './validations/validators/scalar-field';
import { uniqueIdFieldValidator } from './validations/validators/unique-id';
import { isDocument } from './document/is-document';
import { getDocumentKey } from './document/get-document-key';
import { nullDocument } from './document/null-document';
import { createConnectionProxy } from './document/create-connection-proxy';

// Auto Freezing needs to be disabled because it interfers with using
// of using js a `Proxy` on the resulting data, see:
// > 18.5.5.7 Example: non-writable non-configurable target properties
// > must be represented faithfully
// > https://exploringjs.com/deep-js/ch_proxies.html
setAutoFreeze(false);

export class Paper<UserOperations extends OperationMap = OperationMap> {
  protected history: DocumentStore[] = [];
  protected current: DocumentStore;
  protected sourceGraphQLSchema: GraphQLSchema;
  protected mutateQueue: Queue = new Queue();

  operations: typeof defaultOperations & UserOperations;
  events = new EventTarget();

  validators: { document: DocumentTypeValidator[]; field: FieldValidator[] } = {
    document: [exclusiveDocumentFieldsOnType],
    field: [
      listFieldValidator,
      nonNullFieldValidator,
      objectFieldValidator,
      scalarFieldValidator,
      uniqueIdFieldValidator,
    ],
  };

  hooks: HooksMap<Paper['operations'] & UserOperations> = {
    beforeTransaction: [],
    afterTransaction: [],
  };

  constructor(graphqlSchema: GraphQLSchema, options?: { operations?: UserOperations }) {
    this.current = createDocumentStore(graphqlSchema);
    this.sourceGraphQLSchema = graphqlSchema;

    this.operations = {
      ...(options?.operations as UserOperations),
      ...defaultOperations,
    };
  }

  get data(): DocumentStore {
    return proxyWrap(this.sourceGraphQLSchema, this.current);
  }

  find(documentOrKey: KeyOrDocument): Document | undefined {
    return findDocument(this.data, documentOrKey);
  }

  private validate(_store?: DocumentStore): void {
    const store = _store ?? this.current;

    Object.values(store).forEach((documents) => {
      documents.forEach((document: Document) => {
        validate(this.sourceGraphQLSchema, document, store, this.validators);
      });
    });
  }

  private dispatchEvents(events: Event[]) {
    const eventsTarget = this.events;
    events.forEach((event) => eventsTarget.dispatchEvent(event));
  }

  async mutate<T extends TransactionCallback<Paper['operations'] & UserOperations>>(fn: T): Promise<ReturnType<T>> {
    const { previous, finish } = this.mutateQueue.enqueue();
    await previous;

    const schema = this.sourceGraphQLSchema;
    const current = this.current;
    const hooks = this.hooks;
    const operations = this.operations;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let customEvents: Event[] = [];

    const next = await produce(current, async (draft) => {
      const { transactionResult, eventQueue } = await transaction<typeof operations>(
        draft,
        schema,
        operations,
        hooks,
        fn as T,
      );

      result = captureTransactionResultKeys(transactionResult);
      customEvents = eventQueue;
    });

    this.validate(next);
    const storeEvents = createStoreEvents(current, next);
    this.dispatchEvents([...storeEvents, ...customEvents]);
    this.current = next;
    this.history.push(next);

    finish();
    return convertResultKeysToDocument(schema, next, result) as ReturnType<T>;
  }
}

function convertResultKeysToDocument(
  schema: GraphQLSchema,
  store: DocumentStore,
  result: null | undefined | string | string[] | Record<string, string>,
): AllowedTransactionCallbackReturnTypes {
  if (result === undefined || result === null) {
    return result;
  }

  if (typeof result === 'string') {
    const key = result;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const document = findDocument(store, key)!;
    return document === nullDocument ? null : createConnectionProxy(schema, store, document);
  }

  if (Array.isArray(result)) {
    result.map((key) => {
      const document = findDocument(store, key);
      return document === nullDocument ? null : document;
    });
  }

  if (typeof result === 'object') {
    const processed: Record<string, Document> = {};

    for (const key in result) {
      const documentKey = (result as Record<string, string>)[key];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const document = findDocument(store, documentKey)!;
      (processed as Record<string, Document | null>)[key] = document === nullDocument ? null : document;
    }

    return processed;
  }
}

function captureTransactionResultKeys(result: unknown): null | undefined | string | string[] | Record<string, string> {
  const unallowedError = new Error(
    'Return values from transactions must be null, undefined, a Document, array of Document or an object with Document values',
  );

  if (result === undefined || result === null) {
    return result;
  }

  if (isDocument(result)) {
    return getDocumentKey(result);
  }

  if (Array.isArray(result)) {
    return result.map((item) => {
      if (!isDocument(item)) {
        throw unallowedError;
      }

      return getDocumentKey(item);
    });
  }

  if (typeof result === 'object') {
    const processed = {};

    for (const key in result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = (result as any)[key];
      if (!isDocument(item)) {
        throw unallowedError;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processed as Record<string, string>)[key] = getDocumentKey(item);
    }

    return processed;
  }

  throw unallowedError;
}
