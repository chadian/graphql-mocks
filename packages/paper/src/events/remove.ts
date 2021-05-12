import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class RemoveEvent extends Event implements PaperDocumentEvent {
  name = 'remove';
  store: DocumentStore;
  document: Document;

  constructor({ document, store }: { document: Document; store: DocumentStore }) {
    super('remove');
    this.store = store;
    this.document = document;
  }
}
