import React,{useContext,useMemo,useState} from 'react'
import { BusContext } from '../context/BusContext'
import { useT } from '../i18n'

export default function CitySearch(){
  const {cities, city, setCityId}=useContext(BusContext)!
  const [q,setQ]=useState('')
  const [open,setOpen]=useState(false)
  const [idx,setIdx]=useState(0)
  const t = useT();

  const matches=useMemo(()=>{
    const s=q.trim().toLowerCase()
    if(!s) return []
    return cities
      .filter(c=>c.name.toLowerCase().includes(s))
      .sort((a,b)=>a.name.localeCompare(b.name))
      .slice(0,10)
  },[q,cities])

  const commit=(name?:string)=>{
    const s=(name ?? q).trim().toLowerCase()
    if(!s && matches.length===0){ setOpen(false); return }
    const exact=cities.find(c=>c.name.toLowerCase()===s)
    const part=cities.find(c=>c.name.toLowerCase().includes(s))
    const chosen = exact || part || matches[0]
    if(chosen){ setCityId(chosen.id); setQ(chosen.name); setOpen(false); setIdx(0) }
  }

  return (<div style={{position:'relative'}}>
    <form className="input-row" onSubmit={(e)=>{e.preventDefault(); commit();}} autoComplete="off">
      <input
        value={q}
        onChange={e=>{setQ(e.target.value); setOpen(true); setIdx(0)}}
        onFocus={()=>setOpen(true)}
        onKeyDown={(e)=>{
          if(!open) return
          if(e.key==='ArrowDown'){ e.preventDefault(); setIdx(i=>Math.min(i+1, Math.max(0,matches.length-1))) }
          if(e.key==='ArrowUp'){ e.preventDefault(); setIdx(i=>Math.max(i-1, 0)) }
          if(e.key==='Enter'){ /* handled by form submit */ }
          if(e.key==='Escape'){ setOpen(false) }
        }}
        placeholder={t('search')+` (${city.name})`}
      />
      <button className="btn btn-primary" type="submit">{t('search')}</button>
    </form>

    {open && matches.length>0 && (
      <ul className="autocomplete" style={{zIndex:9999}} onMouseDown={e=>e.preventDefault()}>
        {matches.map((m,i)=>(
          <li key={m.id}
              style={{background: i===idx? '#eef2ff':'#fff', fontWeight: i===idx?800:600, borderBottom:'1px solid #f1f5f9'}}
              onMouseEnter={()=>setIdx(i)}
              onClick={()=>commit(m.name)}>
            {m.name}
          </li>
        ))}
      </ul>
    )}
  </div>)
}
