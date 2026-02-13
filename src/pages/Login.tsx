import React,{useState} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n'
export default function Login(){
  const { login } = useAuth(); const t = useT()
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [remember,setRemember]=useState(true)
  const [show,setShow]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)
  const nav=useNavigate()
  const loc=useLocation() as any
  const next=(loc.state && loc.state.from) || '/'
  const submit=async(e:React.FormEvent)=>{e.preventDefault(); setError(null); setLoading(true); try{await login(username.trim(), password, remember); nav(next,{replace:true})}catch(err:any){setError(err?.message||'Login failed')}finally{setLoading(false)}}
  return (<div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'linear-gradient(135deg,#60a5fa,#22c55e)'}}>
    <div className='card' style={{width:360}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <img src='/raahi.png' alt='Raahi' style={{width:32,height:32,borderRadius:8}}/>
        <div><div style={{fontWeight:900}}>{t('brand')}</div><div style={{fontSize:12,color:'#64748b',fontWeight:600}}>{t('busTracker')}</div></div>
      </div>
      <h2 style={{margin:'6px 0 12px'}}>{t('signIn')}</h2>
      <form onSubmit={submit}>
        <label style={{fontSize:12,color:'#64748b',fontWeight:700}}>{t('username')}</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder='' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:10,padding:'10px 12px',margin:'6px 0 12px'}} autoFocus/>
        <label style={{fontSize:12,color:'#64748b',fontWeight:700}}>{t('password')}</label>
        <div style={{position:'relative'}}>
          <input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} placeholder='min 4 characters' style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:10,padding:'10px 12px'}}/>
          <button type='button' onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:8,top:6,border:'none',background:'transparent',cursor:'pointer',color:'#64748b'}}>{show?'Hide':'Show'}</button>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:10,alignItems:'center'}}>
          <label style={{display:'flex',gap:8,alignItems:'center'}}><input type='checkbox' checked={remember} onChange={()=>setRemember(!remember)}/> {t('rememberMe')}</label>
          <a href='#' onClick={(e)=>e.preventDefault()} style={{color:'#2563eb'}}>{t('forgot')}</a>
        </div>
        {error && <div style={{marginTop:10,color:'#dc2626'}}>{error}</div>}
        <button disabled={loading || !username || password.length<4} className='btn btn-primary' style={{width:'100%',marginTop:12}}>{loading ? '…' : t('signIn')}</button>
        <div style={{fontSize:12,color:'#64748b',marginTop:10}}>{t('signInTip')}</div>
      </form>
    </div>
  </div>)
}
