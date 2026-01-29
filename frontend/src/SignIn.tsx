import { Text, Group, Divider, PasswordInput, Stack, TextInput, Anchor, Button } from "@mantine/core";
import { GoogleButton } from "./GoogleButton";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import * as z from 'zod';
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { authClient } from "./auth-client";
import { useLocation } from "react-router";

const schema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const location = useLocation();
    const origin = location.state?.from || "/workouts";

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            name: '',
            password: '',
        },
        validate: zod4Resolver(schema)
    });

    async function handleSubmit(values: typeof form.values) {
        setLoading(true);
        const { error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
            fetchOptions: {
                onSuccess: () => navigate(origin)
            }
        });

        if (error?.code === "INVALID_EMAIL_OR_PASSWORD") form.setErrors({email: 'Invalid email or password', password: 'Invalid email or password'});
        if (error?.status === 500) setServerError('Our database is having trouble. Please try again later');

        setLoading(false);
    }

    async function handleGoogleSignIn() {
        setLoading(true);
        const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/workouts`
        });

        if (error) setServerError(error.message || "Could not connect to Google");
        setLoading(false);
    }

    return (
        <>
            <Text size="lg" fw={500}>
                Sign in to WorkoutLogger with
            </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
            </Group>

            <Divider label="Or email" labelPosition="center" my="lg" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>             
                    <TextInput
                        withAsterisk
                        label="Email"
                        placeholder="hello@email.com"
                        {...form.getInputProps('email')}
                        radius="md"
                    />
                
                    <PasswordInput
                        withAsterisk
                        label="Password"
                        placeholder="Your password"
                        {...form.getInputProps('password')}
                        radius="md"
                    />

                    {serverError && serverError}
                </Stack>

                <Group justify="space-between" mt="xl">
                    <Stack align='flex-start' gap='xs'>
                        <Anchor component={Link} to="/signup" c="dimmed" size="xs">
                            Don't have an account? Sign up
                        </Anchor>

                        <Anchor component={Link} to="/forgot-password" size="xs">
                            Forgot password?
                        </Anchor>
                        
                    </Stack>

                    <Button type="submit" radius="xl" loading={loading}>Sign in</Button>
                </Group>

            </form>
        </>
    )
}