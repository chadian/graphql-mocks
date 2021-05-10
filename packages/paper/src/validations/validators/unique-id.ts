import { GraphQLNamedType } from 'graphql';
import { FieldValidator } from '../../types';
import { unwrap } from '../../utils/graphql/unwrap';

export const uniqueIdFieldValidator: FieldValidator = {
  skipConnectionValue: true,
  skipNullValue: true,
  validate({ type, fieldName, fieldValue, store, field }) {
    const returnType = unwrap(field.type);
    const typeDocuments = store[type.name] ?? [];

    if ((returnType as GraphQLNamedType)?.name === 'ID') {
      const matchingIdDocuments = typeDocuments.filter((doc) => doc[fieldName] === fieldValue);
      const hasDuplicates = matchingIdDocuments.length > 1;

      if (hasDuplicates) {
        const documentsToCheckNotice = matchingIdDocuments
          .map((document) => JSON.stringify(document, null, 2))
          .join('\n\n');

        throw new Error(
          `Found duplciate documents with same ID ("${fieldValue}") for type "${type.name}" on field "${fieldName}":\n\n${documentsToCheckNotice}"`,
        );
      }
    }
  },
};
