import { BoundOperationMap, Hook, OperationMap } from '../types';

export async function sequential<T extends OperationMap>(
  hooks: Hook<T>[],
  operations: BoundOperationMap<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const results = [];

  for (const hook of hooks) {
    results.push(await hook(operations));
  }

  return results;
}
