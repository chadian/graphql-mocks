import { isNonNullType } from 'graphql';
import { FieldValidator } from '../../types';
import { key as nullDocumentKey } from '../../utils/null-document';
import { FieldReturnTypeMismatch } from '../errors/field-return-type-mismatch';

export const nonNullFieldValidator: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: false,
  validate({ field, fieldValue, fieldConnections: connections }) {
    if (isNonNullType(field.type)) {
      const hasConnectedNullDocument = connections?.length === 1 && connections?.includes(nullDocumentKey);

      const actual = hasConnectedNullDocument ? 'null document' : fieldValue === undefined ? 'undefined' : 'null';
      if (fieldValue == null && (hasConnectedNullDocument || !connections)) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'non-null',
          actual,
        });
      }
    }
  },
};
