import { Patch } from 'immer';
import { Subject } from 'rxjs';
import { Document, DocumentStore, PaperEvent } from '../types';
import { findDocument } from '../utils/find-document';
import { getDocumentKey } from '../utils/get-document-key';
import { AddEvent } from './add';
import { ModifyEvent } from './modify';
import { RemoveEvent } from './remove';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(subject: any, path: (string | number)[]): any {
  const pathCopy = [...path];
  const prop = pathCopy.shift();

  if (prop === undefined) {
    return subject;
  }

  return get(subject[prop], pathCopy);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function dispatch(
  changes: Patch[],
  previous: DocumentStore,
  store: DocumentStore,
  eventSubject: Subject<PaperEvent>,
) {
  changes;
  previous;
  store;
  eventSubject;

  const dispatchAdded = (change: Patch, document: Document) =>
    eventSubject.next(new AddEvent({ document, change, store }));

  const dispatchRemoved = (change: Patch, document: Document) =>
    eventSubject.next(new RemoveEvent({ document, change, store }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatchModify = (change: Patch, document: Document, property: string, value: any, previousValue: any) =>
    eventSubject.next(new ModifyEvent({ change, store, document, property, value, previousValue }));

  const throwUnhandledChange = (change: Patch): void => {
    const value = JSON.stringify(change.value);
    const error = new Error(
      `Unhandled change:\noperation: ${change.op}\npath: ${change.path.join(', ')}, value: ${value}`,
    );

    eventSubject.error(error);
  };

  changes.forEach((change) => {
    // Note: ops don't map one-to-one to document/document store changes
    // For example, a `replace` op might contain additions or removals
    // since it's a new array, referentially, the array been "replaced"
    // So a replacement has to be manually checked for what's changed
    // Using the patch from immer is still useful in narrowing down the
    // location of what has changed
    switch (change.op) {
      case 'add': {
        // new array of documents added
        if (change.path.length === 1) {
          change.value.forEach((document: Document) => dispatchAdded(change, document));
          break;
        }

        // specific document added at index
        if (change.path.length === 2) {
          const [type, index] = change.path;
          const document = get(store, [type, index]) as Document;
          dispatchAdded(change, document);
          break;
        }

        throwUnhandledChange(change);
        break;
      }

      case 'replace': {
        // document array on type changed, have to determine changes manually
        if (change.path.length === 1) {
          const [type] = change.path;
          const previousStoredKeys: string[] = (previous[type] ?? []).map((doc: Document) => getDocumentKey(doc));
          const currentStoredKeys: string[] = (store[type] ?? []).map((doc: Document) => getDocumentKey(doc));

          const added = currentStoredKeys.filter((key) => !previousStoredKeys.includes(key));
          const removed = previousStoredKeys.filter((key) => !currentStoredKeys.includes(key));

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          added.forEach((key) => dispatchAdded(change, findDocument(store, key)!));
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          removed.forEach((key) => dispatchRemoved(change, findDocument(previous, key)!));
          break;
        }

        // specific property on a document changed
        if (change.path.length === 3) {
          const [type, index, property] = change.path;
          const document = get(store, [type, index]);
          const value = get(store, [type, index, property]);
          const previousValue = findDocument(previous, document)?.[property];
          dispatchModify(change, document, property.toString(), value, previousValue);
          break;
        }

        throwUnhandledChange(change);
        break;
      }

      default: {
        throwUnhandledChange(change);
        break;
      }
    }

    //   console.log(change);
    //   const [type, index] = change.path;
    //   const document = get(change.value, [type, index]);
    //   console.log(document);
    // } else if (documentChanged) {
    //   const [type, index, changedProp] = change.path;
    //   const document = get(change.value, [type, index]);
    //   const changedPropValue = get(change.value, [type, index, changedProp]);
    //   console.log(document, changedPropValue);
    // } else if (documentRemoved) {
    //   console.log('document removed');
    // }
  });
}
