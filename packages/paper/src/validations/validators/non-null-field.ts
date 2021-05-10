import { isNonNullType } from 'graphql';
import { FieldValidator } from '../../types';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const nonNullFieldValidator: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: false,
  validate({ field, fieldValue, connectionValue }) {
    if (isNonNullType(field.type)) {
      if (fieldValue == null && connectionValue == null) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'non-null',
          actual: fieldValue === undefined ? 'undefined' : 'null',
        });
      }
    }
  },
};
