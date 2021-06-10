import { GraphQLSchema, isObjectType } from 'graphql';
import { DocumentStore } from '../types';

export function createDocumentStore(schema?: GraphQLSchema): DocumentStore {
  const store: DocumentStore = {};

  if (!schema) {
    return store;
  }

  const typeMap = schema.getTypeMap();
  for (const typeName in typeMap) {
    const type = typeMap[typeName];
    const isInternalType = type.name.startsWith('__');
    const rootTypeNames = [
      schema.getQueryType()?.name,
      schema.getMutationType()?.name,
      schema.getSubscriptionType()?.name,
    ];

    if (isObjectType(type) && !isInternalType && !rootTypeNames.includes(type.name)) {
      store[type.name] = [];
    }
  }

  return store;
}
