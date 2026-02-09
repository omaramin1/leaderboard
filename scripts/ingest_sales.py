import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import json
from datetime import datetime

# Database Connection (Replace with actual Supabase credentials or env vars)
DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:54322/postgres")

def get_db_connection():
    return psycopg2.connect(DB_DSN)

def parse_currency(val):
    if pd.isna(val): return None
    if isinstance(val, (int, float)): return val
    return float(str(val).replace('$', '').replace(',', ''))

def ingest_arcadia_sales(csv_path):
    """
    Ingests Arcadia Sales Data.
    NOTE: This data lacks Lat/Lng. A separate geocoding step is required.
    """
    print(f"Reading Arcadia records from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Map CSV columns to Schema
    records = []
    for _, row in df.iterrows():
        # Basic cleaning
        sale_date = pd.to_datetime(row.get('Sale Date'), errors='coerce')
        if pd.isna(sale_date): continue

        records.append((
            row.get('Ref #'),                # external_ref_id
            row.get('Customer Name'),        # customer_name
            row.get('Customer Address'),     # address_full
            # City/State/Zip usually extracted from full address or separate cols if avail
            row.get('City', None),           # city 
            row.get('State', 'VA'),          # state
            row.get('Zip', None),            # zip_code
            sale_date.date(),                # sale_date
            row.get('Order Status'),         # status
            row.get('Utility Name'),         # utility_provider
            row.get('Utility Account Number'), # utility_account
            'Arcadia',                       # data_source
            json.dumps({                     # properties
                'campaign': row.get('Campaigns'),
                'rep_name': row.get('Rep Name'),
                'program_type': row.get('Program Type')
            })
        ))

    print(f"Prepared {len(records)} Arcadia records.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_query = """
    INSERT INTO sales_entries 
    (external_ref_id, customer_name, address_full, city, state, zip_code, sale_date, status, utility_provider, utility_account, data_source, properties)
    VALUES %s
    ON CONFLICT DO NOTHING;
    """
    
    try:
        execute_values(cursor, insert_query, records)
        conn.commit()
        print(f"Successfully inserted/updated {len(records)} Arcadia records.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting Arcadia records: {e}")
    finally:
        cursor.close()
        conn.close()

def ingest_legacy_sales(csv_path):
    """
    Ingests Legacy/Viper Sales Data (Has Lat/Lng).
    """
    print(f"Reading Legacy records from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    records = []
    for _, row in df.iterrows():
        lat = row.get('Latitude')
        lng = row.get('Longitude')
        
        if pd.isna(lat) or pd.isna(lng):
            continue
            
        sale_date = pd.to_datetime(row.get('Sale_Date'), errors='coerce')
        
        # Create Point Geometry WKT or simple lat/lng handling
        # PostGIS syntax: 'SRID=4326;POINT(-77.123 38.123)'
        location_wkt = f"SRID=4326;POINT({lng} {lat})"

        records.append((
            str(row.get('Reference_', '')),  # external_ref_id
            row.get('Customer_A'),           # customer_name
            f"{row.get('Customer_A')}, {row.get('City')}, {row.get('State')} {row.get('Zip')}", # fallback address
            row.get('City'),
            row.get('State'),
            str(row.get('Zip')),
            sale_date.date() if not pd.isna(sale_date) else None,
            'Complete',                      # status (implied from legacy file)
            'Dominion',                      # utility_provider (likely)
            None,                            # utility_account
            location_wkt,                    # location (GEOGRAPHY)
            'Viper_Legacy',                  # data_source
            json.dumps({'fid': row.get('FID')}) # properties
        ))

    print(f"Prepared {len(records)} Legacy records.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_query = """
    INSERT INTO sales_entries 
    (external_ref_id, customer_name, address_full, city, state, zip_code, sale_date, status, utility_provider, utility_account, location, data_source, properties)
    VALUES %s
    ON CONFLICT DO NOTHING;
    """
    
    try:
        execute_values(cursor, insert_query, records)
        conn.commit()
        print(f"Successfully inserted {len(records)} Legacy records.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting Legacy records: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # Example Usage paths - adjust as needed
    ARCADIA_PATH = "../emgmap/arcadia_12_21.csv"
    LEGACY_PATH = "../../planning_app/data/VA_Sales_Data.csv"
    
    if os.path.exists(ARCADIA_PATH):
        ingest_arcadia_sales(ARCADIA_PATH)
    else:
        print(f"Warning: Arcadia file not found at {ARCADIA_PATH}")
        
    if os.path.exists(LEGACY_PATH):
        ingest_legacy_sales(LEGACY_PATH)
    else:
        print(f"Warning: Legacy file not found at {LEGACY_PATH}")
