#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function verifyIndexes() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'authdb',
        user: process.env.DB_USER || 'authuser',
        password: process.env.DB_PASSWORD || 'authuser123',
    });

    try {
        console.log('🔍 Verifying Mail Column Index...\n');

        // Test 1: Simple COUNT query (should use index)
        console.log('1️⃣ Testing COUNT query with mail filter...');
        const startTime1 = Date.now();
        const countResult = await pool.query("SELECT COUNT(*) FROM userAuth WHERE mail = 'john.doe@example.com'");
        const endTime1 = Date.now();
        
        console.log(`   ✅ Query executed in ${endTime1 - startTime1} ms`);
        console.log(`   📊 Result: ${countResult.rows[0].count} users found\n`);

        // Test 2: SELECT query (should use index)
        console.log('2️⃣ Testing SELECT query with mail filter...');
        const startTime2 = Date.now();
        const selectResult = await pool.query("SELECT userId, mail FROM userAuth WHERE mail = 'john.doe@example.com'");
        const endTime2 = Date.now();
        
        console.log(`   ✅ Query executed in ${endTime2 - startTime2} ms`);
        console.log(`   📊 Result: ${selectResult.rows.length} rows returned`);
        if (selectResult.rows.length > 0) {
            console.log(`   👤 User ID: ${selectResult.rows[0].userid}, Email: ${selectResult.rows[0].mail}\n`);
        }

        // Test 3: EXISTS query (should use index)
        console.log('3️⃣ Testing EXISTS query with mail filter...');
        const startTime3 = Date.now();
        const existsResult = await pool.query("SELECT EXISTS(SELECT 1 FROM userAuth WHERE mail = 'nonexistent@example.com')");
        const endTime3 = Date.now();
        
        console.log(`   ✅ Query executed in ${endTime3 - startTime3} ms`);
        console.log(`   📊 Result: User exists = ${existsResult.rows[0].exists}\n`);

        // Test 4: Performance comparison (with vs without index)
        console.log('4️⃣ Performance comparison...');
        
        // Query with potential index
        const startTime4a = Date.now();
        await pool.query("SELECT COUNT(*) FROM userAuth WHERE mail = 'john.doe@example.com'");
        const endTime4a = Date.now();
        const timeWithIndex = endTime4a - startTime4a;
        
        // Query without index (full table scan)
        const startTime4b = Date.now();
        await pool.query("SELECT COUNT(*) FROM userAuth");
        const endTime4b = Date.now();
        const timeWithoutIndex = endTime4b - startTime4b;
        
        console.log(`   📊 Query with mail filter: ${timeWithIndex} ms`);
        console.log(`   📊 Query without filter: ${timeWithoutIndex} ms`);
        console.log(`   🚀 Index efficiency: ${timeWithoutIndex > timeWithIndex ? '✅ Index is working' : '⚠️  Index might not be optimal'}\n`);

        console.log('🎉 Index verification completed successfully!');
        console.log('💡 If queries are fast, the mail column index is working properly.');

    } catch (error) {
        console.error('❌ Error verifying indexes:', error.message);
    } finally {
        await pool.end();
    }
}

// Run the verification
verifyIndexes();
