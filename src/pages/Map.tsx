import React, { useContext } from 'react'
import CityMap from '../components/CityMap'
import { useSettings } from '../context/SettingsContext'
import { useT } from '../i18n'
import { BusContext } from '../context/BusContext'

export default function MapPage() {
  const { lite } = useSettings()
  const t = useT()
  const ctx = useContext(BusContext)!

  return (
    <div className="container">
      <h2>{t('cityMap')}</h2>

      {lite ? (
        <>
          <div className="card" style={{ background: '#fefce8' }}>
            {t('liteMapDisabled')}
          </div>

          <div className="card">
            <strong>
              {ctx.city.name} {t('stopsLabel')}
            </strong>
            <ul style={{ marginTop: 8 }}>
              {ctx.content.stops.map(s => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <CityMap />
      )}
    </div>
  )
}
