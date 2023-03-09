import _ from 'lodash'
import $, { Cash } from "cash-dom"
import React, { DependencyList, EffectCallback, useEffect as _useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './Bench.scss'
import { sleep, useWatch, until } from './util/util'
import classNames from 'classnames'

interface BenchConfig {
  title: string
  modules: string
  actions: string
}


let currentModule = null as Module

function useEffect(effect: EffectCallback, deps?: DependencyList) {
  _useEffect(() => {
    const { initialized } = currentModule
    if (initialized) {
      return effect()
    }
  }, deps)
}

class Bench {

  private modules = [] as Module[]
  private stateVersion = 0
  private storeKey = "test"
  private root = null as Cash

  constructor(modules: { [id: string]: new () => Module }) {
    Object.keys(modules).forEach(id => {
      const m = new modules[id]()
      const update = () => this.update()
      Object.assign(m, { id, update })
      this.modules.push(m)
    })
    this.saveState = _.debounce(this.saveState, 200)
  }

  private async autoWire(config: any) {
    const { modules } = this
    const solved = [] as Module[]
    while (true) {
      const newSolved = modules.filter(({ using }) => {
        const moduleReady = Object.keys(using).every(id => {
          (using as any)[id] = solved.find(m => m.id === id)
          return using[id] != null
        })
        return moduleReady
      })
      _.pullAll(modules, newSolved)
      solved.push(...newSolved)
      if (newSolved.length === 0) break //stop when there's no progress
    }
    modules.length = 0
    modules.push(...solved)
  }

  private createUI() {

    const { modules, storeKey } = this
    const self = this

    return () => {

      useWatch(() => this.stateVersion, 20)
      const rootRef = useRef<HTMLDivElement>()

      _useEffect(() => {
        self.root = $(rootRef.current)
      }, [])

      modules.forEach(m => {
        currentModule = m
        m.render()
      })

      const toggleModule = (mid: string) => {
        const module = modules.find(m => m.id == mid)
        const active = !module.active
        modules.forEach(m => m.active = false)
        module.active = active
      }

      const panel = modules.filter(m => m.active).map(m => {
        return <div key={m.id} className={m.id}>
          {m.panel}
        </div>
      })
      const nodeRef = useRef(null)
      const fnModules = this.config.actions.split(',').map(id => modules.find(m => m.id == id)).filter(m => !!m)
      const btns = fnModules.map(({ id, active }) => {
        return <button className={classNames(id, { active })} key={id} onClick={() => {
          toggleModule(id)
        }}>{id}</button>
      })

      function refresh() {
        localStorage.removeItem(storeKey)
        window.location.reload()
      }

      const showPanel = panel.length > 0

      return <div className="Bench" ref={rootRef}>
        <div className='head'>
          <div className='fill' onDoubleClick={refresh}>
          </div>
          <div className='btns'>
            {btns}
          </div>
        </div>
        <div className='body'>
          <div className='benchMain'></div>
          <div className='shell'>
            <div className='screen'></div>
            <div className={classNames('benchSidePanel', { show: showPanel })} ref={nodeRef}>
              {panel}
            </div>
          </div>
        </div>
      </div>
    }
  }

  private saveState() {
    const state = {}
    for (const m of this.modules) {
      Object.assign(state, { [m.id]: m.state })
    }
    localStorage.setItem(this.storeKey, JSON.stringify(state))
  }

  config: BenchConfig
  loaded = false

  public async start() {
    const root = $('#root').get(0) as HTMLElement

    const splash = $(`<div class='splash_mask'>
       <div class='spash'>
          hello
       </div> 
    </div>`).appendTo(document.body)

    const config = this.config = await (await fetch('./config.json')).json()
    console.log('config: ', config)
    document.title = config.title

    await this.autoWire(config)
    this.getModule('Layers').active = true

    const UI = this.createUI()
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <UI />
      </React.StrictMode>,
    )

    await until(() => !!this.root)
    //init modules, set state from config then from local storage 
    const { modules } = this
    const state = JSON.parse(localStorage.getItem(this.storeKey) || '{}')
    for (const m of modules) {
      m.root = this.root
      Object.assign(m.config, config[m.id])
      Object.assign(m.state, m.config, state[m.id])
      await m.init()
      m.initialized = true
    }


    this.update()

    splash.addClass('hide')
    await sleep(200)
    splash.remove()
    this.loaded = true
  }

  getModule(id: string) {
    return this.modules.find(m => m.id == id)
  }

  public update() {
    this.stateVersion++
    if (this.loaded) this.saveState()
  }
}


abstract class Module<C = any, S = any> {
  private _active = false
  public root = null as Cash
  public initialized = false

  panel = <div></div>

  find(query: string) {
    return this.root.find(query)
  }

  get(query: string) {
    return this.find(query).get(0)
  }

  get mainDiv() {
    return this.find('.benchMain')
  }

  get active() {
    return this._active
  }

  readonly id = "" as string
  readonly state = {} as S
  readonly config = {} as C
  readonly using = {} as { [id: string]: Module }

  private update() { }

  protected setState(newState: Partial<S>) {
    Object.assign(this.state as any, newState)
    this.update()
  }

  public async init() { }

  abstract render(): JSX.Element | void

  set active(val) {
    this._active = val
    this.update()
  }

  useState(key: keyof S, defaultVal?: S[keyof S]) {
    const { state } = this
    if (state[key] == undefined) state[key] = defaultVal
    const val = state[key]
    const setVal = (val: any) => this.setState({
      [key]: val
    } as any)
    return [val, setVal] as [typeof val, (v: typeof val) => void]
  }

}

class Test2Module extends Module<{
  num: number
  name: string
}> {

  state = {
    num: 123,
    name: 'abc'
  }

  render() {
    const { num } = this.state
    return <div>
      <div>{num}</div>
    </div>
  }

  test() {
    console.log('oo')
    this.setState({ num: this.state.num + 1 })
  }
}

class TestModule extends Module<{
  num: number
}> {

  state = {
    num: 100
  }

  using = {
    Test2Module: null as unknown as Test2Module
  }

  public async init() {
    //await sleep(2000)
  }

  render() {
    return <div>
      <button onClick={() => {
        this.using.Test2Module.test()
      }}>test</button>
    </div>
  }
}


export { Bench, Module, TestModule, Test2Module, useEffect }
