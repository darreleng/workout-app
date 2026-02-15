import { LineChart } from '@mantine/charts';
import { ScrollArea, Box, Paper, Title, Loader, Combobox, useCombobox, TextInput } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Exercise {
    id: string;
    name: string;
    created_at: string;
    sets: {
        id: string;
        set_number: number;
        reps: number;
        weight: number;
    }[]
}

export default function Progress(){
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('Squats');
    const { 
        data: exercises,
        isPending,
        error
    } = useQuery<Exercise[]>({
        queryKey: ['exercises'],
        queryFn: async () => {
            const res = await fetch(`http://localhost:3000/api/exercises`, {credentials: 'include'});
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
    });

    if (isPending) return <div><Loader size='sm' /></div>; 
    if (error) return <div>Error: {error.message}</div>;

    console.log(exercises);

    const filteredExercises = exercises.filter(ex => ex.name.toLowerCase() === search.toLowerCase());

    const exOneRepMax = filteredExercises.map(ex => {
        const intensities = ex.sets
            .filter(set => set.reps > 0 && set.reps <= 12) 
            .map(set => set.weight / (1.0278 - (0.0278 * set.reps)));

        const topIntensity = intensities.length > 0 ? Math.max(...intensities) : 0;

        return {
            name: ex.name,
            date: new Date(ex.created_at),
            oneRepMax: Math.round(topIntensity)
        };
    });

    // TODO: Include other details like number of sets or the whole exercise details
    const exTotalVolume = filteredExercises.map(ex => {
        const volume = ex.sets.reduce((acc, cur) => cur.weight * cur.reps + acc, 0);

        return {
            name: ex.name,
            date: ex.created_at,
            totalVolume: volume
        }
    })

    console.log(exTotalVolume)

    return (    
        
        <Paper withBorder p="md" radius="md" w={600}>
            <Title order={4}>{search}</Title>
            <Title order={4} mb="lg">Total Volume Over Time</Title> 
        
        <ScrollArea offsetScrollbars="x">
            
            {/* Adjust box size */}
            <Box>
            <LineChart
                h={300}
                data={exTotalVolume}
                dataKey="date"
                series={[
                    { name: 'totalVolume', color: 'indigo.6' },
                ]}
                curveType="monotone"
                tickLine="xy"
                withXAxis
                withYAxis
                gridAxis="xy"
                xAxisProps={{
                    tickFormatter: (value) => {
                        const date = new Date(value);
                            return new Intl.DateTimeFormat('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                        }).format(date);
                    },
                }}
            />
            </Box>
        </ScrollArea>
        </Paper>
        
    );
}
