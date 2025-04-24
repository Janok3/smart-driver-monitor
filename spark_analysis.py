import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, max, row_number, desc
from pyspark.sql.window import Window
import psycopg2
from psycopg2 import sql
from tqdm import tqdm
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

# Create the analysis table in PostgreSQL
CREATE_ANALYSIS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS driver_speed_analysis (
    driver_id VARCHAR(50) PRIMARY KEY REFERENCES drivers(driver_id),
    avg_speed FLOAT,
    avg_speed_rank INT,
    top_speed INT,
    top_speed_rank INT
);

CREATE INDEX IF NOT EXISTS idx_driver_speed_analysis_avg_rank ON driver_speed_analysis(avg_speed_rank);
CREATE INDEX IF NOT EXISTS idx_driver_speed_analysis_top_rank ON driver_speed_analysis(top_speed_rank);
"""

def create_analysis_table():
    """Create the analysis table in PostgreSQL if it doesn't exist"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        with conn.cursor() as cursor:
            cursor.execute(CREATE_ANALYSIS_TABLE_SQL)
        conn.commit()
        print("Analysis table created or already exists")
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating analysis table: {e}")
        return False

def analyze_driver_speeds(df):
    """Analyze driver speeds and return a DataFrame with rankings"""
    # Calculate average speed by driver
    avg_speeds = df.groupBy("driver_id").agg(avg("speed").alias("avg_speed"))
    
    # Calculate top speed by driver
    top_speeds = df.groupBy("driver_id").agg(max("speed").alias("top_speed"))
    
    # Join the two DataFrames
    combined_df = avg_speeds.join(top_speeds, "driver_id")
    
    # Create window specifications for ranking WITH PARTITIONING
    # By adding partitionBy("driver_id"), we avoid the "No Partition Defined" warning
    # However, since we want global rankings, we'll keep it as is but suppress the warnings
    window_avg = Window.orderBy(desc("avg_speed"))
    window_top = Window.orderBy(desc("top_speed"))
    
    # Add rankings
    result_df = combined_df \
        .withColumn("avg_speed_rank", row_number().over(window_avg)) \
        .withColumn("top_speed_rank", row_number().over(window_top))
    
    return result_df

def initialize_spark():
    """Initialize and return a Spark session"""
    # Download PostgreSQL JDBC driver if it doesn't exist
    jdbc_jar_path = "postgresql-42.5.1.jar"
    if not os.path.exists(jdbc_jar_path):
        import urllib.request
        print(f"Downloading PostgreSQL JDBC driver to {jdbc_jar_path}...")
        url = "https://jdbc.postgresql.org/download/postgresql-42.5.1.jar"
        urllib.request.urlretrieve(url, jdbc_jar_path)
        print("Download complete!")
    
    # Get absolute path to the JAR file
    jdbc_jar_absolute_path = os.path.abspath(jdbc_jar_path)
    print(f"Using JDBC driver at: {jdbc_jar_absolute_path}")
    
    # Set up Hadoop home to avoid warnings on Windows
    hadoop_home = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadoop")
    if not os.path.exists(hadoop_home):
        os.makedirs(hadoop_home, exist_ok=True)
        os.makedirs(os.path.join(hadoop_home, "bin"), exist_ok=True)
    
    os.environ["HADOOP_HOME"] = hadoop_home
    
    # Create Spark session with the JDBC driver and configure logging
    spark = SparkSession.builder \
        .appName("Driver Speed Analysis") \
        .config("spark.driver.extraClassPath", jdbc_jar_absolute_path) \
        .config("spark.executor.extraClassPath", jdbc_jar_absolute_path) \
        .config("spark.sql.legacy.allowNonEmptyLocationInCTAS", "true") \
        .getOrCreate()
    
    # Set log level to ERROR to suppress warnings
    spark.sparkContext.setLogLevel("ERROR")
    
    return spark

