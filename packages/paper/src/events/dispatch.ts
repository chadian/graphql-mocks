import { Document, DocumentStore, KeyOrDocument } from '../types';
import { allDocuments } from '../utils/all-documents';
import { findDocument } from '../utils/find-document';
import { getDocumentKey } from '../utils/get-document-key';
import { CreateEvent } from './create';
import { RemoveEvent } from './remove';
import { diff as compareObjects } from 'just-diff';
import { ModifyEvent } from './modify-document';
import { getConnections } from '../utils/get-connections';
import { ConnectEvent } from './connect';
import { DisconnectEvent } from './disconnect';

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
  connections: { field: string; document: Document; connectedTo: Document }[];
  disconnections: { field: string; document: Document; disconnectedFrom: Document }[];
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

  const { connections, disconnections } = [...previousKeys, ...created].reduce(
    ({ connections, disconnections }, key) => {
      const currentDocument = findDocument(current, key);
      const existingDocument = findDocument(previous, key);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentConnections = currentDocument ? getConnections(currentDocument) : {};
      const previousConnections = existingDocument ? getConnections(existingDocument) : {};

      for (const field in { ...currentConnections, ...previousConnections }) {
        const currentFieldConnections = currentConnections[field] ?? [];
        const previousFieldConnections = previousConnections[field] ?? [];

        const newConnections = currentFieldConnections
          .filter((key) => !previousFieldConnections.includes(key))
          .map((key: KeyOrDocument) => ({
            field,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document: currentDocument!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            connectedTo: findDocument(current, key)!,
          }));

        const newDisconnections = previousFieldConnections
          .filter((key) => !currentFieldConnections.includes(key))
          .map((key: KeyOrDocument) => ({
            field,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document: currentDocument!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            disconnectedFrom: findDocument(current, key)!,
          }));

        connections.push(...newConnections);
        disconnections.push(...newDisconnections);
      }

      return { connections, disconnections };
    },
    { connections: [], disconnections: [] } as {
      connections: { field: string; document: Document; connectedTo: Document }[];
      disconnections: { field: string; document: Document; disconnectedFrom: Document }[];
    },
  );

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
    connections,
    disconnections,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dispatch(previous: DocumentStore, store: DocumentStore, eventTarget: EventTarget) {
  previous;
  store;
  eventTarget;

  const dispatchCreated = (document: Document) => eventTarget.dispatchEvent(new CreateEvent({ document, store }));
  const dispatchRemoved = (document: Document) => eventTarget.dispatchEvent(new RemoveEvent({ document, store }));
  const dispatchModified = (changes: DocumentModifiedChangeMap, document: Document) =>
    eventTarget.dispatchEvent(new ModifyEvent({ document, store, changes }));
  const dispatchConnected = (document: Document, field: string, connectedTo: Document) =>
    eventTarget.dispatchEvent(new ConnectEvent({ document, field, connectedTo, store }));
  const dispatchDisconnected = (document: Document, field: string, disconnectedFrom: Document) =>
    eventTarget.dispatchEvent(new DisconnectEvent({ document, field, disconnectedFrom, store }));

  const { createdDocuments, removedDocuments, modifiedDocuments, connections, disconnections } = extractChanges(
    store,
    previous,
  );
  createdDocuments.forEach(({ document }) => dispatchCreated(document));
  removedDocuments.forEach(({ document }) => dispatchRemoved(document));
  modifiedDocuments.forEach(({ changes, document }) => dispatchModified(changes, document));
  connections.forEach(({ document, field, connectedTo }) => dispatchConnected(document, field, connectedTo));
  disconnections.forEach(({ document, field, disconnectedFrom }) =>
    dispatchDisconnected(document, field, disconnectedFrom),
  );
}
