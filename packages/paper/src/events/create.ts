import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class CreateEvent implements PaperDocumentEvent {
  name = 'create';
  store: DocumentStore;
  document: Document;

  constructor({ document, store }: { document: Document; store: DocumentStore }) {
    this.store = store;
    this.document = document;
  }
}
