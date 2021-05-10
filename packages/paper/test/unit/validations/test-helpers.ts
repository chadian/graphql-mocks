import { buildSchema, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { FieldValidator } from '../../../src/types';
import { createDocument } from '../../../src/utils/create-document';
import { getConnections } from '../../../src/utils/get-connections';

export function buildTestSchema(personFields?: string): GraphQLSchema {
  personFields = personFields ?? `name: String`;

  const schemaString = `
    schema {
      query: Query
    }

    type Query {
      person: Person
    }

    type Person {
      ${personFields}
    }

    enum Food {
      PIZZA
      POTATOES
      CEREAL
    }
  `;

  return buildSchema(schemaString);
}

export const createMockFieldValidatorOptions = (
  options: Partial<Parameters<FieldValidator['validate']>[0]> & { fieldName: string },
): Parameters<FieldValidator['validate']>[0] => {
  const schema = options.graphqlSchema ?? buildTestSchema();
  const type = options.type ?? (schema.getType('Person') as GraphQLObjectType);
  const field = options.field ?? type.getFields()[options.fieldName];
  const document = options.document ?? createDocument(type.name, {});

  return {
    graphqlSchema: schema,
    type,
    field,
    document,
    fieldName: options.fieldName,
    fieldValue: document[field.name],
    connectionValue: getConnections(document)[field.name],
  };
};
