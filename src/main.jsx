import React from 'react'
import ReactDOM from 'react-dom/client'

// Polices embarquées dans l'appli : elles s'affichent même sans connexion
// (indispensable pour la version Android, qui n'atteint pas Google Fonts hors ligne).
import '@fontsource/pirata-one/400.css'
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'

import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
