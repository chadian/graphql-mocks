export function allDocuments(data) {
  const all = Object.values(data).reduce((all, documents) => {
    return [...all, ...documents];
  }, []);

  return all;
}
