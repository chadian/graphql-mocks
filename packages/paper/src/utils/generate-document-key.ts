import { nanoid } from 'nanoid';

export const generateDocumentKey = (): string => nanoid(10);
