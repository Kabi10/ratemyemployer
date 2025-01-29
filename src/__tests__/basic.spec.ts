import { supabase } from '../lib/supabaseClient'
import { createClient } from 'supabase'

describe('Supabase Connection', () => {
  test('should successfully connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
    expect(Array.isArray(data)).toBe(true)
  })

  test('should handle connection errors gracefully', async () => {
    // Mock a failed connection
    const invalidSupabase = createClient('invalid-url', 'invalid-key')
    const { data, error } = await invalidSupabase
      .from('companies')
      .select('*')
    
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })
}) 