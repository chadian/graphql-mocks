import { GraphQLSchema, isObjectType } from 'graphql';
import { typeExists } from '../utils/graphql/type-exists';
import { TypeDoesNotExist } from './errors/type-does-not-exist';
import { TypeIsNotDocumentCompatible } from './errors/type-is-not-document-compatible';
import { getDocumentTypename } from '../utils/get-document-typename';
import { DocumentStore, Document, DocumentTypeValidator, FieldValidator } from '../types';
import { validateField } from './validate-field';

export function validate(
  graphqlSchema: GraphQLSchema,
  document: Document,
  store: DocumentStore,
  validators: { document: DocumentTypeValidator[]; field: FieldValidator[] },
): void {
  const typename = getDocumentTypename(document);
  const type = graphqlSchema.getType(typename);

  if (!type) {
    throw new Error(`Type ${typename} does not exist in the graphql schema.`);
  }

  if (!isObjectType(type)) {
    throw new TypeIsNotDocumentCompatible({ type });
  }

  if (!typeExists(graphqlSchema, typename)) {
    throw new TypeDoesNotExist({ typename });
  }

  const combinedValidators: DocumentTypeValidator[] = [...validators.document, validateField(validators.field)];
  combinedValidators.forEach((validator) => validator.validate({ store, graphqlSchema, document, type }));
}
