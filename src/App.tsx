import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { BusProvider } from './context/BusContext'
import { AuthProvider } from './context/AuthContext'
import Protected from './components/Protected'
import Header from './components/Header'
import Home from './pages/Home'
const MapPage = lazy(() => import('./pages/Map'));
const Timeline = lazy(() => import('./pages/Timeline'))
import Favorites from './pages/Favorites'
import Path from './pages/Path'
import { SettingsProvider } from './context/SettingsContext'
import Login from './pages/Login'
import Chatbot from './components/chatbot'

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <BusProvider>
            <Header/>
            <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route element={<Protected/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/map" element={<Suspense fallback={<div className='container'><div className='card'>Loading map…</div></div>}><MapPage/></Suspense>}/>
                <Route path="/timeline" element={<Suspense fallback={<div className='container'><div className='card'>Loading…</div></div>}><Timeline/></Suspense>}/>
                <Route path="/favorites" element={<Favorites/>}/>
                <Route path="/path" element={<Path/>}/>
              </Route>
            </Routes>
            <Chatbot/>  
          </BusProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
