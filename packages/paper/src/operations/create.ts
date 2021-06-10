import { GraphQLObjectType } from 'graphql';
import { Document, DocumentPartial, OperationContext } from '../types';
import { findDocument } from '../store/find-document';
import { extractObjectTypes } from '../graphql/extract-object-types';
import { isDocument } from '../document/is-document';
import { createDocument } from '../document/create-document';

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
    const documentFieldValue = document[fieldName];
    const possibleObjectTypes = extractObjectTypes(schema, field.type);
    const isExistingDocument = isDocument(documentFieldValue) && findDocument(store, documentFieldValue);

    if (isExistingDocument && !field) {
      throw new Error(
        `Passed a document for ${fieldName} but there isn't a corresponding field for graphql type ${typename}`,
      );
    }

    if (field && documentFieldValue && !isExistingDocument && possibleObjectTypes.length > 1) {
      throw new Error(
        `type ${typename}, field ${fieldName} is represented by multiple types: ${possibleObjectTypes.join(
          ', ',
        )}. Therefore, cannot create document automatically for: \n\n ${JSON.stringify(
          documentFieldValue,
          null,
          2,
        )}.\n\nUse the \`create\` function within mutate to explicitly create this document with one of possible types (${possibleObjectTypes.join(
          ', ',
        )}) and assign the connection explictly.`,
      );
    }

    // TODO: Handle List document values
    if (field && documentFieldValue && possibleObjectTypes.length === 1) {
      const [typeToCreate] = possibleObjectTypes;

      document[fieldName] = isExistingDocument
        ? documentFieldValue
        : createOperation(context, typeToCreate.name, documentFieldValue);
    }
  }

  return document;
}
