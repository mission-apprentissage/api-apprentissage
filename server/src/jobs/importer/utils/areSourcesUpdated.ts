export function areSourcesUpdated(
  lastImportSources: Record<string, { import_date: Date }> | null | undefined,
  currentSources: Record<string, { import_date: Date }>
): boolean {
  if (!lastImportSources) {
    return true;
  }

  for (const source in currentSources) {
    if (!lastImportSources[source] || lastImportSources[source].import_date < currentSources[source].import_date) {
      return true;
    }
  }

  return false;
}
