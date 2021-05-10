import { GraphQLObjectType } from 'graphql';

export class FieldDuplicateWithConnection extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ type, fieldName }: { type: GraphQLObjectType; fieldName: string }) {
    super();

    this.name = 'FieldDuplicateWithConnection';
    this.message = `The field "${fieldName}" on ${type.name} cannot be represented by both a Document connection and javascript value.`;
  }
}
