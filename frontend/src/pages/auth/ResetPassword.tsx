import { Text, Group, Divider, PasswordInput, Anchor, Button, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import * as z from 'zod';
import { useState } from "react";
import { Link } from "react-router";
import { authClient } from "../../auth-client";
import getErrorMessage from "../../auth-errors";

const schema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const token = new URLSearchParams(window.location.search).get("token");
    const [errorMessage, setErrorMessage] = useState<string | undefined>(!token ? 'You need a valid password reset link to access this page' : undefined);
    
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: { password: '' },
        validate: zod4Resolver(schema),
    });

    async function handleSubmit(values: typeof form.values) {
        setLoading(true);

        const { error } = await authClient.resetPassword({
            newPassword: values.password,
            token: token!
        });

        error ? (setErrorMessage(getErrorMessage(error.code)), setStatus('error')) : setStatus('success');
        setLoading(false);
    }

    if (!token) {
        return (
            <AuthWrapper title="Invalid Access">
                <Stack align="center">
                    <Text size="sm" c="red">{errorMessage}</Text>
                    <Button component={Link} to="/forgot-password" size="xs" fullWidth>Request link</Button>
                </Stack>
            </AuthWrapper>
        );
    }

    if (status === 'error') {
        return (
            <AuthWrapper title="Reset Failed">
                <Stack align="center">
                    <Text size="sm" c="red">{errorMessage}</Text>
                    <Button component={Link} to="/forgot-password" size="xs" fullWidth>Request new link</Button>
                </Stack>
            </AuthWrapper>
        );
    }

    return (
        <AuthWrapper title={status === 'success' ? "Reset Success" : "New Password"}>
            {status === 'success' ? (
                <Stack align="center">
                    <Text size="sm">Your password has been updated.</Text>
                    <Button component={Link} to="/login" fullWidth>Login Now</Button>
                </Stack>
            ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <PasswordInput
                        withAsterisk
                        label="Password"
                        placeholder="At least 6 characters"
                        {...form.getInputProps('password')}
                    />
                    <Group justify="space-between" mt="xl">
                        <Anchor component={Link} to="/login" size="xs">Cancel</Anchor>
                        <Button type="submit" loading={loading}>Reset Password</Button>
                    </Group>
                </form>
            )}
        </AuthWrapper>
    );
}

function AuthWrapper({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <>
            <Text size="lg" fw={500}>{title}</Text>
            <Divider my="lg" />
            {children}
        </>
    );
}