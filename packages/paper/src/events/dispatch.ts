import { Document, DocumentStore } from '../types';
import { allDocuments } from '../store/all-documents';
import { findDocument } from '../store/find-document';
import { getDocumentKey } from '../document/get-document-key';
import { CreateEvent } from './create';
import { RemoveEvent } from './remove';
import { diff as compareObjects } from 'just-diff';
import { ModifyEvent } from './modify-document';

export type DocumentModifiedChange = {
  propertyName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousValue: any;
};

export type DocumentModifiedChangeMap = {
  [propertyName: string]: DocumentModifiedChange;
};

type CreateRemoveEventChanges = {
  createdDocuments: { document: Document }[];
  removedDocuments: { document: Document }[];
  modifiedDocuments: {
    document: Document;
    changes: {
      [propertyName: string]: DocumentModifiedChange;
    };
  }[];
};

function extractChanges(current: DocumentStore, previous: DocumentStore): CreateRemoveEventChanges {
  const currentKeys = allDocuments(current).map((document) => getDocumentKey(document));
  const previousKeys = allDocuments(previous).map((document) => getDocumentKey(document));
  const created = currentKeys.filter((key) => !previousKeys.includes(key));
  const removed = previousKeys.filter((key) => !currentKeys.includes(key));
  const existing = currentKeys.filter((key) => !created.includes(key));

  const modifiedDocuments = existing
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((key) => ({ current: findDocument(current, key)!, previous: findDocument(previous, key)! }))
    .map(({ current, previous }) => {
      const differences = compareObjects(current, previous);
      const changes = differences.reduce((documentChange, { path }) => {
        const [property] = path;

        documentChange[property] = {
          propertyName: property.toString(),
          value: current[property],
          previousValue: previous[property],
        };

        return documentChange;
      }, {} as DocumentModifiedChangeMap);

      const hasChanges = Object.keys(changes).length > 0;
      return hasChanges ? { document: current, changes } : undefined;
    })
    .filter(Boolean) as CreateRemoveEventChanges['modifiedDocuments'];

  const createdDocuments = created.map((key) => ({
    document: findDocument(current, key) as Document,
  }));

  const removedDocuments = removed.map((key) => ({
    document: findDocument(previous, key) as Document,
  }));

  return {
    createdDocuments: createdDocuments,
    removedDocuments,
    modifiedDocuments,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dispatch(previous: DocumentStore, store: DocumentStore, eventTarget: EventTarget) {
  const { createdDocuments, removedDocuments, modifiedDocuments } = extractChanges(store, previous);

  createdDocuments.forEach(({ document }) => eventTarget.dispatchEvent(new CreateEvent({ document, store })));
  removedDocuments.forEach(({ document }) => eventTarget.dispatchEvent(new RemoveEvent({ document, store })));
  modifiedDocuments.forEach(({ changes, document }) =>
    eventTarget.dispatchEvent(new ModifyEvent({ document, store, changes })),
  );
}
