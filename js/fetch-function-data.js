import { auth } from "./firebase-init.js";
const cloudFunctionUrl = 'https://us-central1-carbontracker-c35fd.cloudfunctions.net/test-function';

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            fetchAllGraphs(user.uid);
        } else {
            console.error("No user signed in. Please sign in to view your data.");
            document.getElementById('data-display').innerText = 'Error: No user signed in. Please log in first.';
        }
    });
});

function fetchAllGraphs(userId) {
    const graphTypes = [
        { variable: 'footprint_hours', elementId: 'hours-graph', type: 'line' },
        { variable: 'footprint_miles', elementId: 'miles-graph', type: 'line' },
        { variable: 'footprint_energy', elementId: 'energy-graph', type: 'line' },
        { variable: 'not_used_var', elementId: 'pie-chart', type: 'pie' }
    ];

    graphTypes.forEach(graph => {
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.innerText = 'Loading...';
        loadingMessage.id = `${graph.elementId}-loading`;
        loadingMessage.className = 'loading-message';
        
        const displayArea = document.getElementById(graph.elementId).parentElement; // Get the parent to append loading message
        displayArea.appendChild(loadingMessage);  // Append loading message

        fetch(cloudFunctionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                graph_type: graph.type,
                graph_variable: graph.variable
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            const imgElement = document.getElementById(graph.elementId);
            imgElement.src = imageUrl;
            imgElement.style.display = 'block';  // Ensure the image is shown
            imgElement.style.maxWidth = '50%'; // Control image size
            imgElement.style.maxHeight = '50%'; // Control image height
            
            // Center the image
            imgElement.style.margin = '20px auto';  // Center the image with auto margins and add vertical padding
            imgElement.style.padding = '10px';  // Add padding around the image

            const displayArea = document.getElementById(graph.elementId).parentElement; // Get the parent to append loading message
            displayArea.appendChild(loadingMessage);  // Append loading message

            // Remove loading message after image loads
            loadingMessage.remove(); 
            
        })
        .catch(error => {
            console.error(`Error fetching ${graph.variable} graph:`, error);
            const imgElement = document.getElementById(graph.elementId);
            imgElement.style.display = 'none'; // Hide the image if an error occurs
            loadingMessage.remove();  // Remove loading message
            document.getElementById('data-display').innerText = 'Error loading graph.';
        });
    });
}

// Attach openTab to window object to make it globally available
window.openTab = function(evt, graphName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(graphName).style.display = "block";
    evt.currentTarget.className += " active";
}
