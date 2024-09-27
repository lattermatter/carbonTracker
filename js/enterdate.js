// specifying file becuase outside the directory
// ./ means its a dir of current dir
import { auth } from './firebase-init.js'
import { storeData, displaySuccessMessage } from './store-data.js';

document.getElementById('carbonInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    // no conversion needed
    const dateInput = document.getElementById('date').value;
    // number constants are inputted as 0 if not 0
    const miles = parseFloat(document.getElementById('miles').value) || 0;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const energy = parseFloat(document.getElementById('energy').value) || 0;
    const user = auth.currentUser;
    const userId = user.uid;
    
    // intercepting data before reaching cloud data storage
    // must deal with unit cnversions
    const data = { 
        user_id: userId,
        date: dateInput,
        miles: miles, 
        hours: hours, 
        energy: energy,
        timestamp: new Date()
    };
    
    try {
        await storeData('user_carbon_data', data);
        document.getElementById('carbonInfoForm').reset();
        displaySuccessMessage('success-message', `Information for the date ${dateInput} has been submitted successfully!`);
    } catch (error) {
        console.error("Error storing data:", error);
    }
    });