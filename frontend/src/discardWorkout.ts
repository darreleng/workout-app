// import { useMutation } from "@tanstack/react-query";

// export default function discardWorkout

// const mutation = useMutation({
//     mutationFn: async (workoutId: string) => {
//         const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
//             method: 'DELETE',
//             credentials: 'include',
//         });
//         if (!res.ok) throw await res.json();
//     },
//     onSuccess: () => {
//         // queryClient.setQueryData(['activeWorkout'], null);
//         queryClient.invalidateQueries({ queryKey: ['workouts'], exact: true });
//         // queryClient.removeQueries({ queryKey: ['activeWorkout'] });
//     },
//     // TODO: Think of error notifcation
//     onError: (error) => {
//         console.log(error);
//     }
//     })