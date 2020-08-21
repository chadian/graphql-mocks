import { Reference, TypeReference } from '../types';

export function isTypeReference(reference: Reference): reference is TypeReference {
  return typeof reference === 'string';
}