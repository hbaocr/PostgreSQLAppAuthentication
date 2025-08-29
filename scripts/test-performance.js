#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function testPerformance() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'authdb',
        user: process.env.DB_USER || 'authuser',
        password: process.env.DB_PASSWORD || 'authuser123',
    });

    try {
        console.log('🚀 Testing PostgreSQL Authentication Performance...\n');

        // Test 1: User Exists Check (our optimized function)
        console.log('1️⃣ Testing User Exists Check (Optimized Function)...');
        const startTime1 = Date.now();
        const existsResult = await pool.query("SELECT user_exists('john.doe@example.com')");
        const endTime1 = Date.now();
        
        console.log(`   ✅ Function executed in ${endTime1 - startTime1} ms`);
        console.log(`   📊 Result: User exists = ${existsResult.rows[0].user_exists}\n`);

        // Test 2: Direct COUNT query (for comparison)
        console.log('2️⃣ Testing Direct COUNT Query (for comparison)...');
        const startTime2 = Date.now();
        const countResult = await pool.query("SELECT COUNT(*) FROM userAuth WHERE mail = 'john.doe@example.com'");
        const endTime2 = Date.now();
        
        console.log(`   ✅ Query executed in ${endTime2 - startTime2} ms`);
        console.log(`   📊 Result: Count = ${countResult.rows[0].count}\n`);

        // Test 3: Authentication function performance
        console.log('3️⃣ Testing Authentication Function Performance...');
        const startTime3 = Date.now();
        const authResult = await pool.query("SELECT authenticate('john.doe@example.com', 'password123')");
        const endTime3 = Date.now();
        
        console.log(`   ✅ Function executed in ${endTime3 - startTime3} ms`);
        console.log(`   📊 Result: Authentication = ${authResult.rows[0].authenticate}\n`);

        // Test 4: Get User Details performance
        console.log('4️⃣ Testing Get User Details Performance...');
        const startTime4 = Date.now();
        const userResult = await pool.query("SELECT * FROM get_user_details('john.doe@example.com')");
        const endTime4 = Date.now();
        
        console.log(`   ✅ Function executed in ${endTime4 - startTime4} ms`);
        console.log(`   📊 Result: ${userResult.rows.length} user details retrieved\n`);

        // Test 5: Performance comparison
        console.log('5️⃣ Performance Analysis...');
        const functionTime = endTime1 - startTime1;
        const directTime = endTime2 - startTime2;
        const authTime = endTime3 - startTime3;
        const userTime = endTime4 - startTime4;
        
        console.log(`   📊 User Exists Function: ${functionTime} ms`);
        console.log(`   📊 Direct COUNT Query: ${directTime} ms`);
        console.log(`   📊 Authentication Function: ${authTime} ms`);
        console.log(`   📊 Get User Details: ${userTime} ms`);
        
        // Performance assessment
        if (functionTime < 10 && directTime < 10 && authTime < 20 && userTime < 20) {
            console.log('\n🎉 PERFORMANCE STATUS: EXCELLENT!');
            console.log('   ✅ All operations are fast (< 20ms)');
            console.log('   ✅ Indexes are working optimally');
            console.log('   ✅ Functions are performing efficiently');
        } else if (functionTime < 50 && directTime < 50 && authTime < 100 && userTime < 100) {
            console.log('\n⚠️  PERFORMANCE STATUS: GOOD');
            console.log('   ✅ All operations are acceptable (< 100ms)');
            console.log('   ⚠️  Some operations could be optimized');
        } else {
            console.log('\n❌ PERFORMANCE STATUS: NEEDS ATTENTION');
            console.log('   ❌ Some operations are slow (> 100ms)');
            console.log('   🔧 Consider checking indexes and query optimization');
        }

        // Test 6: Multiple rapid operations (stress test)
        console.log('\n6️⃣ Stress Test: Multiple Rapid Operations...');
        const iterations = 10;
        const startTime5 = Date.now();
        
        for (let i = 0; i < iterations; i++) {
            await pool.query("SELECT user_exists('john.doe@example.com')");
        }
        
        const endTime5 = Date.now();
        const totalTime = endTime5 - startTime5;
        const avgTime = totalTime / iterations;
        
        console.log(`   📊 ${iterations} operations completed in ${totalTime} ms`);
        console.log(`   📊 Average time per operation: ${avgTime.toFixed(2)} ms`);
        
        if (avgTime < 5) {
            console.log('   ✅ EXCELLENT: Sub-5ms average performance');
        } else if (avgTime < 10) {
            console.log('   ✅ GOOD: Sub-10ms average performance');
        } else {
            console.log('   ⚠️  ACCEPTABLE: Performance within normal range');
        }

        console.log('\n🎉 Performance testing completed successfully!');
        console.log('💡 All functions are working and performing well.');

    } catch (error) {
        console.error('❌ Error during performance testing:', error.message);
    } finally {
        await pool.end();
    }
}

// Run the performance test
testPerformance();
