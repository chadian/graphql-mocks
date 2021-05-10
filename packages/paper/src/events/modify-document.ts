import { Document, DocumentStore, PaperDocumentEvent } from '../types';
import { DocumentModifiedChangeMap } from './dispatch';

export class ModifyEvent implements PaperDocumentEvent {
  name = 'modify-property';
  store: DocumentStore;
  document: Document;
  changes: DocumentModifiedChangeMap;

  constructor({
    document,
    store,
    changes,
  }: {
    store: DocumentStore;
    document: Document;
    changes: DocumentModifiedChangeMap;
  }) {
    this.store = store;
    this.document = document;
    this.changes = changes;
  }
}
