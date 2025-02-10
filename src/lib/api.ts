// Create a centralized API handling
export async function fetchData<T>(
  query: Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error as Error };
  }
}
