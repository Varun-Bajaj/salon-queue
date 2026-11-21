import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useQueueStore } from './store/queueStore'
import { strings } from './lang/strings'
import Home from './pages/Home'
import JoinQueue from './pages/JoinQueue'
import MyStatus from './pages/MyStatus'
import Reception from './pages/Reception'
import BarberView from './pages/BarberView'
import Display from './pages/Display'
import Admin from './pages/Admin'

// Language context helper
export function useT() {
  const lang = useQueueStore(s => s.lang)
  return strings[lang]
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinQueue />} />
        <Route path="/status/:id" element={<MyStatus />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/barber/:name" element={<BarberView />} />
        <Route path="/display" element={<Display />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
