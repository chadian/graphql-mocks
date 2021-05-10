import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class RemoveEvent implements PaperDocumentEvent {
  name = 'remove';
  store: DocumentStore;
  document: Document;

  constructor({ document, store }: { document: Document; store: DocumentStore }) {
    this.store = store;
    this.document = document;
  }
}
