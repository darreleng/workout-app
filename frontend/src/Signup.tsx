import { Text, Group, Divider, PasswordInput, Stack, TextInput, Anchor, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import * as z from 'zod';
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { authClient } from "./auth-client";

const schema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().trim().min(1, "Name must be at least 1 character")
})

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | undefined>(undefined);

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
        const { error } = await authClient.signUp.email({
            email: values.email,
            password: values.password,
            name: values.name,
            fetchOptions: {
                onSuccess: () => navigate('/workouts'),
            }
        });
        if (error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") form.setFieldError('email', 'Email already exists');
        if (error?.status === 500) setServerError('Our database is having trouble. Please try again later');
        setLoading(false);
    }

    return (
        <>
            <Text size="lg" fw={500}>
                Sign up for WorkoutLogger
            </Text>

            <Divider my="lg" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        withAsterisk
                        label="Name"
                        placeholder="John"
                        {...form.getInputProps('name')}
                        radius="md"
                    />

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
                        <Anchor component={Link} to="/signin" c="dimmed" size="xs">
                            Back to sign in
                        </Anchor>

                        <Anchor component={Link} to="/forgot-password" size="xs">
                            Forgot password?
                        </Anchor>
                        
                    </Stack>

                    <Button type="submit" radius="xl" loading={loading}>Sign up</Button>
                </Group>

            </form>
        </>
    )
}
