import os
import json
import psycopg2
from psycopg2.extras import execute_values

DB_DSN = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:54322/postgres")

def get_db_connection():
    return psycopg2.connect(DB_DSN)

def ingest_geojson_zones(file_path, zone_type, name_property='NAMELSAD'):
    """
    Ingests a GeoJSON FeatureCollection into territory_zones.
    """
    print(f"Processing {file_path} for type '{zone_type}'...")
    
    with open(file_path, 'r') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    records = []
    
    for feature in features:
        props = feature.get('properties', {})
        geometry = feature.get('geometry')
        
        if not geometry: continue
        
        # Extract a name
        name = props.get(name_property, 'Unknown Zone')
        
        # geometry to string string
        geom_json = json.dumps(geometry)
        
        # PostGIS accepts GeoJSON directly with ST_GeomFromGeoJSON
        # We'll use a wrapper in the SQL insert
        
        records.append((
            name,
            zone_type,
            geom_json,
            json.dumps(props)
        ))
        
    print(f"Prepared {len(records)} zones.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_query = """
    INSERT INTO territory_zones (name, zone_type, boundary, properties)
    VALUES %s;
    """
    
    # We need to transform the GeoJSON string to a Geometry object in SQL
    # A cleaner way with execute_values using a template
    template = "(%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), %s)"
    
    try:
        execute_values(cursor, insert_query, records, template=template)
        conn.commit()
        print(f"Successfully inserted {len(records)} zones.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting zones: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # Ingest Blue Zones
    BLUE_ZONES = "../public/data/blue_zones.geojson"
    if os.path.exists(BLUE_ZONES):
        ingest_geojson_zones(BLUE_ZONES, 'LMI_Auto_Qualify', name_property='NAMELSAD10')
    
    # Ingest Census Stats (if treated as zones)
    CENSUS_ZONES = "../public/data/census_stats.geojson"
    if os.path.exists(CENSUS_ZONES):
        ingest_geojson_zones(CENSUS_ZONES, 'Census_Tract', name_property='NAMELSAD')
        
    # Ingest Dominion Zones
    DOM_ZONES = "../emgmap/public/dominion_zones.geojson"
    if os.path.exists(DOM_ZONES):
        ingest_geojson_zones(DOM_ZONES, 'Dominion_Territory', name_property='Utility')
