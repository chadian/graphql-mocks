import { BoundOperationMap, DocumentStore, HooksMap, Operation, OperationMap, TransactionCallback } from '../types';
import { GraphQLSchema } from 'graphql';
import { collapseConnections } from '../document/collapse-connections';
import { expandConnections } from '../document/expand-connections';
import { sequential } from '../hooks/sequential';

export async function transaction<T extends OperationMap>(
  store: DocumentStore,
  schema: GraphQLSchema,
  operations: T,
  hooks: HooksMap<T>,
  fn: TransactionCallback<T>,
): Promise<ReturnType<TransactionCallback<T>>> {
  expandConnections(schema, store);

  hooks = Object.freeze({ ...hooks });
  const context = { schema, store, hooks };

  const boundOperations: BoundOperationMap<T> = {} as BoundOperationMap<T>;
  for (const key in operations) {
    const fn = operations[key] as Operation;
    boundOperations[key] = fn.bind(null, context) as BoundOperationMap<T>[typeof key];
  }

  await sequential(hooks.beforeTransaction, boundOperations);
  const transactionPayload = await fn(boundOperations);
  await sequential(hooks.afterTransaction, boundOperations);

  collapseConnections(schema, store);
  return transactionPayload;
}
