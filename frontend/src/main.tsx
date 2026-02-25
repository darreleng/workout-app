import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
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

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity
      }
    }
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
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position='bottom-center' zIndex={9999}/>
        <RouterProvider router={router}/>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
