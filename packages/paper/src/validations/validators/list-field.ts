import { isListType, isNullableType } from 'graphql';
import { FieldValidator } from '../../types';
import { extractListType } from '../../utils/graphql/extract-list-type';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const listFieldValidator: FieldValidator = {
  skipConnectionValue: true,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    if (isListType(field.type)) {
      if (!Array.isArray(fieldValue)) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'Array',
          actual: typeof fieldValue,
        });
      }

      const nullishIndex = fieldValue.findIndex((element) => element == null);
      const listType = extractListType(field.type);
      const isNullable = isNullableType(listType?.ofType);

      if (!isNullable && nullishIndex !== -1) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'non-null list',
          actual: `${fieldValue[nullishIndex]} in the array`,
        });
      }
    }
  },
};
