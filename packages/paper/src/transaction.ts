import { BoundOperationMap, DocumentStore, Operation, OperationMap, TransactionCallback } from './types';
import { GraphQLSchema } from 'graphql';
import { expandConnections } from './utils/expand-connections';
import { collapseConnections } from './utils/collapse-connections';

export async function transaction<T extends OperationMap>(
  draft: DocumentStore,
  schema: GraphQLSchema,
  contextualOperations: T,
  fn: TransactionCallback<T>,
): Promise<ReturnType<TransactionCallback<T>>> {
  expandConnections(draft);
  const context = { schema, store: draft };

  const boundOperations: BoundOperationMap<T> = {} as BoundOperationMap<T>;
  for (const key in contextualOperations) {
    const fn = contextualOperations[key] as Operation;
    boundOperations[key] = fn.bind(null, context) as BoundOperationMap<T>[typeof key];
  }

  const transactionPayload = await fn(boundOperations);

  collapseConnections(schema, draft);
  return transactionPayload;
}
