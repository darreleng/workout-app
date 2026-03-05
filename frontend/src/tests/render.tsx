import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

export function renderWithProviders(ui: React.ReactElement) {
    return render(ui, {
        wrapper: ({ children }) => (
            <MantineProvider env="test">
                {children}
            </MantineProvider>
        ),
    });
}