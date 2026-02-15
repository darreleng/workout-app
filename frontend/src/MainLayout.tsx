import { Outlet, useNavigate, useLocation } from "react-router"
import { SegmentedControl, Text, Box, Center } from '@mantine/core';
import { IconUser, IconBarbell, IconChartBar } from '@tabler/icons-react';
import classes from './MainLayout.module.css';

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentValue = location.pathname.split('/')[1] || 'workouts';

    return (
        <>
            <Outlet />
            <Box className={classes.navContainer}>
                <SegmentedControl
                    radius="xl"
                    size="md"
                    fullWidth={true}
                    withItemsBorders={false}
                    classNames={{
                        root: classes.segmentedRoot,
                        indicator: classes.indicator,
                    }}
                    value={currentValue}
                    onChange={(value) => navigate(`/${value.toLowerCase()}`)}
                    data={[
                        { 
                            value: 'profile', 
                            label: (
                                <Center style={{ gap: 10 }}>
                                    <IconUser size={16} />
                                    <Text size="sm">Profile</Text>
                                </Center>
                            ) 
                        },
                        { 
                            value: 'workouts', 
                            label: (
                                <Center style={{ gap: 10 }}>
                                    <IconBarbell size={16} />
                                    <Text size="sm">Workouts</Text>
                                </Center>
                            ) 
                        },
                        { 
                            value: 'progress', 
                            label: (
                                <Center style={{ gap: 10 }}>
                                    <IconChartBar size={16} />
                                    <Text size="sm">Progress</Text>
                                </Center>
                            ) 
                        },
                    ]}
                />
            </Box>
        </>
    )
}