import { LineChart } from '@mantine/charts';
import { ScrollArea, Box, Paper, Title, Loader, Combobox, useCombobox, TextInput, Text, Center } from '@mantine/core';
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

interface ChartTooltipProps {
    label: React.ReactNode;
    payload: readonly Record<string, any>[] | undefined;
    chartType: 'volume' | 'weight';
}

function ChartTooltip({ label, payload, chartType }: ChartTooltipProps) {
    if (!payload) return null;
   
    const dateDisplay = label ? new Date(label as string).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    return (
        <Paper px="md" py="sm" withBorder shadow="md" radius="md">
            <Text fw={500} mb={5}>
                {dateDisplay}
            </Text>
            {payload.map((item: any) => (
                <Text key={item.name} c={item.color} fz="sm">
                    {/* {chartType === 'volume' ? `Total Volume: ${item.value} kg` : `Estimated 1RM: ${item.value} kg`} */}
                    {chartType === 'volume' ? `Total Volume: ` : `Estimated 1RM: `} {item.value} kg
                </Text>
            ))}
        </Paper>
    );
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
            date: ex.created_at,
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

    return (    
        
        <Paper withBorder p="md" radius="md" w={1000}>
            <Center>
                <Title order={1}>{search}</Title>
            </Center>

            <Title order={4} mb="lg">Total Volume Over Time</Title> 
        
            <ScrollArea offsetScrollbars="x">
                
                {/* Adjust box size */}
                <Box>
                <LineChart
                    h={300}
                    data={exTotalVolume}
                    dataKey="date"
                    series={[
                        { name: 'totalVolume', color: 'blue' },
                    ]}
                    curveType="monotone"
                    tickLine="x"
                    unit=' kg'
                    gridAxis="xy"
                    withXAxis={false}
                    // xAxisProps={{ tick: false }}
                    xAxisProps={{
                        tickFormatter: (value) => 
                            new Date(value).toLocaleDateString('en-GB', { 
                                month: 'short', 
                                day: 'numeric' 
                            }),
                    }}
                    lineChartProps={{ syncId: 'chart' }}
                    tooltipProps={{
                        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} chartType='volume'/>,
                    }}
                />
                </Box>
            </ScrollArea>

            <Title order={4} mb="lg">Estimated 1RM Over Time</Title> 
        
            <ScrollArea offsetScrollbars="x">
                
                {/* Adjust box size */}
                <Box>
                <LineChart
                    h={300}
                    data={exOneRepMax}
                    dataKey="date"
                    series={[
                        { name: 'oneRepMax', color: 'grape' },
                    ]}
                    curveType="monotone"
                    tickLine="x"
                    unit=' kg'
                    gridAxis="xy"
                    xAxisProps={{
                        tickFormatter: (value) => 
                            new Date(value).toLocaleDateString('en-GB', { 
                                month: 'short', 
                                day: 'numeric' 
                            }),
                    }}
                    lineChartProps={{ syncId: 'chart' }}
                    tooltipProps={{
                        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} chartType='weight' />,
                    }}
                />
                </Box>
            </ScrollArea>
        </Paper>
        
    );
}
