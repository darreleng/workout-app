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
import Login from './Login'
import Signup from './Signup'

const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/signup", Component: Signup },
  { path: "/login", Component: Login },
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
