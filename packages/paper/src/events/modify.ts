import { Patch } from 'immer';
import { Document, DocumentStore, PaperDocumentEvent } from '../types';

export class ModifyEvent implements PaperDocumentEvent {
  name = 'modify';
  change: Patch;
  store: DocumentStore;
  property: string;
  document: Document;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousValue: any;

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  constructor({
    change,
    document,
    property,
    store,
    value,
    previousValue,
  }: {
    change: Patch;
    store: DocumentStore;
    document: Document;
    property: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousValue: any;
  }) {
    this.change = change;
    this.store = store;
    this.document = document;
    this.value = value;
    this.previousValue = previousValue;
    this.property = property;
  }
}
