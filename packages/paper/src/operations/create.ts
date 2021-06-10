import { GraphQLObjectType } from 'graphql';
import { Document, DocumentPartial, OperationContext } from '../types';
import { findDocument } from '../store/find-document';
import { extractObjectTypes } from '../graphql/extract-object-types';
import { isDocument } from '../document/is-document';
import { createDocument } from '../document/create-document';
import { extractListType } from '../graphql/extract-list-type';

export function createOperation(
  context: OperationContext,
  typename: string,
  documentPartial: DocumentPartial,
): Document {
  const { store, schema } = context;
  const document = createDocument(typename, documentPartial);
  const gqlType = schema.getType(typename) as Partial<GraphQLObjectType>;
  const gqlTypeFields = (gqlType?.getFields && gqlType?.getFields()) ?? {};

  // setup array of types if it doesn't already exist
  store[typename] = store[typename] || [];
  store[typename].push(document);

  for (const fieldName in document) {
    const field = gqlTypeFields[fieldName];

    if (!field) {
      continue;
    }

    const documentFieldValue = document[fieldName];
    const possibleObjectTypes = extractObjectTypes(schema, field.type);
    const hasObjectReferences = possibleObjectTypes.length > 0;
    const isSingularConnection = hasObjectReferences && !extractListType(field.type);

    if (!hasObjectReferences) {
      document[fieldName] = documentFieldValue;
      continue;
    }

    if (documentFieldValue != null) {
      const connectionCandidates = Array.isArray(documentFieldValue) ? documentFieldValue : [documentFieldValue];

      const connectionDocuments = connectionCandidates.map((candidate) => {
        const isExistingDocument = isDocument(candidate) && findDocument(store, candidate) !== undefined;

        if (isExistingDocument || candidate === null) {
          return candidate;
        }

        if (candidate && possibleObjectTypes.length > 1) {
          throw new Error(
            `The "${typename}" with field "${fieldName}" is represented by multiple types: ${possibleObjectTypes.join(
              ', ',
            )}. Therefore, cannot create document automatically for: \n\n ${JSON.stringify(
              documentFieldValue,
              null,
              2,
            )}.\n\nUse the \`create\` operation within mutate to explicitly create this document with one of possible types (${possibleObjectTypes.join(
              ', ',
            )}) and assign the connection explictly.`,
          );
        }

        const [fieldObjectType] = possibleObjectTypes;
        const result = createOperation(context, fieldObjectType.name, candidate);
        return result;
      });

      // Technically a singular connection field with multiple documents isn't
      // allowed but this will be caught by the validations. The createOperation
      // is only concerned with automatically creating documents that don't exist
      document[fieldName] =
        isSingularConnection && connectionDocuments.length === 1 ? connectionDocuments[0] : connectionDocuments;
      continue;
    }
  }

  return document;
}
