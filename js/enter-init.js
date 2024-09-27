import { auth } from './firebase-init.js'
import { storeData, displaySuccessMessage } from './store-data.js';

document.getElementById('initializeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const car_factor = parseFloat(document.getElementById('carfactor').value) || 0;
    const digital_factor = parseFloat(document.getElementById('digitalfactor').value) || 0;
    const e_factor = parseFloat(document.getElementById('efactor').value) || 0;

    const user = auth.currentUser;
    const userId = user.uid;

    // Prepare data for upload
    const data = { 
        car_factor: car_factor, 
        digital_factor: digital_factor, 
        e_factor: e_factor,
        timestamp: new Date()
    };

    try {
        // Save data using userId as the document ID
        await storeData('user_init_data', data, userId); // Pass userId as docId
        document.getElementById('initializeForm').reset();
        displaySuccessMessage('success-message', `Your data has now been initialized! Go to the Enter section to enter data for a specific date.`);
    } catch (error) {
        console.error("Error storing data:", error);
    }
});

