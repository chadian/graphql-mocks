import { FieldValidator } from '../../types';
import { getConnections } from '../../utils/get-connections';
import { FieldDuplicateWithConnection } from '../errors/field-duplicate-with-connection';

export const exclusiveFieldOrConnectionValueForfield: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: false,
  validate({ type, fieldName, fieldValue, document }) {
    const documentConnections = getConnections(document);
    const connectionFieldValue = documentConnections[fieldName];
    const hasFieldValueAndConnectionValue = fieldValue && connectionFieldValue;
    if (hasFieldValueAndConnectionValue) {
      throw new FieldDuplicateWithConnection({ type, fieldName });
    }
  },
};
