// src/stores/teeTimesStore.ts
import { writable } from 'svelte/store';

const BASE_URL  = import.meta.env.VITE_PUBLIC_BASE_URL;

// Define the structure of a tee time
export interface TeeTime {
	id: number;
	time: string;
	price: number;
	minPlayers: number;
	maxPlayers: number;
	holes: number;
}

// Initialize the store with an empty array
export const teeTimes = writable<TeeTime[]>([]);

// Function to fetch tee times from the API
export const fetchTeeTimes = async () => {
	try {
		const response = await fetch(`${BASE_URL}/tee-times`);
		if (!response.ok) {
			throw new Error('Failed to fetch tee times');
		}
		const data = await response.json();
		console.log(data);
		// Update the store with the fetched data
		teeTimes.set(data.data);
	} catch (error) {
		console.error('Error fetching tee times:', error);
	}
};
// Delete
export const deleteTeeTime = async (id: number) => {
	try {
	  const response = await fetch(`http://localhost:3001/tee-times/${id}`, {
		method: 'DELETE',
	  });
  
	  if (!response.ok) {
		throw new Error('Failed to delete tee time');
	  }
  
	  // Remove the deleted tee time from the store
	  teeTimes.update((teeTimes) => teeTimes.filter((teeTime) => teeTime.id !== id));
  
	  console.log('Tee time deleted successfully');
	} catch (error) {
	  console.error('Error deleting tee time:', error);
	}
  };

  //Edit

   // Function to save changes after editing
   export const saveEdit = async (editingTeeTime) => {
    if (editingTeeTime) {
      try {
        // Call the API to update the tee time
        const response = await fetch(`/tee-times/${editingTeeTime.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: editingTeeTime.price,
            minPlayers: editingTeeTime.minPlayers,
            maxPlayers: editingTeeTime.maxPlayers,
            holes: editingTeeTime.holes,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update tee time');
        }

        // Update the tee time in the store
        const updatedTeeTime = await response.json();
        teeTimes.update((times) =>
          times.map((t) => (t.id === updatedTeeTime.data.id ? updatedTeeTime.data : t))
        );

        editingTeeTime = null; // Close the edit form
      } catch (error) {
        console.error('Error updating tee time:', error);
      }
    }
  };

  //fetchTeeTimes();

