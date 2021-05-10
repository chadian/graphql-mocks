import { Patch } from 'immer';
import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class RemoveEvent implements PaperDocumentEvent {
  name = 'remove';
  change: Patch;
  store: DocumentStore;
  document: Document;

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor({ change, document, store }: { change: Patch; document: Document; store: DocumentStore }) {
    this.change = change;
    this.store = store;
    this.document = document;
  }
}
