import { Text, Group, Divider, TextInput, Anchor, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import * as z from 'zod';
import { useState } from "react";
import { Link } from "react-router";
import { authClient } from "../../auth-client";
import getErrorMessage from "../../auth-errors";

const schema = z.object({
    email: z.email("Invalid email"),
})

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {email: ''},
        validate: zod4Resolver(schema),
    });

    async function handleSubmit(values: typeof form.values) {
        setLoading(true);
        const { error } = await authClient.requestPasswordReset({
            email: values.email,
            redirectTo: `${window.location.origin}/reset-password`
        });

        error ? (setErrorMessage(getErrorMessage(error.code))) : undefined;

        setSubmitted(true);
        setLoading(false);
    }

    return (
        <>
            <Text size="lg" fw={500}>
                {errorMessage ? errorMessage : isSubmitted ? "If an account exists with that email, a reset link has been sent" : "Send a password reset link to your email"}
            </Text>

            <Divider my="lg" />
            
            {!isSubmitted &&
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        withAsterisk
                        label="Email"
                        placeholder="hello@email.com"
                        {...form.getInputProps('email')}
                    />

                    <Group justify="space-between" mt="xl">
                        <Anchor component={Link} to="/signin" size="xs">
                            Back to sign in
                        </Anchor>

                        <Button type="submit" loading={loading}>Reset</Button>
                    </Group>
                </form>
            }

            {isSubmitted && 
                <Button component={Link} to="/signin" fullWidth>Back to sign in</Button>
            }
        </>
    )
}
