import { useState } from 'react'
import './App.css'


interface Props {
  modules: Module[]
}

function App({ modules }: Props) {
  const moduleUI = modules.map((m, i) =>
    <div key={i} > {m.createUI()}</div >)
  return (
    <div className="App">
      {moduleUI}
    </div>
  )
}

class Module<T = {}> {

  state = {} as T

  setState(newState: Partial<T>) {
    Object.assign(this.state as any, newState)
  }

  createUI() {
    return <div>abc</div>
  }
}


export { App, Module }
