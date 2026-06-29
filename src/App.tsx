import { useState, useCallback } from 'react'
import HomePage from './pages/HomePage'
import TeachingMode from './pages/TeachingMode'
import ReferencePage from './pages/ReferencePage'
import AdminPage from './pages/AdminPage'
import AdminPasswordGate, { isAdminUnlocked } from './components/admin/AdminPasswordGate'

type View = 'home' | 'teaching' | 'reference' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [fromTeaching, setFromTeaching] = useState(false)
  const [showAdminGate, setShowAdminGate] = useState(false)

  const goTo = (next: View) => {
    if (view === 'teaching' && next !== 'teaching') setFromTeaching(true)
    if (next === 'teaching') setFromTeaching(false)
    setView(next)
  }

  const goBack = () => setView(fromTeaching ? 'teaching' : 'home')

  const handleAdminRequest = useCallback(() => {
    if (isAdminUnlocked()) {
      goTo('admin')
    } else {
      setShowAdminGate(true)
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* TeachingMode always mounted to preserve state */}
      <div style={{ display: view === 'teaching' ? 'block' : 'none' }}>
        <TeachingMode
          onHome={() => goTo('home')}
          onReference={() => goTo('reference')}
          onAdmin={handleAdminRequest}
        />
      </div>
      {view === 'home' && (
        <HomePage
          onStartTeaching={() => goTo('teaching')}
          onReference={() => goTo('reference')}
          onAdmin={handleAdminRequest}
        />
      )}
      {view === 'reference' && <ReferencePage onBack={goBack} />}
      {view === 'admin' && <AdminPage onBack={goBack} />}

      {showAdminGate && (
        <AdminPasswordGate
          onUnlock={() => { setShowAdminGate(false); goTo('admin') }}
          onCancel={() => setShowAdminGate(false)}
        />
      )}
    </div>
  )
}
