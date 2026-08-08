import React from 'react'
import CitySearch from '../components/CitySearch'
import { useT } from '../i18n'
import { useSettings } from '../context/SettingsContext'
import FilterBar from '../components/FilterBar'
import Dashboard from '../components/Dashboard'
import RouteList from '../components/RouteList'
import Path from './Path'
export default function Home(){
  const t = useT(); const { lite } = useSettings();
  return (<div>
    <section className="hero">
      <div className="hero-inner">
        <h1>{t('heroTitle')}</h1>
        <p>{t('heroSub')}</p>
        <CitySearch/>
      </div>
    </section>
    <div className="container">
      {lite && <div className='card' style={{marginTop:12, background:'#f0fdf4'}}>{t('liteNotice')}</div>}
      <FilterBar/>
      <Dashboard/>
      <div style={{marginTop:16}}><Path/></div>
      <div style={{marginTop:16}}><RouteList/></div>
    </div>
  </div>)
}
