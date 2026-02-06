require('dotenv/config');
const { Client } = require('pg');

async function testConnections() {
  console.log('🔍 Testing database connections...\n');
  
  const configs = [
    {
      name: 'Direct Connection',
      connectionString: process.env.DATABASE_URL
    },
    {
      name: 'Without SSL',
      connectionString: process.env.DATABASE_URL.replace('?sslmode=require', '')
    },
    {
      name: 'Pooler Connection',
      connectionString: process.env.DATABASE_URL.replace('db.', 'aws-0-ap-south-1.pooler.').replace('?sslmode=require', '?sslmode=require&connect_timeout=10')
    }
  ];

  for (const config of configs) {
    console.log(`🧪 Testing: ${config.name}`);
    console.log(`🔗 URL: ${config.connectionString.substring(0, 50)}...`);
    
    const client = new Client({
      connectionString: config.connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log('✅ SUCCESS: Connected to database');
      
      // Test a simple query
      const result = await client.query('SELECT version(), current_database(), current_user');
      console.log(`📊 Database: ${result.rows[0].current_database}`);
      console.log(`👤 User: ${result.rows[0].current_user}`);
      
      await client.end();
      return true; // Return on first successful connection
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Ignore end errors
      }
    }
    
    console.log('---');
  }
  
  console.log('\n🔄 Trying alternative approaches...');
  
  // Try with different SSL modes
  const sslModes = ['require', 'prefer', 'disable'];
  
  for (const sslMode of sslModes) {
    console.log(`\n🧪 SSL Mode: ${sslMode}`);
    
    const modifiedUrl = process.env.DATABASE_URL.replace(/\?sslmode=[^&]+/, `?sslmode=${sslMode}`)
                                               .replace(/(?<!\?)sslmode=[^&]+/, '')
                                               .replace(/\?$/, '');
    
    const client = new Client({
      connectionString: modifiedUrl,
      ssl: sslMode === 'disable' ? false : {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log('✅ SUCCESS with SSL mode:', sslMode);
      await client.end();
      return true;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Ignore
      }
    }
  }
  
  return false;
}

testConnections()
  .then(success => {
    if (success) {
      console.log('\n🎉 Database connection successful!');
      process.exit(0);
    } else {
      console.log('\n💥 All connection attempts failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });