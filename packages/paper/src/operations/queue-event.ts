import { OperationContext } from '../types';

export function queueEventOperation(context: OperationContext, event: Event): void {
  const { eventQueue } = context;
  eventQueue.push(event);
}
