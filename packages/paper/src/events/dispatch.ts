import { Subject } from 'rxjs';
import { Document, DocumentStore, PaperEvent } from '../types';
import { allDocuments } from '../utils/all-documents';
import { findDocument } from '../utils/find-document';
import { getDocumentKey } from '../utils/get-document-key';
import { AddEvent } from './add';
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

type AddRemoveEventChanges = {
  added: { document: Document }[];
  removed: { document: Document }[];
  modified: {
    document: Document;
    changes: {
      [propertyName: string]: DocumentModifiedChange;
    };
  }[];
};

function diffStores(current: DocumentStore, previous: DocumentStore): AddRemoveEventChanges {
  const currentKeys = allDocuments(current).map((document) => getDocumentKey(document));
  const previousKeys = allDocuments(previous).map((document) => getDocumentKey(document));

  const added = currentKeys.filter((key) => !previousKeys.includes(key));
  const removed = previousKeys.filter((key) => !currentKeys.includes(key));

  const modified = currentKeys
    .filter((key) => !added.includes(key))
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
    .filter(Boolean) as AddRemoveEventChanges['modified'];

  return {
    added: added.map((key) => ({
      document: findDocument(current, key) as Document,
    })),
    removed: removed.map((key) => ({
      document: findDocument(previous, key) as Document,
    })),
    modified,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function dispatch(previous: DocumentStore, store: DocumentStore, eventSubject: Subject<PaperEvent>) {
  previous;
  store;
  eventSubject;

  const dispatchAdded = (document: Document) => eventSubject.next(new AddEvent({ document, store }));
  const dispatchRemoved = (document: Document) => eventSubject.next(new RemoveEvent({ document, store }));
  const dispatchModified = (changes: DocumentModifiedChangeMap, document: Document) =>
    eventSubject.next(new ModifyEvent({ document, store, changes }));

  const { added, removed, modified } = diffStores(store, previous);
  added.forEach(({ document }) => dispatchAdded(document));
  removed.forEach(({ document }) => dispatchRemoved(document));
  modified.forEach(({ changes, document }) => dispatchModified(changes, document));
}
