#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function checkIndexesSimple() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'authdb',
        user: process.env.DB_USER || 'authuser',
        password: process.env.DB_PASSWORD || 'authuser123',
    });

    try {
        console.log('🔍 Checking Database Indexes (Simple Method)...\n');

        // Check indexes using our custom function
        console.log('📋 Index Information:');
        const indexResult = await pool.query('SELECT * FROM get_index_info()');
        
        if (indexResult.rows.length === 0) {
            console.log('❌ No indexes found on userAuth table!');
        } else {
            indexResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.index_name}`);
                console.log(`   Unique: ${row.is_unique ? 'Yes' : 'No'}`);
                console.log(`   Primary: ${row.is_primary ? 'Yes' : 'No'}`);
                console.log(`   Definition: ${row.index_definition}\n`);
            });
        }

        // Test performance with our custom function
        console.log('🚀 Performance Test Results:');
        const perfResult = await pool.query("SELECT * FROM test_index_performance('john.doe@example.com')");
        
        perfResult.rows.forEach(row => {
            console.log(`${row.operation}:`);
            console.log(`  Execution time: ${row.execution_time_ms.toFixed(3)} ms`);
            console.log(`  Rows returned: ${row.rows_returned}\n`);
        });

        // Test a simple query to verify indexes are working
        console.log('✅ Testing Simple Queries:');
        
        const startTime = Date.now();
        const userResult = await pool.query("SELECT COUNT(*) FROM userAuth WHERE mail = 'john.doe@example.com'");
        const endTime = Date.now();
        
        console.log(`Query execution time: ${endTime - startTime} ms`);
        console.log(`User count: ${userResult.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error checking indexes:', error.message);
    } finally {
        await pool.end();
    }
}

// Run the check
checkIndexesSimple();
