import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class CreateEvent extends Event implements PaperDocumentEvent {
  name = 'create';
  store: DocumentStore;
  document: Document;

  constructor({ document, store }: { document: Document; store: DocumentStore }) {
    super('create');
    this.store = store;
    this.document = document;
  }
}
