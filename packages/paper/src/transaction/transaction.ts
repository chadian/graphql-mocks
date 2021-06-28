import {
  BoundOperationMap,
  DocumentStore,
  HooksMap,
  OperationContext,
  OperationMap,
  TransactionCallback,
} from '../types';
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
): Promise<{ eventQueue: Event[]; transactionResult: ReturnType<TransactionCallback<T>> }> {
  expandConnections(schema, store);
  const eventQueue: Event[] = [];
  hooks = Object.freeze({ ...hooks });
  const context: OperationContext = { schema, store, eventQueue };

  const boundOperations = createBoundOperations(operations, context) as BoundOperationMap<T>;
  await sequential(hooks.beforeTransaction, boundOperations);
  // perform transaction
  const transactionResult = await fn(boundOperations);
  await sequential(hooks.afterTransaction, boundOperations);

  collapseConnections(schema, store);
  return { transactionResult, eventQueue };
}

function createBoundOperations(
  operations: OperationMap,
  context: OperationContext,
): BoundOperationMap<typeof operations> {
  const boundOperations: BoundOperationMap<typeof operations> = {};

  for (const key in operations) {
    const fn = operations[key];
    boundOperations[key] = fn.bind(null, context);
  }

  return boundOperations;
}
