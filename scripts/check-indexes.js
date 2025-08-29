#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function checkIndexes() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'authdb',
        user: process.env.DB_USER || 'authuser',
        password: process.env.DB_PASSWORD || 'authuser123',
    });

    try {
        console.log('🔍 Checking Database Indexes...\n');

        // Check if indexes exist
        const indexQuery = `
            SELECT 
                indexname,
                tablename,
                indexdef
            FROM pg_indexes 
            WHERE tablename = 'userauth' 
            ORDER BY indexname;
        `;

        const indexResult = await pool.query(indexQuery);
        
        if (indexResult.rows.length === 0) {
            console.log('❌ No indexes found on userAuth table!');
        } else {
            console.log(`✅ Found ${indexResult.rows.length} indexes on userAuth table:\n`);
            indexResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.indexname}`);
                console.log(`   Table: ${row.tablename}`);
                console.log(`   Definition: ${row.indexdef}\n`);
            });
        }

        // Check table statistics
        const statsQuery = `
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE tablename = 'userauth' 
            AND attname IN ('mail', 'created_at', 'updated_at')
            ORDER BY attname;
        `;

        const statsResult = await pool.query(statsQuery);
        
        if (statsResult.rows.length > 0) {
            console.log('📊 Table Statistics:\n');
            statsResult.rows.forEach(row => {
                console.log(`Column: ${row.attname}`);
                console.log(`  Distinct values: ${row.n_distinct}`);
                console.log(`  Correlation: ${row.correlation}\n`);
            });
        }

        // Test query performance with EXPLAIN
        console.log('🚀 Testing Query Performance with EXPLAIN...\n');
        
        const explainQuery = `
            EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
            SELECT * FROM userAuth WHERE mail = 'test@example.com';
        `;

        const explainResult = await pool.query(explainQuery);
        
        console.log('Query Plan:');
        explainResult.rows.forEach(row => {
            console.log(row['QUERY PLAN']);
        });

        // Test index usage
        console.log('\n🔍 Testing Index Usage...\n');
        
        const indexUsageQuery = `
            SELECT 
                schemaname,
                tablename,
                indexname,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes 
            WHERE tablename = 'userauth'
            ORDER BY indexname;
        `;

        const usageResult = await pool.query(indexUsageQuery);
        
        if (usageResult.rows.length > 0) {
            console.log('Index Usage Statistics:\n');
            usageResult.rows.forEach(row => {
                console.log(`Index: ${row.indexname}`);
                console.log(`  Scans: ${row.idx_scan}`);
                console.log(`  Tuples read: ${row.idx_tup_read}`);
                console.log(`  Tuples fetched: ${row.idx_tup_fetch}\n`);
            });
        } else {
            console.log('⚠️  No index usage statistics available yet (try running some queries first)');
        }

    } catch (error) {
        console.error('❌ Error checking indexes:', error.message);
    } finally {
        await pool.end();
    }
}

// Run the check
checkIndexes();
