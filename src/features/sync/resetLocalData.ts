export function resetAllLocalData(): void {
  const KEYS_TO_CLEAR = [
    'od:calendar:events:v1',
    'od:notes:v2',
    'grades.state.v2',
    'grades.items',
    'od:userProfile:v1',
    'od:tasks',
    'od:notes',
    'od:grades',
    'od:aijobs',
  ];

  try {
    KEYS_TO_CLEAR.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (err) {
    // Swallow errors if storage is unavailable
  }
}
