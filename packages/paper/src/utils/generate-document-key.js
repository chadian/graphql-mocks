import { nanoid } from 'nanoid';

const generateDocumentKey = () => nanoid(10);

module.exports = { generateDocumentKey };
