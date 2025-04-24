import os
import psycopg2
from psycopg2 import sql
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters from environment variables
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

# Define the table structures
CREATE_TABLES_SQL = """
-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    car_plate_number VARCHAR(20) NOT NULL
);

-- Create driving_records table
CREATE TABLE IF NOT EXISTS driving_records (
    id SERIAL PRIMARY KEY,
    driver_id VARCHAR(50) REFERENCES drivers(driver_id),
    car_plate_number VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    speed INT,
    direction INT,
    site_name VARCHAR(100),
    record_time TIMESTAMP,
    is_rapidly_speedup BOOLEAN,
    is_rapidly_slowdown BOOLEAN,
    is_neutral_slide BOOLEAN,
    is_neutral_slide_finished BOOLEAN,
    neutral_slide_time INT,
    is_overspeed BOOLEAN,
    is_overspeed_finished BOOLEAN,
    overspeed_time INT,
    is_fatigue_driving BOOLEAN,
    is_throttle_stop BOOLEAN,
    is_oil_leak BOOLEAN,
    record_date DATE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_driving_records_driver_id ON driving_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_driving_records_car_plate_number ON driving_records(car_plate_number);
CREATE INDEX IF NOT EXISTS idx_driving_records_record_time ON driving_records(record_time);
CREATE INDEX IF NOT EXISTS idx_driving_records_record_date ON driving_records(record_date);
"""

# Function to connect to the database
def connect_to_db():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# Function to create the tables if they don't exist
def create_tables(conn):
    try:
        with conn.cursor() as cursor:
            cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        print("Tables created or already exist")
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()

# Function to parse a CSV line into a record
def parse_line(line):
    fields = line.strip().split(',')
    
    # Ensure we have at least 8 fields (required fields)
    if len(fields) < 8:
        return None
    
    # Extract the basic fields
    driver_id = fields[0]
    car_plate_number = fields[1]
    
    # Extract timestamp and create record_date
    timestamp = datetime.strptime(fields[7], '%Y-%m-%d %H:%M:%S') if fields[7] else None
    record_date = timestamp.date() if timestamp else None
    
    # Create the driving record
    record = {
        'driver_id': driver_id,
        'car_plate_number': car_plate_number,
        'latitude': float(fields[2]) if fields[2] else None,
        'longitude': float(fields[3]) if fields[3] else None,
        'speed': int(fields[4]) if fields[4] else None,
        'direction': int(fields[5]) if fields[5] else None,
        'site_name': fields[6],
        'record_time': timestamp,
        'record_date': record_date
    }
    
    # Map warning fields to their specific columns
    warning_fields = {
        8: 'is_rapidly_speedup',
        9: 'is_rapidly_slowdown',
        10: 'is_neutral_slide',
        11: 'is_neutral_slide_finished',
        12: 'neutral_slide_time',
        13: 'is_overspeed',
        14: 'is_overspeed_finished',
        15: 'overspeed_time',
        16: 'is_fatigue_driving',
        17: 'is_throttle_stop',
        18: 'is_oil_leak'
    }
    
    # Extract warning fields (if present)
    for i, field_name in warning_fields.items():
        if i < len(fields) and fields[i]:
            # For boolean fields
            if field_name.startswith('is_'):
                record[field_name] = fields[i] == '1'
            # For numeric fields
            else:
                record[field_name] = int(fields[i]) if fields[i].isdigit() else 0
        else:
            # Set default values: False for boolean fields, 0 for numeric fields
            if field_name.startswith('is_'):
                record[field_name] = False
            else:
                record[field_name] = 0
    
    return {
        'driver': {
            'driver_id': driver_id,
            'car_plate_number': car_plate_number
        },
        'driving_record': record
    }

# Function to insert or update driver
def insert_driver(conn, driver):
    insert_sql = """
    INSERT INTO drivers (driver_id, car_plate_number)
    VALUES (%s, %s)
    ON CONFLICT (driver_id) 
    DO UPDATE SET car_plate_number = EXCLUDED.car_plate_number
    """
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(insert_sql, (
                driver['driver_id'],
                driver['car_plate_number']
            ))
        return True
    except Exception as e:
        print(f"Error inserting driver: {e}")
        return False

# Function to check if a driving record already exists
def record_exists(conn, record):
    """Check if a driving record already exists in the database"""
    check_sql = """
    SELECT 1 FROM driving_records 
    WHERE driver_id = %s AND record_time = %s
    """
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(check_sql, (
                record['driver_id'],
                record['record_time']
            ))
            return cursor.fetchone() is not None
    except Exception as e:
        print(f"Error checking if record exists: {e}")
        return False

