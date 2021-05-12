import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class ConnectEvent extends Event implements PaperDocumentEvent {
  name = 'connect';
  store: DocumentStore;
  document: Document;
  field: string;
  connectedTo: Document;

  constructor({
    document,
    store,
    field,
    connectedTo,
  }: {
    document: Document;
    store: DocumentStore;
    field: string;
    connectedTo: Document;
  }) {
    super('connect');
    this.store = store;
    this.document = document;
    this.field = field;
    this.connectedTo = connectedTo;
  }
}
