import { GraphQLNamedType } from 'graphql';

export class TypeIsNotDocumentCompatible extends Error {
  constructor({ type }: { type: GraphQLNamedType }) {
    super();

    this.name = 'TypeIsNotDocumentCompatible';
    this.message = `The type "${type.name}" is a ${type.astNode?.kind} but cannot be represented by a document`;
  }
}
