// Fixed Supabase Client - No Auth Persistence
function initializeSupabase() {
    try {
        const SUPABASE_URL = 'https://eubneyjjdjjxztdmitky.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Ym5leWpqZGpqeHp0ZG1pdGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODczNzQsImV4cCI6MjA3ODk2MzM3NH0.BsVd2BcWC_uQ2UEseleWbqOR3VTBJmPDW9yXgXhfzeI'; // Replace with your actual key
        
        console.log("🚀 Initializing Supabase without auth persistence...");
        
        if (typeof supabase === 'undefined') {
            console.error("❌ Supabase library not found!");
            return null;
        }
        
        // Create client WITHOUT auth persistence (fixes the lock error)
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,  // ✅ This fixes the navigator lock error
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });
        
        window.supabase = client;
        console.log("✅ Supabase client initialized successfully (no auth persistence)!");
        return client;
        
    } catch (error) {
        console.error("❌ Failed to initialize Supabase:", error);
        return null;
    }
}

// Initialize immediately (don't wait for DOM)
if (typeof supabase !== 'undefined') {
    initializeSupabase();
} else {
    // Wait for Supabase library to load
    document.addEventListener('DOMContentLoaded', initializeSupabase);
}

// Verifone Configuration
window.verifoneConfig = {
    merchantId: '255781290131', // REPLACE WITH YOUR ACTUAL MERCHANT ID
    environment: 'production', // or 'sandbox' for testing
    apiKey: '?VG8CEpvXlgdRT&%|HA*' // REPLACE WITH YOUR ACTUAL API KEY
};
