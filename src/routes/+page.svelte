<script lang="ts">
	import { teeTimes, fetchTeeTimes, deleteTeeTime } from '../stores/teeTimesStore';
	import { onMount } from 'svelte';
	import { format } from 'date-fns';

	//import {TeeTime} from  "../stores/teeTimesStore";

	interface TeeTime {
		id: number;
		time: string;
		price: number;
		minPlayers: number;
		maxPlayers: number;
		holes: number;
	}

	onMount(() => {
		fetchTeeTimes();
	});

	let editingTeeTime: TeeTime | null = null; // Track the tee time being edited

	// Function to start editing a tee time
	const startEdit = (teeTime: TeeTime) => {
		editingTeeTime = { ...teeTime }; // Create a copy of the tee time to edit
	};

	// Function to save changes after editing

	const saveEdit = async () => {
		if (editingTeeTime) {
			try {
				// Call the API to update the tee time
				console.log(editingTeeTime);
				const response = await fetch(`http://localhost:3001/tee-times/${editingTeeTime.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						//price: parseFloat(editingTeeTime.price).toFixed(2),
						price: editingTeeTime.price,
						minPlayers: editingTeeTime.minPlayers,
						maxPlayers: editingTeeTime.maxPlayers,
						holes: editingTeeTime.holes
					})
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

	// Function to cancel editing
	const cancelEdit = () => {
		editingTeeTime = null;
	};
</script>

<div class="overflow-x-auto">
	<h2 class="py-5 text-center text-lg">
		Tee times for today <span class="font-bold">{format(new Date(), 'dd-MM-yyyy')}</span>
	</h2>
	<table class="min-w-full rounded-lg border border-gray-200 bg-white shadow-sm">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>S/N</th
				>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>Time</th
				>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>Price</th
				>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>Players</th
				>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>Holes</th
				>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>Actions</th
				>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each $teeTimes as teeTime, index}
				<tr class="transition-colors hover:bg-gray-50">
					<td class="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
					<td class="px-6 py-4 text-sm text-gray-900">{teeTime.time}</td>
					<td class="px-6 py-4 text-sm text-gray-900">${teeTime.price}</td>
					<td class="px-6 py-4 text-sm text-gray-900"
						>{teeTime.minPlayers}-{teeTime.maxPlayers} players</td
					>
					<td class="px-6 py-4 text-sm text-gray-900">{teeTime.holes} holes</td>
					<td class="space-x-2 px-6 py-4 text-sm">
						<button
							on:click={() => startEdit(teeTime)}
							class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							Edit
						</button>
						<button
							on:click={() => deleteTeeTime(teeTime.id)}
							class="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
						>
							Delete
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Edit Form (Modal) -->
{#if editingTeeTime}
	<div class="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
		<div class="w-96 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-lg font-semibold">Edit Tee Time</h2>
			<form on:submit|preventDefault={saveEdit}>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Time</label>
						<input
							type="text"
							disabled
							bind:value={editingTeeTime.time}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Price</label>
						<input
							bind:value={editingTeeTime.price}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Min Players</label>
						<input
							type="number"
							bind:value={editingTeeTime.minPlayers}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Max Players</label>
						<input
							type="number"
							bind:value={editingTeeTime.maxPlayers}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Holes</label>
						<input
							type="number"
							bind:value={editingTeeTime.holes}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
				<div class="mt-6 flex justify-end space-x-2">
					<button
						type="button"
						on:click={cancelEdit}
						class="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
