import { GraphQLSchema } from 'graphql';
import { Document, DataStore, DocumentTypeValidator, FieldValidator } from '../types';
import { validate } from './validate';

export function validateStore(
  store: DataStore,
  graphqlSchema: GraphQLSchema,
  validators: { document: DocumentTypeValidator[]; field: FieldValidator[] },
): void {
  Object.values(store).forEach((documents) => {
    documents.forEach((document: Document) => {
      validate(graphqlSchema, document, store, validators);
    });
  });
}
