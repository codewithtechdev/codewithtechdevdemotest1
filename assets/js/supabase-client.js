// Supabase Client with Verifone Configuration
function initializeSupabase() {
    try {
        // Use environment variables or fallback
        const SUPABASE_URL = window.SUPABASE_URL || 'https://eubneyjjdjjxztdmitky.supabase.co';
        const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Ym5leWpqZGpqeHp0ZG1pdGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODczNzQsImV4cCI6MjA3ODk2MzM3NH0.BsVd2BcWC_uQ2UEseleWbqOR3VTBJmPDW9yXgXhfzeI';
        
        console.log("Initializing Supabase with URL:", SUPABASE_URL);
        
        if (typeof supabase === 'undefined') {
            console.error("Supabase library not found!");
            return null;
        }
        
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = client;
        
        console.log("Supabase client initialized successfully!");
        return client;
        
    } catch (error) {
        console.error("Failed to initialize Supabase:", error);
        return null;
    }
}

// Verifone Configuration
window.verifoneConfig = {
    merchantId: '255781290131', // REPLACE WITH YOUR ACTUAL MERCHANT ID
    environment: 'production', // or 'sandbox' for testing
    apiKey: '?VG8CEpvXlgdRT&%|HA*' // REPLACE WITH YOUR ACTUAL API KEY
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeSupabase, 1);
}