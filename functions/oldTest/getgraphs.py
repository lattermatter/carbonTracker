import os
# import functions_framework
import pandas as pd
import matplotlib.pyplot as plt
from google.cloud import firestore
import io
import json
import seaborn as sns

# Initialize Firestore
db = firestore.Client()

# Test user ID for local development
TEST_USER_ID = "rNFrGczf8cMbI4WTlanzYIeuO4n1"

"""
{'date': '0003-03-03', 'hours': 8, 'miles': 7, 'energy': 9, 
'user_id': 'rNFrGczf8cMbI4WTlanzYIeuO4n1', 'solar': False, 'timestamp': '2024-09-21T01:00:36.600000+00:00'}
test docstring for database formatting
"""
class NoInitException(Exception):
    def __init__(self, message="Initialization data not found."):
        self.message = message
        super().__init__(self.message)

def fetch_user_data(user_id):
    # Fetch all documents for the user sorted by timestamp
    docs = db.collection('user_carbon_data').where('user_id', '==', user_id).order_by('date').get()
    constants = db.collection('user_init_data').document(user_id).get()
    
    if not constants.exists:
        raise NoInitException(f"No initialization data found for user ID: {user_id}")
    
    # Extract the data into a list of dictionaries
    data = []
    for doc in docs:
        doc_data = doc.to_dict()
        doc_data['timestamp'] = doc_data['timestamp'].isoformat()  # Convert timestamp to string
        data.append(doc_data)
    
    # Convert to pandas DataFrame
    df = pd.DataFrame(data)
    constants_dict = constants.to_dict()
    
    # converting to co2 units
    df['footprint_hours'] = df['hours'] * constants_dict['digital_factor'] # gCO2/KWh
    df['footprint_miles'] = df['miles'] * constants_dict['car_factor'] # gCO2/kWH
    df['footprint_energy'] = df['energy'] * constants_dict['e_factor'] # units are in kgCO2/kWH 
    
    return df



def create_graphs(df):
    # Ensure timestamp is in datetime format
    df['date'] = pd.to_datetime(df['date'])

    # Set the Seaborn style and color palette
    sns.set_style("whitegrid")
    sns.set_palette("summer")  # Green-yellow color palette

    # List of variables to plot
    variables = ['footprint_hours', 'footprint_miles', 'footprint_energy']

    # Dictionary to store graph images
    graphs = {}

    for variable in variables:
        # Create a new figure for each variable
        plt.figure(figsize=(10, 6))
        sns.lineplot(data=df, x='date', y=variable, label=variable)

        plt.xlabel('Time')
        plt.ylabel(f'Value - {"gCO2" if variable != "footprint_energy" else "kgCO2"}')
        plt.title(f'{variable} over time - {"gCO2" if variable != "footprint_energy" else "kgCO2"}')
        plt.legend()

        # Save the plot to a PNG in memory
        img_io = io.BytesIO()
        plt.savefig(img_io, format='png')
        img_io.seek(0)
        plt.close()  # Close the figure to free memory

        # Store the graph in the dictionary
        graphs[variable] = img_io

    return graphs

def create_pie_chart(df):
    # Set the Seaborn theme
    sns.set_theme(style="whitegrid") 

    # Get the most recent entry as a DataFrame
    latest_entry = df.iloc[[-1]]  # Keep it as a DataFrame

    # Select the relevant columns for the pie chart
    pie_data = latest_entry[['footprint_hours', 'footprint_miles', 'footprint_energy']].iloc[0]

    # Ensure pie_data is a 1D array
    pie_data = pie_data.values  # Convert to a numpy array

    # Define the labels for the pie chart
    labels = ['Hours', 'Miles', 'Energy']

    # Choose a color palette
    colors = sns.color_palette("GnBu", n_colors=len(labels))  # Green-blue palette; adjust as needed

    # Plot pie chart
    plt.figure(figsize=(6, 6))
    plt.pie(pie_data, labels=labels, autopct='%1.1f%%', startangle=90, colors=colors)
    plt.title('Carbon Footprint Distribution')

    # Save the pie chart to a PNG in memory
    pie_io = io.BytesIO()
    plt.savefig(pie_io, format='png')
    plt.close()  # Close the figure to free memory
    pie_io.seek(0)

    return pie_io

# @functions_framework.http
def get_user_graph(request):
    # Check if running locally
    is_local = os.getenv('LOCAL_DEV', 'false') == 'true'

    # CORS preflight request handling
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
        return ("", 204, headers)

    # Parse request for user_id and graph type
    request_json = request.get_json(silent=True)

    # Use test user ID if running locally
    if is_local:
        user_id = TEST_USER_ID
    else:
        if not request_json or 'user_id' not in request_json:
            return json.dumps({"error": "user_id is required"}), 400, {"Content-Type": "application/json"}
        user_id = request_json['user_id']

    graph_type = request_json.get('graph_type', 'line')  # Default to 'line' if not provided
    graph_variable = request_json.get('graph_variable', None)  # Added to request specific graph

    # Fetch user data
    try:
        df = fetch_user_data(user_id)
        if df.empty:
            return json.dumps({"error": "No data found for this user"}), 404, {"Content-Type": "application/json"}
        
        # Create line or pie chart based on the request
        if graph_type == 'line':
            graphs = create_graphs(df)  # All graphs are generated and stored in a dictionary
            
            if graph_variable and graph_variable in graphs:
                img_io = graphs[graph_variable]
            else:
                return json.dumps({"error": "Invalid graph variable requested"}), 400, {"Content-Type": "application/json"}
        
        elif graph_type == 'pie':
            img_io = create_pie_chart(df)
        else:
            return json.dumps({"error": "Invalid graph type"}), 400, {"Content-Type": "application/json"}
        
        # Return the image as a PNG response
        headers = {"Content-Type": "image/png", "Access-Control-Allow-Origin": "*"}
        return (img_io.read(), 200, headers)
    
    except Exception as e:
        return json.dumps({"error": str(e)}), 500, {"Content-Type": "application/json"}

