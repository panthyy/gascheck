import { useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './App.css'
import GasSensorDashboard from './pages/dashboard';


const router = createBrowserRouter([
  {
    path: "/",
    element: <GasSensorDashboard/>
  },
]);

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
