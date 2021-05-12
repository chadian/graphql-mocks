import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class DisconnectEvent extends Event implements PaperDocumentEvent {
  name = 'disconnect';
  store: DocumentStore;
  document: Document;
  field: string;
  disconnectedFrom: Document;

  constructor({
    document,
    store,
    field,
    disconnectedFrom,
  }: {
    document: Document;
    store: DocumentStore;
    field: string;
    disconnectedFrom: Document;
  }) {
    super('disconnect');
    this.store = store;
    this.document = document;
    this.field = field;
    this.disconnectedFrom = disconnectedFrom;
  }
}
