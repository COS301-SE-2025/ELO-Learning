// Utility to get the latest accuracy percentage from the API result
export function getLatestAccuracy(apiResult) {
  if (!apiResult || !apiResult.success || !Array.isArray(apiResult.accuracy))
    return null;
  const arr = apiResult.accuracy;
  if (arr.length === 0) return null;
  // Get the last item (latest day)
  const latest = arr[arr.length - 1];
  return typeof latest.accuracy_percentage === 'number'
    ? Math.round(latest.accuracy_percentage)
    : null;
}
