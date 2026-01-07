import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function addMissingColumns() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log('Adding missing columns...');

    try {
        // Add class_type column to classes table
        await sql`
            ALTER TABLE classes 
            ADD COLUMN IF NOT EXISTS class_type VARCHAR(50) DEFAULT 'group' NOT NULL
        `;
        console.log('✅ Added class_type column to classes table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ class_type column already exists');
        } else {
            console.error('❌ Error adding class_type:', error.message);
        }
    }

    try {
        // Add biography column to teachers table
        await sql`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS biography TEXT
        `;
        console.log('✅ Added biography column to teachers table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ biography column already exists');
        } else {
            console.error('❌ Error adding biography:', error.message);
        }
    }

    try {
        // Add recurrence column to classes table
        await sql`
            ALTER TABLE classes 
            ADD COLUMN IF NOT EXISTS recurrence TEXT
        `;
        console.log('✅ Added recurrence column to classes table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ recurrence column already exists');
        } else {
            console.error('❌ Error adding recurrence:', error.message);
        }
    }

    try {
        // Add virtual_meeting_link column to classes table
        await sql`
            ALTER TABLE classes 
            ADD COLUMN IF NOT EXISTS virtual_meeting_link VARCHAR(500)
        `;
        console.log('✅ Added virtual_meeting_link column to classes table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ virtual_meeting_link column already exists');
        } else {
            console.error('❌ Error adding virtual_meeting_link:', error.message);
        }
    }

    try {
        // Add specialization column to teachers table
        await sql`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS specialization TEXT
        `;
        console.log('✅ Added specialization column to teachers table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ specialization column already exists');
        } else {
            console.error('❌ Error adding specialization:', error.message);
        }
    }

    try {
        // Add profile_picture column to teachers table
        await sql`
            ALTER TABLE teachers 
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)
        `;
        console.log('✅ Added profile_picture column to teachers table');
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ profile_picture column already exists');
        } else {
            console.error('❌ Error adding profile_picture:', error.message);
        }
    }

    console.log('\n✅ Done! Database schema updated.');
}

addMissingColumns().catch(console.error);
