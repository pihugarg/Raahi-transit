import React,{useContext} from 'react'
import { BusContext } from '../context/BusContext'
import { useT } from '../i18n'
export default function RouteList(){
  const {city,filteredRoutes}=useContext(BusContext)!
  const t = useT()
  return (<div className="card"><h3 style={{marginTop:0}}>{t('routesInCity',{city: city.name})}</h3>
    <div className="grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
      {filteredRoutes.map(r=>(<div key={r.id} className="card"><strong>{r.title}</strong><div style={{color:'#64748b'}}>{r.type} • {r.stops} stops • {r.km} km</div></div>))}
    </div>
  </div>)
}
