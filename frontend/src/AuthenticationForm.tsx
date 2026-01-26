import {Anchor, Button, Divider, Group,Paper, type PaperProps, PasswordInput, Stack, Text, TextInput} from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoogleButton } from './GoogleButton';
import * as z from 'zod';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authClient } from './auth-client';

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().min(1, "Name must be at least 1 character").optional(),
})

export function AuthenticationForm(props: PaperProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setMode = (mode: string) => {
    setSearchParams({ mode });
  };
  const mode = searchParams.get('mode') || 'login';
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    mode: 'uncontrolled',
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

    if (mode === 'register') {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        fetchOptions: {
          onSuccess: () => navigate('/dashboard'), //change later
        }
      });

    if (error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") form.setFieldError('email', 'Email already exists');

    } else if (mode === 'login') {
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

  useEffect(() => form.reset, [mode])
  
  return (
    <Paper radius="md" p="lg" withBorder {...props}>
      {mode !== 'forgot-password' && (
        <>
          <Text size="lg" fw={500}>
            Welcome to Workout App, {mode === 'login' ? 'login with' : 'register with'}
          </Text>

          <Group grow mb="md" mt="md">
            <GoogleButton radius="xl">Google</GoogleButton>
          </Group>

          <Divider label="Or continue with email" labelPosition="center" my="lg" />
        </>
      )}

      {mode === 'forgot-password' && (
        <Text size="lg" fw={500}>
          Reset password
        </Text>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {mode === 'register' && (
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
              placeholder="hello@email.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
              radius="md"
            />
          
          {(mode !== 'forgot-password') && (
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />
          )}

        </Stack>

        <Group justify="space-between" mt="xl">
          <Stack align='flex-start' gap='xs'>
            {(mode === 'login') && (
              <>
                <Anchor component="button" type="button" c="dimmed" size="xs" onClick={() => setMode('register')}>
                  Don't have an account? Register
                </Anchor>

              <Anchor component="button" type="button" size="xs" onClick={() => setMode('forgot-password')}>
                  Forgot password?
              </Anchor>
              </>
            )}

            {(mode === 'register' || mode === 'forgot-password') && (
              <Anchor component="button" type="button" size="xs" onClick={() => setMode('login')}>
                Back to Login
              </Anchor>
            )}
            
          </Stack>

          <Button type="submit" radius="xl" loading={loading}>
            {mode === 'forgot-password' ? 'Reset' : mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}