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
  DocumentTypeValidator,
  FieldValidator,
} from './types';
import { GraphQLSchema } from 'graphql';
import { findDocument } from './utils/find-document';
import { isDocument } from './utils/is-document';
import { validate } from './validations/validate';
import { exclusiveDocumentFieldsOnType } from './validations/validators/exclusive-document-fields-on-type';
import { exclusiveFieldOrConnectionValueForfield } from './validations/validators/exclusive-field-or-connection-value';
import { listFieldValidator } from './validations/validators/list-field';
import { multipleConnectionsForNonListField } from './validations/validators/multiple-connections-for-non-list-field';
import { nonNullFieldValidator } from './validations/validators/non-null-field';
import { objectFieldValidator } from './validations/validators/object-field';
import { scalarFieldValidator } from './validations/validators/scalar-field';

// Auto Freezing needs to be disabled because it interfers with using
// of using js a `Proxy` on the resulting data, see:
// > 18.5.5.7 Example: non-writable non-configurable target properties
// > must be represented faithfully
// > https://exploringjs.com/deep-js/ch_proxies.html
setAutoFreeze(false);

export class Store {
  history: DataStore[] = [];
  current: DataStore = {};
  documentValidators: DocumentTypeValidator[] = [exclusiveDocumentFieldsOnType];
  fieldValidators: FieldValidator[] = [
    exclusiveFieldOrConnectionValueForfield,
    listFieldValidator,
    multipleConnectionsForNonListField,
    nonNullFieldValidator,
    objectFieldValidator,
    scalarFieldValidator,
  ];

  private sourceGrapQLSchema: GraphQLSchema;

  constructor(graphqlSchema: GraphQLSchema) {
    this.sourceGrapQLSchema = graphqlSchema;
  }

  get data(): DataStore {
    return proxyWrap(this, this.current);
  }

  findDocument(documentOrKey: KeyOrDocument): Document | undefined {
    const result = findDocument(this.data, documentOrKey);
    return isDocument(result) ? proxyWrap(this, result) : result;
  }

  find(typename: string, findFunction: (doc: Document) => boolean): Document | undefined {
    const typeStore = this.data[typename] ?? [];
    const result = typeStore.find(findFunction);
    return isDocument(result) ? proxyWrap(this, result) : result;
  }

  validate(_store?: DataStore): void {
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

  async mutate<T extends ContextualOperationMap = DefaultContextualOperations>(
    fn: TransactionCallback<T>,
  ): Promise<Store> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next: DataStore = produce(transaction)(this.current, this.sourceGrapQLSchema, fn as any);

    this.history.push(next);
    this.current = next;

    return this;
  }
}
