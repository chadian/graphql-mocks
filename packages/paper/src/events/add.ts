import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class AddEvent implements PaperDocumentEvent {
  name = 'add';
  store: DocumentStore;
  document: Document;

  constructor({ document, store }: { document: Document; store: DocumentStore }) {
    this.store = store;
    this.document = document;
  }
}