def load_data_from_postgres(spark):
    """Load driving records data from PostgreSQL into a Spark DataFrame"""
    jdbc_url = f"jdbc:postgresql://{DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}"
    
    # Load driving records
    driving_records_df = spark.read \
        .format("jdbc") \
        .option("url", jdbc_url) \
        .option("dbtable", "driving_records") \
        .option("user", DB_PARAMS['user']) \
        .option("password", DB_PARAMS['password']) \
        .option("driver", "org.postgresql.Driver") \
        .load()
    
    return driving_records_df

def save_to_postgres(df):
    """Save the analysis results to PostgreSQL"""
    # Convert to Pandas DataFrame for easier insertion
    pandas_df = df.toPandas()
    
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        
        # Clear existing data
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE driver_speed_analysis")
        
        # Insert new data
        insert_sql = """
        INSERT INTO driver_speed_analysis (driver_id, avg_speed, avg_speed_rank, top_speed, top_speed_rank)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        # Add progress bar for database insertion
        with conn.cursor() as cursor:
            for _, row in tqdm(pandas_df.iterrows(), total=len(pandas_df), desc="Saving to database", unit="record"):
                cursor.execute(insert_sql, (
                    row['driver_id'],
                    float(row['avg_speed']),
                    int(row['avg_speed_rank']),
                    int(row['top_speed']),
                    int(row['top_speed_rank'])
                ))
        
        conn.commit()
        print(f"Successfully saved {len(pandas_df)} records to driver_speed_analysis table")
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving to PostgreSQL: {e}")
        return False

def main():
    # Set up Hadoop environment for Windows
    try:
        from setup_hadoop import setup_hadoop_for_windows
        hadoop_home = setup_hadoop_for_windows()
        print(f"Using Hadoop home: {hadoop_home}")
    except Exception as e:
        print(f"Warning: Could not set up Hadoop environment: {e}")
    
    # Create the analysis table
    if not create_analysis_table():
        return
    
    try:
        # Initialize Spark
        print("Initializing Spark...")
        spark = initialize_spark()
        
        # Load data from PostgreSQL
        print("Loading data from PostgreSQL...")
        try:
            driving_records_df = load_data_from_postgres(spark)
            
            # Get count for progress tracking
            total_records = driving_records_df.count()
            print(f"Loaded {total_records} records from database")
            
            # Analyze driver speeds
            print("Analyzing driver speeds...")
            # Add a simple progress indicator for Spark operations
            print("[" + "="*10 + "] Calculating average speeds")
            avg_speeds = driving_records_df.groupBy("driver_id").agg(avg("speed").alias("avg_speed"))
            
            print("[" + "="*20 + "] Calculating top speeds")
            top_speeds = driving_records_df.groupBy("driver_id").agg(max("speed").alias("top_speed"))
            
            print("[" + "="*30 + "] Joining datasets")
            combined_df = avg_speeds.join(top_speeds, "driver_id")
            
            print("[" + "="*40 + "] Calculating rankings")
            window_avg = Window.orderBy(desc("avg_speed"))
            window_top = Window.orderBy(desc("top_speed"))
            
            analysis_df = combined_df \
                .withColumn("avg_speed_rank", row_number().over(window_avg)) \
                .withColumn("top_speed_rank", row_number().over(window_top))
            
            print("[" + "="*50 + "] Analysis complete!")
            
            # Show sample results
            print("\nSample analysis results (top 10 by average speed):")
            analysis_df.orderBy("avg_speed_rank").show(10)
            
            # Save results to PostgreSQL
            print("Saving results to PostgreSQL...")
            save_to_postgres(analysis_df)
            
            print("Analysis complete!")
        except Exception as e:
            print(f"Error during data processing: {e}")
            import traceback
            traceback.print_exc()
    except Exception as e:
        print(f"Error during Spark initialization: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Stop Spark session if it was created
        if 'spark' in locals():
            spark.stop()

if __name__ == "__main__":
    main()