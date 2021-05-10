import { GraphQLObjectType } from 'graphql';

export class FieldDoesNotExistOnType extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ type, fieldName }: { type: GraphQLObjectType; fieldName: string }) {
    super();

    this.name = 'TypeDoesNotExist';
    this.message = `The field "${fieldName}" does not exist on the type ${type.name}.`;
  }
}
