import express from 'express';
import { db } from '../db';
import { teeTimes } from '../db/schema';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import "dotenv/config";

const app = express();
app.use(cors()); // Enable CORS for all routes
const port = process.env.PORT;

// Middleware to parse JSON requests
app.use(express.json());
//Read all the tee times
app.get('/tee-times', async (req, res) => {
    try {
        // Fetch all tee times from the database
        const result = await db.select().from(teeTimes);

        // Format the time for each tee time
        const formattedResult = result.map(teeTime => ({
            ...teeTime,
            time: format(new Date(teeTime.time), 'h:mm a') 
        }));

        // Return the formatted tee times
        res.json({ data: formattedResult });
    } catch (error) {
        console.error('Error fetching tee times:', error);
        res.status(500).json({ error: 'Failed to fetch tee times' });
    }
});


app.delete('/tee-times/:id', async (req:any, res:any) => {
    const id = req.params.id; // Get the UUID from the URL params

    // Validate the UUID (optional but recommended)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
        return res.status(400).json({ error: 'Invalid UUID' });
    }

    try {
        // Delete the tee time with the specified UUID
        const result = await db
            .delete(teeTimes)
            .where(eq(teeTimes.id, id))
            .returning();

        if (result.length === 0) {
            return res.status(404).json({ error: 'Tee time not found' });
        }

        res.json({ message: 'Tee time deleted successfully', deleted: result[0] });
    } catch (error) {
        console.error('Error deleting tee time:', error);
        res.status(500).json({ error: 'Failed to delete tee time' });
    }
});

//   Edit
  app.put('/tee-times/:id', async (req:any, res:any) => {
	const { id } = req.params; // Get the tee time ID from the URL
	const { price, minPlayers, maxPlayers, holes } = req.body; // Get updated fields from the request body
  
	try {
	  // Update the tee time in the database using Drizzle
	  const updatedTeeTime = await db
		.update(teeTimes)
		.set({ price, minPlayers, maxPlayers, holes })
		.where(eq(teeTimes.id, id))
		.returning(); // Return the updated record
  
	  if (updatedTeeTime.length === 0) {
		return res.status(404).json({ error: 'Tee time not found' });
	  }
  
	//   const formattedPrice = updatedTeeTime.map(teeTime => ({
	// 	...teeTime[0],
	// 	price: parseFloat(teeTimes[0].price).toFixed(2)
	//   }));
	//   res.json({ data: formattedPrice });


	const formattedTeeTime = updatedTeeTime.map(teeTime => ({
		...teeTime,
		time: format(new Date(teeTime.time), 'h:mm a')
	  }));

	  res.json({ data: formattedTeeTime[0] });
	  

	//res.json({ data: formattedResult });
	  //parseFloat(price).toFixed(2)
	} catch (error) {
	  console.error('Error updating tee time:', error);
	  res.status(500).json({ error: 'Failed to update tee time' });
	}
  });



// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