# Function to insert driving record
def insert_driving_record(conn, record):
    # First check if the record already exists
    if record_exists(conn, record):
        # Skip this record as it already exists
        return True
        
    # Remove record_date from the SQL as it's a generated column
    insert_sql = """
    INSERT INTO driving_records (
        driver_id, car_plate_number, latitude, longitude, speed, direction, site_name, 
        record_time, is_rapidly_speedup, is_rapidly_slowdown, is_neutral_slide, 
        is_neutral_slide_finished, neutral_slide_time, is_overspeed, is_overspeed_finished, 
        overspeed_time, is_fatigue_driving, is_throttle_stop, is_oil_leak
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    # Convert boolean values to integers (0 or 1) for database compatibility
    for key in record:
        if key.startswith('is_') and record[key] is not None:
            record[key] = 1 if record[key] else 0
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(insert_sql, (
                record['driver_id'],
                record['car_plate_number'],
                record['latitude'],
                record['longitude'],
                record['speed'],
                record['direction'],
                record['site_name'],
                record['record_time'],
                record['is_rapidly_speedup'],
                record['is_rapidly_slowdown'],
                record['is_neutral_slide'],
                record['is_neutral_slide_finished'],
                record['neutral_slide_time'],
                record['is_overspeed'],
                record['is_overspeed_finished'],
                record['overspeed_time'],
                record['is_fatigue_driving'],
                record['is_throttle_stop'],
                record['is_oil_leak']
                # Removed record_date as it's a generated column
            ))
        return True
    except Exception as e:
        print(f"Error inserting driving record: {e}")
        return False

# Main function to process the file and load data
def load_data(file_path, batch_size=1000, max_records=None):
    """
    Load data from a file into the database
    
    Args:
        file_path: Path to the data file
        batch_size: Number of records to process in a single batch before committing
        max_records: Maximum number of records to process from the file (None for all records)
    """
    # Connect to the database
    conn = connect_to_db()
    if not conn:
        return
    
    # Create the tables if they don't exist
    create_tables(conn)
    
    try:
        # Process the file
        drivers_processed = set()
        records = []
        total_records = 0
        
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                # Stop if we've reached the maximum number of records
                if max_records is not None and total_records >= max_records:
                    break
                
                parsed_data = parse_line(line)
                if parsed_data:
                    driver = parsed_data['driver']
                    record = parsed_data['driving_record']
                    
                    # Insert driver if not already processed
                    if driver['driver_id'] not in drivers_processed:
                        if insert_driver(conn, driver):
                            drivers_processed.add(driver['driver_id'])
                    
                    # Add record to batch
                    records.append(record)
                    
                    # Insert in batches
                    if len(records) >= batch_size:
                        success_count = 0
                        for rec in records:
                            if insert_driving_record(conn, rec):
                                success_count += 1
                            else:
                                # If insertion fails, commit what we have so far to avoid losing all records
                                conn.rollback()
                                conn = connect_to_db()  # Reconnect to start a fresh transaction
                                if not conn:
                                    return
                        
                        if success_count > 0:
                            conn.commit()
                            total_records += success_count
                            print(f"Processed {total_records} records successfully")
                        
                        records = []
                        
                        # Stop if we've reached the maximum number of records
                        if max_records is not None and total_records >= max_records:
                            break
            
            # Insert any remaining records
            if records:
                success_count = 0
                for rec in records:
                    # Stop if we've reached the maximum number of records
                    if max_records is not None and total_records >= max_records:
                        break
                        
                    if insert_driving_record(conn, rec):
                        success_count += 1
                        # Commit after each successful insert for the remaining records
                        conn.commit()
                    else:
                        conn.rollback()
                        conn = connect_to_db()  # Reconnect to start a fresh transaction
                        if not conn:
                            break
                
                total_records += success_count
        
        print(f"Total records processed: {total_records}")
        print(f"Total unique drivers: {len(drivers_processed)}")
    except Exception as e:
        print(f"Error processing file: {e}")
        conn.rollback()
    finally:
        if conn:
            conn.close()

# Create a function to create the database if it doesn't exist
def create_database():
    try:
        # Connect to default postgres database to create our new database
        temp_params = DB_PARAMS.copy()
        temp_params['dbname'] = 'postgres'
        conn = psycopg2.connect(**temp_params)
        conn.autocommit = True
        
        with conn.cursor() as cursor:
            # Check if database exists
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_PARAMS['dbname'],))
            if not cursor.fetchone():
                # Create database
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                    sql.Identifier(DB_PARAMS['dbname'])
                ))
                print(f"Database '{DB_PARAMS['dbname']}' created successfully")
            else:
                print(f"Database '{DB_PARAMS['dbname']}' already exists")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

if __name__ == "__main__":
    # Path to your data folder
    folder_path = r"c:\School Stuff\Homework\COMP4442\Term Project\detail-records\detail-records\records"
    
    # Create the database if it doesn't exist
    if create_database():
        # Find all files in the folder
        csv_files = [f for f in os.listdir(folder_path)]
        
        if csv_files:
            # Number of records to process from each file
            records_per_file = 100
            
            # Process each file
            for file_name in csv_files:
                file_path = os.path.join(folder_path, file_name)
                print(f"\nProcessing file: {file_name}")
                
                # Load specified number of records from each file
                # batch_size=20 means process 20 records at a time
                # max_records=records_per_file means stop after processing that many records
                load_data(file_path, batch_size=100, max_records=records_per_file)
        else:
            print("No files found in the specified folder")
