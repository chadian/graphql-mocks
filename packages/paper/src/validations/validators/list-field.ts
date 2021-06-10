import { isListType, isNullableType } from 'graphql';
import { FieldValidator } from '../../types';
import { extractListType } from '../../graphql/extract-list-type';
import { key as nullDocumentKey } from '../../document/null-document';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const listFieldValidator: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: true,
  validate({ field, fieldValue, fieldConnections }) {
    const listType = extractListType(field.type);

    if (isListType(listType)) {
      if (fieldValue && !Array.isArray(fieldValue)) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'Array',
          actual: typeof fieldValue,
        });
      }

      const isNonNullList = !isNullableType(listType?.ofType);
      if (isNonNullList) {
        const nullishIndex = Array.isArray(fieldValue) ? fieldValue.findIndex((element) => element == null) : -1;
        const nullishConnectionIndex = fieldConnections?.findIndex((key) => key === nullDocumentKey) ?? -1;

        if (nullishIndex !== -1) {
          throw new FieldReturnTypeMismatch({
            field: field,
            expected: 'non-null list',
            actual: `${fieldValue[nullishIndex]} in the array`,
          });
        } else if (nullishConnectionIndex !== -1) {
          throw new FieldReturnTypeMismatch({
            field: field,
            expected: 'non-null list',
            actual: `connected null document`,
          });
        }
      }
    }
  },
};
