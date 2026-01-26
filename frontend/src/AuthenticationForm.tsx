import {
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  type PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { GoogleButton } from './GoogleButton';
import * as z from 'zod';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authClient } from './auth-client';

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name must be at least 1 character"),
})

export function AuthenticationForm(props: PaperProps) {
  const [type, toggle] = useToggle(['login', 'register']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      emailVerified: '',
    },

    validate: zod4Resolver(schema),
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);

    if (type === 'register') {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => navigate('/dashboard'), //change later
        }
      });

    if (error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") form.setFieldError('email', 'Email already exists');

    } else {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          fetchOptions: {
            onSuccess: () => navigate('/dashboard'),
          }
        });

        if (error?.code === "INVALID_EMAIL_OR_PASSWORD") form.setErrors({email: 'Invalid email or password', password: 'Invalid email or password'});
      }

    setLoading(false);
  };

  return (
    <Paper radius="md" p="lg" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Workout App, {type} with
      </Text>

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl">Google</GoogleButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === 'register' && (
            <TextInput
              required
              label="Name"
              placeholder="John"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
            />
          )}

          <TextInput
            required
            label="Email"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password}
            radius="md"
          />

          <Anchor component="button" size="sm">
            Forgot password?
          </Anchor>

        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl" loading={loading}>
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}