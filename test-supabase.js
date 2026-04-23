const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Query failed:', error.message);
      process.exit(1);
    }
    
    console.log('✓ Supabase connected. Found', data.length, 'users');
    process.exit(0);
  } catch (e) {
    console.log('❌ Error:', e.message);
    process.exit(1);
  }
})();
