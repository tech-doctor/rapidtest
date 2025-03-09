import puppeteer from 'puppeteer';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
// import { teeTimes } from '../db/schema';
const { Pool } = pkg;

import {
	pgTable,
	timestamp,
	integer,
	uuid,
	text
} from 'drizzle-orm/pg-core';
import { parse } from 'date-fns';
import "dotenv/config";


const teeTimes = pgTable('tee_times', {
	id: uuid('id').defaultRandom().primaryKey(),
	time: timestamp('time', { mode: 'date' }).notNull().unique(),
	price: text('price').notNull(),
	minPlayers: integer('min_players').notNull(),
	maxPlayers: integer('max_players').notNull(),
	holes: text('holes').notNull()
});

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Navigate to the target URL
        const url = process.env.SCRAPPER_URL2;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait for the tee time tiles to load
        await page.waitForSelector('[data-testid="teetimes-tile-header-component"]');

        // Extract the tee time data
        const scrapedTeeTimes = await page.$$eval(
            '[data-testid="teetimes-tile-header-component"]',
            (tiles) => {
                return tiles.map((tile) => {
                    const time =
                        tile.querySelector('[data-testid="teetimes-tile-time"]')?.textContent.trim() || 'N/A';
                    const players =
                        tile
                            .querySelector('[data-testid="teetimes-tile-available-players"]')
                            ?.textContent.trim() || 'N/A';
                    const [minPlayers, maxPlayers] = players.split(' - ').map(Number);
                    // Extract holes and convert to integer
                    const holes =
                        tile.querySelector('[data-testid="teetimes-tile-hole-verbiage"]')?.textContent.trim() ||
                        'N/A';
                    const priceElement = tile
                        .closest('.MuiCardContent-root')
                        .querySelector('[data-testid="teetimes-tile-content-component"]');

                    const priceElements = priceElement?.querySelectorAll('.css-1m88q2v');
                    let price = '0.00'; // Default to 0.00 if no price is found

                    if (priceElements) {
                        if (priceElements.length === 1) {
                            // Single price
                            price = priceElements[0].textContent.trim().replace('$', '');
                        } else if (priceElements.length === 2) {
                            // Two prices (e.g., $42.00 – $80.00)
                            const price1 = priceElements[0].textContent.trim().replace('$', '');
                            const price2 = priceElements[1].textContent.trim().replace('$', '');
                            price = `${price1} - ${price2}`; // Use the first price (or handle as needed)
                        }
                    }
                    return {
                        time, // Keep time as a string
                        price, // Ensure price is a numeric string with 2 decimal places
                        minPlayers: isNaN(minPlayers) ? 0 : minPlayers, // Default to 0 if invalid
                        maxPlayers: isNaN(maxPlayers) ? 0 : maxPlayers, // Default to 0 if invalid
                        holes
                    };
                });
            }
        );

        // Output the scraped data
        console.log(scrapedTeeTimes);

        // Close the browser
        await browser.close();

        // Connect to the database
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        const db = drizzle(pool);

        // Insert the scraped data into the database
        for (const teeTime of scrapedTeeTimes) {
            try {
                await db
                    .insert(teeTimes)
                    .values({
                        time: parse(teeTime.time, 'h:mm a', new Date()), // Convert time string to Date object
                        price: teeTime.price,
                        minPlayers: teeTime.minPlayers,
                        maxPlayers: teeTime.maxPlayers,
                        holes: teeTime.holes
                    })
                    .onConflictDoUpdate({
                        target: teeTimes.time, // Use the `time` column as the conflict target
                        set: {
                            price: teeTime.price,
                            minPlayers: teeTime.minPlayers,
                            maxPlayers: teeTime.maxPlayers,
                            holes: teeTime.holes
                        }
                    });
                console.log(`Inserted/updated tee time: ${teeTime.time}`);
            } catch (error) {
                console.error(`Error inserting tee time: ${teeTime.time}`, error);
            }
        }

        console.log('All tee times have been inserted/updated.');
    } catch (error) {
        console.error('An error occurred during the scraping process:', error);
    }
})();

