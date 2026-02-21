"""
Migration script to add custom nutrition fields to User table.
Run this script once to update the database schema.
"""

import sqlite3
import sys
from pathlib import Path

def migrate_database(db_path: str = "./health_tracking.db"):
    """Add custom nutrition columns to users table if they don't exist"""

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = {row[1] for row in cursor.fetchall()}

        # Define new columns to add
        new_columns = {
            "use_custom_nutrition": "BOOLEAN DEFAULT 0",
            "custom_calories": "INTEGER",
            "custom_protein_percent": "REAL",
            "custom_carbs_percent": "REAL",
            "custom_fat_percent": "REAL",
        }

        # Add missing columns
        columns_added = []
        for column_name, column_type in new_columns.items():
            if column_name not in existing_columns:
                alter_sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
                print(f"Adding column: {column_name}")
                cursor.execute(alter_sql)
                columns_added.append(column_name)

        conn.commit()

        if columns_added:
            print(f"✅ Successfully added {len(columns_added)} columns: {', '.join(columns_added)}")
        else:
            print("✅ All columns already exist. No migration needed.")

    except sqlite3.Error as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    # Run migration
    db_path = Path(__file__).parent / "health_tracking.db"
    print(f"Running migration on: {db_path}")
    migrate_database(str(db_path))
