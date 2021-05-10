import { isObjectType } from 'graphql';
import { FieldValidator } from '../../types';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const objectFieldValidator: FieldValidator = {
  skipConnectionValue: true,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    if (isObjectType(field.type) && typeof fieldValue !== 'object') {
      throw new FieldReturnTypeMismatch({
        field: field,
        expected: 'object',
        actual: typeof fieldValue,
      });
    }
  },
};
