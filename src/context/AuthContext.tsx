import React,{createContext,useContext,useMemo,useState} from 'react'

type AuthUser={username:string}
type AuthCtx={user:AuthUser|null;isAuthed:boolean;login:(u:string,p:string,remember:boolean)=>Promise<void>;logout:()=>void}

const KEY='raahi:auth:v1'
export const AuthContext=createContext<AuthCtx|null>(null)

export function useAuth(){
  const ctx=useContext(AuthContext)
  if(!ctx) throw new Error('AuthContext missing')
  return ctx
}

export const AuthProvider=({children}:{children:React.ReactNode})=>{
  const [user,setUser]=useState<AuthUser|null>(()=>{
    try{const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):null}catch{return null}
  })

  const login=async (u:string,p:string,remember:boolean)=>{
    await new Promise(r=>setTimeout(r,300))
    if(!u || p.length<4) throw new Error('Invalid credentials')
    const auth={username:u}
    if(remember) localStorage.setItem(KEY, JSON.stringify(auth))
    setUser(auth)
  }

  const logout=()=>{ localStorage.removeItem(KEY); setUser(null) }

  const value=useMemo(()=>({user,isAuthed:!!user,login,logout}),[user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
