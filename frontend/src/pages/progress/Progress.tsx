import { LineChart } from '@mantine/charts';
import { Box, Paper, Title, Loader, Text, Select, Tooltip, ActionIcon, Group, Container, Divider, Stack, Center } from '@mantine/core';
import { type Exercise } from "../../../../shared/schemas";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { IconInfoCircle, IconSearch } from '@tabler/icons-react';
import classes from './Progress.module.css';
import { useOutletContext } from 'react-router';

interface ChartTooltipProps {
    label: React.ReactNode;
    payload: readonly Record<string, any>[] | undefined;
    chartType: 'volume' | 'weight';
}

function ChartTooltip({ label, payload, chartType }: ChartTooltipProps) {
    if (!payload) return null;
    const dateDisplay = label ? new Date(label as string).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    return (
        <Paper px="md" py="xs" bg={'dark.4'} withBorder>
            <Stack gap={2}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts="0.5px">
                    {dateDisplay}
                </Text>

                {payload.map((item: any) => (
                    <Group key={item.name} gap="xs" wrap="nowrap" mt={4}>
                        <Box 
                        w={10} 
                        h={10} 
                        style={{ 
                            backgroundColor: item.color || 'blue' 
                        }} 
                        />
                        
                        <Stack gap={0}>
                            <Text size="xs" fw={500} c="dimmed" style={{ lineHeight: 1 }}>
                                {chartType === 'volume' ? 'Total Volume' : 'Est. 1RM'}
                            </Text>
                            <Group gap={4} align="baseline">
                                <Text fz="lg" fw={800} style={{ lineHeight: 1.2 }}>
                                {item.value?.toLocaleString()}
                                </Text>
                                <Text fz="xs" fw={700} c="dimmed">
                                KG
                                </Text>
                            </Group>
                        </Stack>
                    </Group>
                ))}
            </Stack>
        </Paper>
    );
}

export default function Progress(){
    const [value, setValue] = useState('');
    const activeWorkout = useOutletContext();

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
            .map(set => set.weight_kg / (1.0278 - (0.0278 * set.reps)));

        const topIntensity = intensities.length > 0 ? Math.max(...intensities) : 0;

        return {
            name: ex.name,
            date: ex.created_at,
            oneRepMax: Math.round(topIntensity)
        };
    });

    const exTotalVolume = selectedExercise.map(ex => {
        const volume = ex.sets.reduce((acc, cur) => cur.weight_kg * cur.reps + acc, 0);

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

    if (isPending) return <Center h={'100vh'}><Loader size='xl' /></Center>; 
    if (error) return ;
   
    return (    
        <Box className={classes.wrapper}>
            <Container size="xl" pb={{ base: `${activeWorkout ? 100 : 72}`, sm: `${activeWorkout ? 32 : 0}`}} className={classes.responsiveContainer}>
                <Stack gap="lg">
                    <Group justify="space-between" align="center">
                        <Title className={classes.title}>Progress</Title>
                        <Select
                            placeholder="Search exercise..."
                            data={uniqueExerciseNames}
                            value={value}
                            onChange={(val) => setValue(val || '')}
                            disabled={isLoading}
                            rightSection={isLoading ? <Loader size="xs" /> : <IconSearch size={16} />}
                            searchable
                            clearable
                            w={{ base: '100%', sm: 250 }}
                        />
                    </Group>
                    <Divider mr={'-md'} ml={'-md'} visibleFrom='sm'/>
                    <Box h={40} display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {value ? (
                            <Title order={2} c="volt">{value}</Title>
                            ) : (
                            <Text c="dimmed" fs="italic">Select an exercise to view charts</Text>
                        )}
                    </Box>
                    <Stack gap="xs">
                        <Group gap={4}>
                            <Title order={4}>Total Volume</Title>
                            <Text size="xs" c="dimmed" lh={0}>(kg)</Text>
                        </Group>
        
                        <Paper withBorder h={{ base: 300, sm: 400}} p="md">
                            {exTotalVolume.length > 0 &&
                                <LineChart
                                    h={'100%'}
                                    w={'100%'}
                                    data={exTotalVolume}
                                    dataKey="date"
                                    series={[{ name: 'totalVolume', color: 'cyan.5' }]}
                                    curveType="monotone"
                                    tickLine='none'
                                    withXAxis={false}
                                    gridProps={{ yAxisId: "left" }}
                                    yAxisProps={{
                                        domain: [Math.round(lowestVolume * .85), Math.round(highestVolume * 1.1)],
                                        width: 42
                                    }}
                                    lineChartProps={{ syncId: 'chart', width: 500 }}
                                    tooltipProps={{
                                        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} chartType='volume'/>,
                                    }}
                                />
                            }
                        </Paper>
                    </Stack>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Group gap={4}>
                                <Title order={4}>Est. 1RM</Title>
                                <Tooltip
                                    label="Brzycki formula: weight / ( 1.0278 – 0.0278 × reps )"
                                    withArrow
                                    multiline
                                    w={180}
                                >
                                <ActionIcon variant="subtle" color="gray" radius="xl" size="sm">
                                    <IconInfoCircle size={16} />
                                </ActionIcon>
                                </Tooltip>
                            </Group>
                            <Text size="xs" c="dimmed">Based on top sets</Text>
                        </Group>
                        <Paper withBorder h={{ base: 300, sm: 400}} p="md">
                            {exTotalVolume.length > 0 &&
                                <LineChart
                                    h={'100%'}
                                    data={exOneRepMax}
                                    dataKey="date"
                                    series={[{ name: 'oneRepMax', color: 'grape.6' }]}
                                    curveType="monotone"
                                    tickLine='none'
                                    gridProps={{ yAxisId: "left" }}
                                    yAxisProps={{
                                        domain: [Math.round(lowestOneRepMax * .9), Math.round(highestOneRepMax * 1.1)],
                                        width: 42
                                    }}
                                    xAxisProps={{
                                        tickFormatter: (val) => new Date(val).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
                                        fontSize: 10,
                                    }}
                                    lineChartProps={{ syncId: 'chart' }}
                                    tooltipProps={{
                                        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} chartType='weight' />,
                                    }}
                                />
                            }
                        </Paper>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
