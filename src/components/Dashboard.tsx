import React,{useContext,useState} from 'react'
import { BusContext } from '../context/BusContext'
import { useT } from '../i18n'
import { useSettings } from '../context/SettingsContext'
export default function Dashboard(){
  const {content,city,filteredRoutes}=useContext(BusContext)!
  const t = useT(); const { lite } = useSettings();
  const [open,setOpen]=useState<string|null>(null)
  const routesFor=(stopId:string)=>{const ids=content.stopRoutes[stopId]||[]; return filteredRoutes.filter(r=>ids.includes(r.id))}
  return (<>
    <h2 style={{textAlign:'center',margin:'24px 0 8px'}}>{t('dashboard',{city: city.name})}</h2>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,minmax(0,1fr))'}}>
      {content.stops.map(s=>{const rs=routesFor(s.id); const show=open===s.id; return (<div key={s.id} className="card">
        <div style={{fontWeight:800}}>{s.name}</div>
        <div style={{color:'#64748b'}}>Lat {s.lat.toFixed(3)}, Lng {s.lng.toFixed(3)}</div>
        <div style={{marginTop:8}}><button className="btn" onClick={()=>setOpen(show?null:s.id)}>{show?'Hide routes':'View routes'}</button></div>
        {show && (<div style={{marginTop:8}}>{rs.length===0 && <div style={{color:'#64748b'}}>No routes match current filters.</div>}{rs.map(r=>(<div key={r.id} className="card" style={{marginTop:6}}><strong>{r.title}</strong><div style={{color:'#64748b'}}>{r.type} • {r.stops} stops • {r.km} km</div></div>))}</div>)}
      </div>)})}
    </div>
  </>)
}
