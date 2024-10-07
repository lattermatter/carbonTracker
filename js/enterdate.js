import { auth, db } from './firebase-init.js';
import { storeData, displaySuccessMessage } from './store-data.js';
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

document.getElementById('carbonInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get user input values
    const dateInput = document.getElementById('date').value; 
    const miles = parseFloat(document.getElementById('miles').value) || 0;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const energy = parseFloat(document.getElementById('energy').value) || 0;
    const user = auth.currentUser;
    const userId = user.uid;

    // Prepare data for submission
    const data = { 
        user_id: userId,
        date: dateInput,
        miles: miles, 
        hours: hours, 
        energy: energy,
        timestamp: new Date()
    };
    
    try {
        // Check for the most recent date entry
        const recentEntrySnapshot = await getDocs(query(
            collection(db, 'user_carbon_data'),
            where('user_id', '==', userId),
            orderBy('timestamp', 'desc'), // Order by the timestamp in descending order
            limit(1) // Limit to the most recent entry
        ));

        let recentDate = null;
        if (!recentEntrySnapshot.empty) {
            recentDate = recentEntrySnapshot.docs[0].data().date; // Get the most recent date as a string
        }
        

        // Check if the new date is less than or equal to the recent date
        if (recentDate && new Date(dateInput) <= new Date(recentDate + 'T00:00:00')) {
            console.log("Past date used.")
            displaySuccessMessage('success-message', `The date must be greater than the most recent entry date (${recentDate}).`);
            return; // Stop the submission
        }
        
        if (recentDate) {
            const recentDateObj = new Date(recentDate);
            const inputDateObj = new Date(dateInput);
            const consecutiveDate = new Date(recentDateObj);
            consecutiveDate.setDate(recentDateObj.getDate() + 1); // Set to the next day

            if (inputDateObj > consecutiveDate) {
                alert("Note: If the date is non-consecutive, the model predictions might be off.");
            }
        }

        // Store the data in Firestore
        await storeData('user_carbon_data', data);

        // Count entries in user_carbon_data for the current user
        const userEntriesSnapshot = await getDocs(query(
            collection(db, 'user_carbon_data'),
            where('user_id', '==', userId)
        ));

        const numberOfEntries = userEntriesSnapshot.size; // Get the count of documents
        console.log(numberOfEntries);
        
        const userInitDataDoc = doc(db, 'user_init_data', userId); // Create a reference to the document
        await setDoc(userInitDataDoc, { inputDays: numberOfEntries }, { merge: true });

        // Reset the form and display success message
        document.getElementById('carbonInfoForm').reset();
        displaySuccessMessage('success-message', `Information for the date ${dateInput} has been submitted successfully!`);

    } catch (error) {
        console.error("Error storing data or updating user_init_data:", error);
        displaySuccessMessage('success-message', 'An error occurred while processing your request.');
    }
});

document.getElementById('deleteLastEntryButton').addEventListener('click', async () => {
    const user = auth.currentUser;
    const userId = user.uid;

    try {
        // Get the last entry based on the date
        const userEntriesSnapshot = await getDocs(query(
            collection(db, 'user_carbon_data'),
            where('user_id', '==', userId),
            orderBy('date', 'desc'), // Order by date descending
            limit(1) // Get the most recent entry
        ));

        if (userEntriesSnapshot.empty) {
            displaySuccessMessage('success-message', 'No entries to delete.');
            return;
        }

        // Get the document ID and date of the last entry
        const lastEntryDoc = userEntriesSnapshot.docs[0];
        const lastEntryId = lastEntryDoc.id; // Get the document ID
        const lastEntryData = lastEntryDoc.data();
        const lastEntryDate = lastEntryData.date; // Get the date of the last entry

        // Delete the last entry from Firestore
        await deleteDoc(doc(db, 'user_carbon_data', lastEntryId));

        // Update the user_init_data collection
        const userInitDataDoc = doc(db, 'user_init_data', userId); // Create a reference to the document
        const userEntriesCount = userEntriesSnapshot.size - 1; // Decrement count
        await setDoc(userInitDataDoc, { inputDays: userEntriesCount }, { merge: true });

        // Display success message with the date of the deleted entry
        displaySuccessMessage('success-message', `Entry for date ${lastEntryDate} has been deleted successfully!`);
    } catch (error) {
        console.error("Error deleting last entry:", error);
        displaySuccessMessage('success-message', 'An error occurred while deleting the entry.');
    }
});

document.getElementById('recentEntry').addEventListener('click', async () => {
    const user = auth.currentUser;
    const userId = user.uid;

    try {
        const userEntriesSnapshot = await getDocs(query(
            collection(db, 'user_carbon_data'), 
            where('user_id', '==', userId),
            orderBy('date', 'desc'),
            limit(1)
        ));

        if (!userEntriesSnapshot.empty) {
            const lastEntry = userEntriesSnapshot.docs[0].data();
            const recentDate = lastEntry.date;

            // Display the recent date in the element with ID 'recentEntryMessage'
            displaySuccessMessage('success-message', `Most recent entry date: ${recentDate}`);
        } else {
            displaySuccessMessage('success-message', 'No entries found.');
        }
    } catch (error) {
        console.error("Error fetching most recent entry date:", error);
        displaySuccessMessage('success-message', 'An error occurred while retrieving the most recent entry date.');
    }
});
