import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import { MantineProvider, createTheme } from '@mantine/core'
import { notifications, Notifications } from '@mantine/notifications';
import MainLayout from './MainLayout'
import Home from './pages/home/Home'
import ProtectedRoute from './ProtectedRoute'
import Workouts from './pages/workouts/Workouts'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import AuthLayout from './pages/auth/AuthLayout'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Profile from './pages/profile/Profile'
import PublicRoute from './PublicRoute'
import Workout from './pages/workout/Workout';
import Progress from './pages/progress/Progress'
import { IconX } from '@tabler/icons-react';
import NotFoundRedirect from './NotFoundRedirect';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity
        }
    },
    queryCache: new QueryCache({
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Something went wrong with fetching data from the server',
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} /> 
            });
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Something went wrong with processing the action',
                color: 'red',
                autoClose: 2000,
                icon: <IconX stroke={2} size={20} /> 
            });
        },
    }),
});

const theme = createTheme({
    primaryColor: 'volt',
    colors: {
        volt: ['#f4ffcc', '#e6ff99', '#d7ff66', '#c8ff33', '#b9ff00', '#a4e600', '#8fcc00', '#7ab300', '#669900', '#528000'],
        dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262b', '#1A1B1E', '#141517', '#101113'],
    },
    defaultRadius: '0',
    fontFamily: 'Inter, sans-serif', 
    headings: {
        fontFamily: 'Archivo, sans-serif',
        fontWeight: '900',
    },

    components: {
        Container: {
            defaultProps: {
                bg: 'dark.8',
                shadow: 'md'
            }
        },
        Paper: {
            defaultProps: {
                bg: 'dark.6',
                shadow: 'md',
            },
        },
        Button: {
            defaultProps: {
                fw: 800,
                tt: 'uppercase',
                lts: '0.5px',
            },
        },
    },
});

const router = createBrowserRouter([
  { Component: PublicRoute,
    children: [
      { path: "/", Component: Home },
      { Component: AuthLayout, 
        children: [
          { path: "/signup", Component: SignUp },
          { path: "/signin", Component: SignIn },
          { path: "/forgot-password", Component: ForgotPassword },
          { path: "/reset-password", Component: ResetPassword },
        ]
      }
    ]
  },
  { Component: ProtectedRoute, 
    children: [
      { Component: MainLayout, 
        children: [
          { path: "/workouts", Component: Workouts },
          { path: "/progress", Component: Progress },
          { path: "/profile", Component: Profile },
        ]
      },
    { path: "/workouts/:id", Component: Workout}
    ]
  },
  { Component: NotFoundRedirect, path: "*"}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} forceColorScheme="dark">
        <Notifications position='bottom-center' zIndex={9999}/>
        <RouterProvider router={router}/>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
)
