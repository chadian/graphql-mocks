import { DocumentTypeValidator } from '../../types';
import { FieldDoesNotExistOnType } from '../errors/field-does-not-exist-on-type';

export const exclusiveDocumentFieldsOnType: DocumentTypeValidator = {
  validate({ document, type }) {
    const documentFieldNames = Object.keys(document);
    const typeFieldNames = Object.keys(type.getFields());
    const nonExistingFieldName = documentFieldNames.find((fieldName) => !typeFieldNames.includes(fieldName));

    if (nonExistingFieldName) {
      throw new FieldDoesNotExistOnType({ type, fieldName: nonExistingFieldName });
    }
  },
};
