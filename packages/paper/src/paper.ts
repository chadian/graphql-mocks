import { GraphQLSchema } from 'graphql';
import { produce, setAutoFreeze } from 'immer';
import { dispatch } from './events/dispatch';
import { defaultOperations } from './operations/index';
import { transaction } from './transaction';
import {
  Document,
  DocumentStore,
  DocumentTypeValidator,
  FieldValidator,
  Hook,
  KeyOrDocument,
  OperationMap,
  TransactionCallback,
} from './types';
import { createDocumentStore } from './utils/create-document-store';
import { findDocument } from './utils/find-document';
import { isDocument } from './utils/is-document';
import { proxyWrap } from './utils/proxy-wrap';
import { validate } from './validations/validate';
import { exclusiveDocumentFieldsOnType } from './validations/validators/exclusive-document-fields-on-type';
import { listFieldValidator } from './validations/validators/list-field';
import { nonNullFieldValidator } from './validations/validators/non-null-field';
import { objectFieldValidator } from './validations/validators/object-field';
import { scalarFieldValidator } from './validations/validators/scalar-field';
import { uniqueIdFieldValidator } from './validations/validators/unique-id';

// Auto Freezing needs to be disabled because it interfers with using
// of using js a `Proxy` on the resulting data, see:
// > 18.5.5.7 Example: non-writable non-configurable target properties
// > must be represented faithfully
// > https://exploringjs.com/deep-js/ch_proxies.html
setAutoFreeze(false);

export class Paper<UserOperations extends OperationMap = OperationMap> {
  history: DocumentStore[] = [];
  current: DocumentStore;

  documentValidators: DocumentTypeValidator[] = [exclusiveDocumentFieldsOnType];

  fieldValidators: FieldValidator[] = [
    listFieldValidator,
    nonNullFieldValidator,
    objectFieldValidator,
    scalarFieldValidator,
    uniqueIdFieldValidator,
  ];

  operations: typeof defaultOperations & UserOperations;
  events = new EventTarget();

  private sourceGrapQLSchema: GraphQLSchema;

  constructor(graphqlSchema: GraphQLSchema, options?: { operations?: UserOperations }) {
    this.sourceGrapQLSchema = graphqlSchema;
    this.current = createDocumentStore();

    this.operations = {
      ...(options?.operations as UserOperations),
      ...defaultOperations,
    };
  }

  get data(): DocumentStore {
    return proxyWrap(this.current, this.current);
  }

  findDocument(documentOrKey: KeyOrDocument): Document | undefined {
    const result = findDocument(this.current, documentOrKey);
    return isDocument(result) ? proxyWrap(this.current, result) : result;
  }

  find(typename: string, findFunction: (doc: Document) => boolean): Document | undefined {
    const typeDocuments = this.current[typename] ?? [];
    const result = typeDocuments.find(findFunction);
    return isDocument(result) ? proxyWrap(this.current, result) : result;
  }

  validate(_store?: DocumentStore): void {
    const store = _store ?? this.current;

    Object.values(store).forEach((documents) => {
      documents.forEach((document: Document) => {
        validate(this.sourceGrapQLSchema, document, store, {
          document: this.documentValidators,
          field: this.fieldValidators,
        });
      });
    });
  }

  private dispatchEvents(previous: DocumentStore, store: DocumentStore) {
    dispatch(previous, store, this.events);
  }

  async mutate<T extends TransactionCallback<Paper['operations'] & UserOperations>>(fn: T): Promise<ReturnType<T>> {
    let transactionPayload;

    const next = await produce(this.current, async (draft) => {
      const schema = this.sourceGrapQLSchema;
      const operations = this.operations;
      transactionPayload = await transaction<typeof operations>(draft, schema, operations, fn as T);
    });

    this.validate(next);
    this.dispatchEvents(this.current, next);
    this.current = next;
    this.history.push(next);

    return transactionPayload as ReturnType<T>;
  }
}
