// ==============================================================================
// CLIENT INITIALIZATION & FAIL-FAST PRODUCTION GUARD
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const explicitMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const isProduction = import.meta.env.PROD;

let supabaseInstance = null;
let activeMode = 'mock'; // 'supabase' | 'mock'
let configurationError = null;

// Production Fail-Fast Validation Rule
if (isProduction) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
    configurationError = 
      'FATAL CONFIGURATION ERROR: Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing in production. ' +
      'Production builds are strictly forbidden from silently falling back to mock data. Please configure environment variables in your Vercel deployment settings.';
    console.error(configurationError);
  } else {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
      activeMode = 'supabase';
    } catch (err) {
      configurationError = `FATAL SUPABASE INITIALIZATION ERROR: ${err.message}`;
      console.error(configurationError);
    }
  }
} else {
  // Development mode: Allow mock if keys are absent OR explicit mock mode is set
  if (!explicitMockMode && supabaseUrl && supabaseAnonKey && supabaseUrl.trim() !== '') {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      activeMode = 'supabase';
    } catch (e) {
      console.warn('Supabase initialization failed in dev, falling back to local MockAdapter.', e);
      activeMode = 'mock';
    }
  } else {
    activeMode = 'mock';
  }
}

export { supabaseInstance, activeMode, configurationError };
