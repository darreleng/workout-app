# WorkoutLogger

🛠️ **Stack**
| Layer | Technology |
| :--- | :--- |
| **Frontend** | [React](https://react.dev/), [React Router](https://reactrouter.com/), [Mantine UI](https://mantine.dev/), [TanStack Query](https://tanstack.com/query/latest) |
| **Backend** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [PostgreSQL](https://www.postgresql.org/), [node-postgres](https://node-postgres.com/) |
| **Security** | [Better-Auth](https://www.better-auth.com/), [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Mock Service Worker](https://mswjs.io/), [Supertest](https://github.com/forwardemail/supertest) |
| **Deployment** | [Railway](https://railway.com/) |

A workout tracker app I built for my personal use and as a portfolio project. Not vibe-coded. It is the first full-stack app I built since completing [The Odin Project's Full Stack JavaScript curriculum](https://www.theodinproject.com/paths/full-stack-javascript) in early Jan 2026.

[**Live Link**](https://workout-app-production-4314.up.railway.app/) (Refresh the page if there is an "Application failed to respond" error.)

**Core Features**
- User authentication
- Workout logging
- Progress charts

**Preview**

https://github.com/user-attachments/assets/3545aab7-b53c-489b-af01-f77d7104d4b5
  
## Technical Challenges & Solutions

### **1. Maintaining Logical Order in Relational Data**
<img width="153" height="234" alt="image" src="https://github.com/user-attachments/assets/79ddf001-f447-4b16-93c8-86b4dcdcf43d" />


**The Challenge:** When a user deletes a set (e.g., Set 2 of 4), simply removing the row creates a "gap" in the numbering.

**The Solution:** I implemented a PostgreSQL Transaction that deletes a set and automatically re-indexes the remaining sets in that exercise.

<details>
  <summary>Details</summary>

```typescript
export async function deleteSet(userId: string, setId: string) {
	const client = await db.connect();
	try {
		await client.query('BEGIN');
        const infoRes = await client.query(
            `SELECT s.exercise_id, s.set_number FROM sets s
            JOIN exercises e ON s.exercise_id = e.id
            JOIN workouts w ON e.workout_id = w.id
            WHERE s.id = $1 AND w.user_id = $2`,
            [setId, userId]
        );

        if (infoRes.rows.length === 0) throw new Error("Set not found or unauthorized");
        const { exercise_id, set_number } = infoRes.rows[0];

        await client.query('DELETE FROM sets WHERE id = $1', [setId]);

        await client.query(
            `UPDATE sets 
            SET set_number = set_number - 1 
            WHERE exercise_id = $1 AND set_number > $2`,
            [exercise_id, set_number]
        );
        
        await client.query('COMMIT');
        return { success: true };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}
```
</details>

### **2. Data Architecture & State Management**

**The Challenge:** I didn't want to fetch a user's entire workout history in one go because it wastes bandwidth and makes the initial load feel sluggish. On the flip side, I didn't want 50 different child components each firing off their own GET requests, which is inefficient and can result in a jittery UI.

**The Solution:**
<details>
  <summary>Cursor Pagination + Infinite Scroll</summary>
  
  I implemented cursor-based pagination to handle loading a user's workout history. This allows the app to fetch workouts in discrete batches of 10, ensuring the "Infinite Scroll" stays performant even as a user's history grows into the thousands.

```typescript
// Backend: Cursor Logic using UUID comparison
export async function getAllWorkouts(userId: string, cursor: string | null) {
    const limit = 10;
    const startingId = (cursor) ? cursor : 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const query = `... WHERE w.user_id = $1 AND w.id < $2 ORDER BY created_at DESC LIMIT $3`;
    
    const { rows } = await db.query(query, [userId, startingId, limit + 1]);
    const hasNextPage = rows.length > limit;
    const itemsToReturn = hasNextPage ? rows.slice(0, -1) : rows;
    const nextCursor = hasNextPage ? itemsToReturn[itemsToReturn.length - 1].id : null;
    
    return { itemsToReturn, nextCursor };
}

// Frontend: React Query Integration
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['workouts'],
    queryFn: ({ pageParam }) => fetch(`/api/workouts?cursor=${encodeURIComponent(pageParam)}`),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```
</details>

<details>
  <summary>Parent-Level Fetching</summary>
  
  To avoid hitting the server for every component, I made strategic "mid-sized" fetches at the parent level. I then passed that data down as props and performed client-side transformations as needed, supplementing with smaller, surgical requests only when necessary.
</details>

<details>
  <summary>"Local-First" State</summary>
  
  I configured my Queries to have a global staleTime of Infinity. This effectively turned the browser cache into a "Local Database," ensuring the UI only updates when data actually changes after successful mutations like adding a set.

```typescript
// global QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Prevent unnecessary background re-fetches
    },
  },
});

// Invalidation after a mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
}
```
</details>

### **3. Data Security**
<img width="325" height="76" alt="image" src="https://github.com/user-attachments/assets/f9f33307-99d7-4217-87d5-80139f4a8bb7" />

**The Challenge:** Users should not be able to access the workout data of others. 

**The Solution:** I implemented a strict ownership verification layer at the database level. By joining every sensitive query with the user_id from the secure session, the database itself acts as a firewall. If a user tries to access an ID that doesn't belong to them, the query simply returns zero rows, preventing unauthorized data leaks or modifications.

<details>
  <summary>Details</summary>

```typescript
// workoutModel.ts
export async function getWorkout(userId: string, workoutId: string) {
    const query = 'SELECT * FROM workouts WHERE user_id = $1 AND id = $2';
    const { rows } = await db.query(query, [userId, workoutId]);
    return rows[0];
};

//workoutController.ts
export async function getWorkout(req: Request, res: Response) {
    try {
        const { workoutId } = req.params;
        const userId = req.user.id;
        const workout = await WorkoutModel.getWorkout(userId, workoutId as string);
        if (!workout) return res.status(404).json({ message: "Workout not found or unauthorised" });
        res.status(200).json(workout);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
```
</details>

### **4. Unified Validation & Single Source of Truth**

**The Challenge:** Maintaining consistency between frontend UI errors and backend API responses.

**The Solution:** I used shared Zod schemas. By importing the same validation logic into both the React components and the Express controllers, I ensured the frontend never attempts to send data that the server won't accept.

<details>
  <summary>Details</summary>

```typescript
// 1. Shared Schema
export const WorkoutNameSchema = z.object({ 
  name: z.coerce.string().trim().min(1).transform(titleCase) 
});

// 2. Frontend Usage (Mantine Input)
onBlur={(e) => {
  const result = WorkoutNameSchema.safeParse({ name: e.currentTarget.value });
  if (!result.success) return setNameError(true);
  mutation.mutate(result.data.name);
}}

// 3. Backend Usage (Express Controller)
const result = WorkoutNameSchema.safeParse(req.body);
if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });
```
</details>

## Tests
<details>
  <summary>Unit Test Example</summary>

  ```typescript
describe('SetCard Component', () => {
    const defaultProps = {
        id: 'current-set-id',
        set_number: 1,
        reps: 10,
        weight_kg: 100,
        workout_id: 'workout-123',
        prevExerciseSet: {
            id: 'prev-set-id',
            set_number: 1,
            reps: 8,
            weight_kg: 95.5,
        },
        updateSetField: vi.fn(),
        deleteSet: vi.fn(),
    };

    ...

    it('prevents the user to leave reps empty', async () => {
        const user = userEvent.setup();
        render(<SetCard {...defaultProps} />);

        const repsInput = screen.getByLabelText('Reps');

        await user.clear(repsInput);
        await user.tab();

        expect(repsInput).toBeInvalid();
    });
});
```
</details>

<details>
  <summary>Integration Test Example</summary>

```typescript
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const mockExercise = {
    id: 'current-ex-123',
    name: 'Bench Press',
    created_at: new Date().toISOString(),
    workout_id: 'workout-abc',
    sets: [
        { id: 'set-1', set_number: 1, reps: 8, weight_kg: 70 }
    ]
};

describe('ExerciseCard', () => {
    ...
    it('calls the delete mutation with the right set id when a set delete button is clicked', async () => {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        
        let capturedSetId: string;
        server.use(
            http.delete('/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId', ({ params }) => {
                capturedSetId = params.setId as string;
                return HttpResponse.json({ status: 200 });
            })
        );
        
        render(
            <QueryClientProvider client={queryClient}>
                <ExerciseCard {...mockExercise} />
            </QueryClientProvider>
        );
        
        await screen.findByLabelText('Set Number')
        await user.click(screen.getByLabelText('Set Number'));
        await user.click(screen.getByRole('menuitem', { name: /delete set/i }));
        await user.click(screen.getByRole('button', { name: /^delete$/i }));

        await waitFor(() => {
            expect(capturedSetId).toBe(mockExercise.sets[0].id);
        })

        expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['exercises'] }));
        expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['workouts', mockExercise.workout_id] }));
    });
});
```
</details>
