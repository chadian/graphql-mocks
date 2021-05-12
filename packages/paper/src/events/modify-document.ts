import { Document, DocumentStore, PaperDocumentEvent } from '../types';
import { DocumentModifiedChangeMap } from './dispatch';

export class ModifyEvent extends Event implements PaperDocumentEvent {
  name = 'modify';
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
    super('modify');
    this.store = store;
    this.document = document;
    this.changes = changes;
  }
}
