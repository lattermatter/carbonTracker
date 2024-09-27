import functions_framework
import json
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

@functions_framework.http
def get_recent_entry(request):
    # Handle OPTIONS requests for CORS preflight
    
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        }

        return ("", 204, headers)

    # Handle true invocations 
    headers = {"Access-Control-Allow-Origin": "*"}

    
    # Handle GET requests
    try:
        # Fetch the first document sorted by timestamp in descending order
        docs = db.collection('user_carbon_data').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(1).get()

        if docs:
            # Extract data from the first document
            doc = docs[0].to_dict()
            if 'timestamp' in doc:
                doc['timestamp'] = doc['timestamp'].isoformat()
            
            response = json.dumps(doc)
            return response, 200, headers
        else:
            response = json.dumps({"error": "No documents found"})
            return response, 404, headers
    except Exception as e:
        response = json.dumps({"error": str(e)})
        return response, 500, headers
