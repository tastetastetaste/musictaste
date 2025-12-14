export function compareIds(newIds: string[] = [], currentIds: string[] = []) {
  const addedIds = newIds.filter(
    (id) => !currentIds.some((appliedId) => appliedId === id),
  );
  const removedIds = currentIds.filter(
    (appliedId) => !newIds.some((id) => id === appliedId),
  );
  const remainingIds = currentIds.filter((appliedId) =>
    newIds.some((id) => id === appliedId),
  );
  return { addedIds, removedIds, remainingIds };
}
