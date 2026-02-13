import { Outlet } from "react-router"
import { useState } from 'react';
import { FloatingIndicator, UnstyledButton, Box } from '@mantine/core';
import classes from './MainLayout.module.css';

const data = ['React', 'Vue', 'Angular', 'Svelte'];

export default function MainLayout() {
    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const [active, setActive] = useState(0);

    const setControlRef = (index: number) => (node: HTMLButtonElement) => {
        controlsRefs[index] = node;
        setControlsRefs(controlsRefs);
    };

    const controls = data.map((item, index) => (
        <UnstyledButton
            key={item}
            className={classes.control}
            ref={setControlRef(index)}
            onClick={() => setActive(index)}
            mod={{ active: active === index }}
        >
            <span className={classes.controlLabel}>{item}</span>
        </UnstyledButton>
    ));

    return (
        <>
            <Outlet />
            <div className={classes.root} ref={setRootRef}>
                {controls}

                <FloatingIndicator
                    target={controlsRefs[active]}
                    parent={rootRef}
                    className={classes.indicator}
                />
            </div>
            <Box
  w={{ base: '100%', sm: '50%', lg: '25%' }}
  p={{ base: 'sm', md: 'xl' }}
  bg={{ base: 'blue.5', sm: 'red.5' }}
>
  Responsive Box
</Box>
        </>

    )
}