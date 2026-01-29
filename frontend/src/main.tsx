import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import MainLayout from './MainLayout'
import Home from './Home'
import ProtectedRoute from './ProtectedRoute'
import WorkoutList from './WorkoutList'
import SignIn from './SignIn'
import SignUp from './SignUp'
import AuthLayout from './AuthLayout'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'

const router = createBrowserRouter([
  { path: "/", Component: Home },
  { Component: AuthLayout, 
    children: [
      { path: "/signup", Component: SignUp },
      { path: "/signin", Component: SignIn },
      { path: "/forgot-password", Component: ForgotPassword },
      { path: "/reset-password", Component: ResetPassword },
    ]
   },
  { Component: ProtectedRoute, 
    children: [{
      Component: MainLayout,
      children: [
        { path: "/workouts", Component: WorkoutList },
        // { path: "/stats", Component: Stats },
        // { path: "/profile", Component: Profile },

      ]
    }

    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <RouterProvider router={router}/>
    </MantineProvider>
  </StrictMode>,
)
