import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Protected() {
  const { isAuthed } = useAuth()
  const loc = useLocation()
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: (loc as any).pathname }} />
  return <Outlet />
}
