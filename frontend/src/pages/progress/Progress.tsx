import { LineChart } from '@mantine/charts';
import { ScrollArea, Box, Paper, Title, Loader, TextInput, Text, Center, Select } from '@mantine/core';
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
                    {chartType === 'volume' ? `Total Volume: ` : `Estimated 1RM: `} {item.value} kg
                </Text>
            ))}
        </Paper>
    );
}

export default function Progress(){
    const [value, setValue] = useState('');

    const { 
        data: exercises,
        isPending,
        isLoading,
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

    const uniqueExerciseNames = [... new Set(exercises.map(ex => ex.name))];

    const selectedExercise = exercises.filter(ex => ex.name.toLowerCase() === value.toLowerCase()); 

    const exOneRepMax = selectedExercise.map(ex => {
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

    const exTotalVolume = selectedExercise.map(ex => {
        const volume = ex.sets.reduce((acc, cur) => cur.weight * cur.reps + acc, 0);

        return {
            name: ex.name,
            date: ex.created_at,
            totalVolume: volume
        }
    })

    const lowestOneRepMax = exOneRepMax.reduce((min, cur) => Math.min(min, cur.oneRepMax), exOneRepMax[0]?.oneRepMax || 0);
    const highestOneRepMax = exOneRepMax.reduce((max, cur) => Math.max(max, cur.oneRepMax), exOneRepMax[0]?.oneRepMax || 0);
    const lowestVolume = exTotalVolume.reduce((min, cur) => Math.min(min, cur.totalVolume), exTotalVolume[0]?.totalVolume || 0);
    const highestVolume = exTotalVolume.reduce((max, cur) => Math.max(max, cur.totalVolume), exTotalVolume[0]?.totalVolume || 0);
   
    return (    
        
        <Paper withBorder p="md" radius="md" w={1000}>
                <Select
                    label="Select an exercise"
                    data={uniqueExerciseNames}
                    onChange={(value) => setValue(value || '')}
                    nothingFoundMessage="Nothing found..."
                    disabled={isLoading}
                    rightSection={isLoading && <Loader size="xs" />}
                    searchable
                    clearable
                />
            <Center>
                {/* TODO: fix layout shift when empty*/}
                <Title order={1}>{value}</Title> 
            </Center>

            <Title order={4} mb="lg">Total Volume Over Time</Title> 
        
            <ScrollArea offsetScrollbars="x">

                <Box >
                <LineChart
                    h={300}
                    data={exTotalVolume}
                    dataKey="date"
                    series={[
                        { name: 'totalVolume', color: 'blue' },
                    ]}
                    curveType="monotone"
                    unit=' kg'
                    tickLine='none'
                    withXAxis={false}
                    gridProps={{
                        yAxisId: "left"
                    }}
                    yAxisProps={{ domain: [Math.round(lowestVolume * .9), Math.round(highestVolume * 1.1)]}}
                    xAxisProps={{ interval: 0, tick: true }} // no use
                    lineChartProps={{ syncId: 'chart' }}
                    tooltipProps={{
                        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} chartType='volume'/>,
                    }}
                />
                </Box>
            </ScrollArea>

            <Title order={4} mb="lg">Estimated 1RM Over Time</Title> 
        
            <ScrollArea w={'clamp(90vw, 600, 1200)'} offsetScrollbars="x">
                
                {/* <Box w={400} style={{overflowX: 'auto'}}> */}
                <LineChart
                    h={300}
                    data={exOneRepMax}
                    dataKey="date"
                    series={[
                        { name: 'oneRepMax', color: 'grape' },
                    ]}
                    curveType="monotone"
                    unit=' kg'
                    tickLine='none'
                    gridProps={{
                        yAxisId: "left"
                    }}
                    yAxisProps={{ domain: [Math.round(lowestOneRepMax * .9), Math.round(highestOneRepMax * 1.1)]}}
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
                {/* </Box> */}
            </ScrollArea>
            <Text fz={'sm'}>*Estimated 1RM is calculated using your top set (the set with the most volume under 13 sets) and the Brzycki formula: weight / ( 1.0278 – 0.0278 × reps ).</Text>
        </Paper>
        
    );
}
