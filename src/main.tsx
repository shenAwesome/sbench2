import React from 'react'
import ReactDOM from 'react-dom/client'
import { App, Module } from './App'
import './index.css'


const modules = [] as Module[]

modules.push(new Module())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App modules={modules} />
  </React.StrictMode>,
)
