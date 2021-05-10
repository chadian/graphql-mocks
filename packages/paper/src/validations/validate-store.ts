import { GraphQLSchema } from 'graphql';
import { Document, DocumentStore, DocumentTypeValidator, FieldValidator } from '../types';
import { validate } from './validate';

export function validateStore(
  store: DocumentStore,
  graphqlSchema: GraphQLSchema,
  validators: { document: DocumentTypeValidator[]; field: FieldValidator[] },
): void {
  Object.values(store).forEach((documents) => {
    documents.forEach((document: Document) => {
      validate(graphqlSchema, document, store, validators);
    });
  });
}
