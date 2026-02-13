import React,{useContext} from 'react'
import { BusContext } from '../context/BusContext'
import { useT } from '../i18n'
export default function FilterBar(){
  const {filters,setFilters}=useContext(BusContext)!
  const t = useT()
  const toggle=(k:keyof typeof filters)=>setFilters(p=>({...p,[k]:!p[k]}))
  return (<div className="card" style={{marginTop:-30,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <strong>{t('filters')}</strong>
    <div style={{display:'flex',gap:16}}>
      <label><input type="checkbox" checked={filters.express} onChange={()=>toggle('express')}/> {t('express')}</label>
      <label><input type="checkbox" checked={filters.regular} onChange={()=>toggle('regular')}/> {t('regular')}</label>
    </div>
  </div>)
}
