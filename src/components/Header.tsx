import React,{useContext} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BusContext } from '../context/BusContext'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n'
import SettingsDrawer from './SettingsDrawer'

export default function Header(){
  const { pathname } = useLocation()
  const is=(p:string)=>pathname===p?'active':''
  const ctx=useContext(BusContext)!
  const t = useT()
  const [open,setOpen] = React.useState(false)
  const { isAuthed, user, logout } = useAuth()

  return (<header className="header">
    <div className="header-inner">
      <div className="brand">
        <img src="/raahi.png" alt={t('brand')}/>
        <div>{t('brand')}<div style={{fontSize:12,color:'#64748b',fontWeight:600}}>{t('busTracker')}</div></div>
        <span style={{marginLeft:10,fontSize:12,color:'#64748b'}}>• {ctx.city.name}</span>
      </div>
      <nav className="header-nav">
        <Link className={is('/')} to="/">{t('home')}</Link>
        <Link className={is('/map')} to="/map">{t('map')}</Link>
        <Link className={is('/timeline')} to="/timeline">{t('timeline')}</Link>
        <Link className={is('/path')} to="/path">Path</Link>
        <Link className={is('/favorites')} to="/favorites">{t('favorites')}</Link>
        <button className="btn" onClick={()=>setOpen(true)}>⚙︎ Settings</button>
        {isAuthed ? <button className="btn" onClick={logout} title={"Signed in as "+(user?.username||'')}>{t('logout')}</button> : <Link className={is('/login')} to="/login">{t('login')}</Link>}
      </nav>
      <SettingsDrawer open={open} onClose={()=>setOpen(false)}/>
      </div>
  </header>)
}
