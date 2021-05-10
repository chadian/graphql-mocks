import { DOCUMENT_CONNECTIONS_SYMBOL, DOCUMENT_KEY_SYMBOL } from './constants';

export { DefaultContextualOperations } from './operations/types';

// documents

export type DocumentKey = string;
export type KeyOrDocument = DocumentKey | Document;

export type Document = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
  [DOCUMENT_KEY_SYMBOL]: DocumentKey;
  [DOCUMENT_CONNECTIONS_SYMBOL]: ConnectionsMap;
};

export type DocumentPartial = Partial<Document>;

// connections
type ConnectionFieldName = string;
export type ConnectionsMap = Record<ConnectionFieldName, Connections>;
type Connections = Array<string>;

// store

export type DataStore<Typename extends string = string> = Record<Typename, Document[]>;

// operations

export type OperationContext = {
  data: DataStore;
};

export interface Operation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (context: OperationContext, ...operationArgs: any[]): any;
}

// transaction

// this is after context arg has been bound to the Operation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContextualOperation = (...operationArgs: any[]) => any;

export type ContextualOperationMap = {
  [key: string]: ContextualOperation;
};

export interface TransactionCallback<T extends ContextualOperationMap = ContextualOperationMap> {
  (operations: T): void;
}
