import { FieldValidator } from '../../types';
import { extractListType } from '../../utils/graphql/extract-list-type';
import { FieldCannotConnectMultiple } from '../errors/field-cannot-connect-multiple';

export const multipleConnectionsForNonListField: FieldValidator = {
  skipConnectionValue: false,
  skipNullValue: false,
  validate({ fieldConnections, type, field }) {
    if (!extractListType(field.type) && fieldConnections && fieldConnections?.length > 1) {
      throw new FieldCannotConnectMultiple({ type, field });
    }
  },
};
