import { DocumentTypeValidator, FieldValidator } from '../types';
import { getConnections } from '../utils/get-connections';

export const validateField: (fieldValidators: FieldValidator[]) => DocumentTypeValidator = (
  fieldValidators: FieldValidator[],
) => {
  return {
    validate({ graphqlSchema, type, document, store }) {
      const graphqlTypeFields = type.getFields();

      for (const fieldName in graphqlTypeFields) {
        const field = graphqlTypeFields[fieldName];
        const fieldValue = document[fieldName];
        const connectionValue = getConnections(document)[fieldName];

        fieldValidators.forEach((fieldValidator) => {
          if (fieldValidator.skipConnectionValue && connectionValue) {
            return;
          }

          if (fieldValidator.skipNullValue && fieldValue == null) {
            return;
          }

          fieldValidator.validate({
            type,
            field,
            document,
            fieldName: field.name,
            fieldValue,
            fieldConnections: connectionValue,
            graphqlSchema,
            store,
          });
        });
      }
    },
  };
};
