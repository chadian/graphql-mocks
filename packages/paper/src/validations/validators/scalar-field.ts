import { isScalarType } from 'graphql/type/definition';
import { FieldValidator } from '../../types';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const scalarFieldValidator: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    const jsScalars = ['boolean', 'number', 'string'];
    if (isScalarType(field.type) && !jsScalars.includes(typeof fieldValue)) {
      throw new FieldReturnTypeMismatch({
        field: field,
        expected: 'boolean, number, string',
        actual: typeof fieldValue,
      });
    }
  },
};
