import { BoundOperationMap, OperationContext, OperationMap } from '../types';

export function createBoundOperations(
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
