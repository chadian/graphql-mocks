const { nanoid } = require('nanoid');

const generateDocumentKey = () => nanoid(10);

module.exports = { generateDocumentKey };
