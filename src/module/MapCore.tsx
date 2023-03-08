import Zoom from 'ol/control/Zoom'
import Map from 'ol/Map'
import {
    get as getProjection
} from 'ol/proj'
import OSM from 'ol/source/OSM'
import DragPan from 'ol/interaction/DragPan';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom'
import { defaults as defaultInteractions } from 'ol/interaction'

import { useEffect } from 'react'
import { Module } from "../Bench"

import $ from "cash-dom"
import _ from 'lodash'
import Control from 'ol/control/Control'
import TileLayer from "ol/layer/Tile"
import 'ol/ol.css'
import View from "ol/View"
import { sleep, until } from '../util/util'
import '../css/MapCore.scss'

interface Config {
    projection: string
    extent: string
}
interface State {
    extent: string
}

class MapCore extends Module<Config, State> {
    map: Map
    mapReady = false

    render() {
        const { extent } = this.state
        const { map } = this

        useEffect(() => {
            const { root, mainDiv } = this
            if (!root.parent().length) {
                root.appendTo(mainDiv)
                until(() => !!this.map.getSize()).then(() => {
                    this.mapReady = true
                    this.setState({})
                    //set padding
                    const screenDiv = this.get('.screen')
                    new ResizeObserver(_.debounce(() => {
                        const rect1 = screenDiv.getBoundingClientRect() as any,
                            rect2 = root.get(0).getBoundingClientRect() as any,
                            padding = 'top,right,bottom,left'.split(',').map(k => Math.abs(rect1[k] - rect2[k]))
                        map.getView().padding = padding
                        console.log('padding: ', padding);
                    }, 200)).observe(screenDiv)
                })
            }
        }, [])

        const zoomTo = this.mapReady ? extent : null

        useEffect(() => {
            if (zoomTo && zoomTo != this.getMapExtent()) {
                const _extent = zoomTo.split(',').map(e => parseFloat(e))
                map.getView().fit(_extent)
                console.log('zoom to: ', _extent);
            }
        }, [zoomTo])
    }

    getMapExtent() {
        const view = this.map.getView()
        const _extent = view.calculateExtent()
        const isDegree = view.getProjection().getUnits() == 'degrees'
        return _extent.map(d => isDegree ? d.toFixed(6) : d.toFixed(0)).join(',')
    }

    root = $(`<div class='mapCore'></div>`)

    async init() {
        const { root, config } = this
        const projection = getProjection(this.config.projection)
        Object.assign(window, { getMapExtent: () => this.getMapExtent() })
        const target = $(`<div class='benchMap'></div>`).appendTo(root).get(0)
        const controlDiv = $(`<div class='controls'></div>`).appendTo(root).get(0)
        const baseLayer = new TileLayer({
            source: new OSM(),
        })
        const map = this.map = new Map({
            layers: [
                baseLayer
            ],
            target,
            view: new View({
                center: [0, 0],
                zoom: 2,
                projection
            }),
            controls: [],
            interactions: defaultInteractions({
                dragPan: false,
                mouseWheelZoom: false
            }).extend([
                new DragPan({ kinetic: null }),
                new MouseWheelZoom({ duration: 200 })
            ]),
        })
        map.addControl(new Zoom({ target: controlDiv }))
        map.addControl(new ButtonControl({
            class: 'home',
            target: controlDiv,
            click: () => {
                this.setState({ extent: config.extent })
            }
        }))
        map.on('moveend', () => {
            const extent = this.getMapExtent()
            if (this.mapReady) this.setState({ extent })
        })
        console.log(this.map)
    }
}

interface ButtonControlOption {
    class: string
    click: () => void
    target: HTMLElement
}

class ButtonControl extends Control {
    constructor(options: ButtonControlOption) {
        const element = $(`<div class='BtnControl ${options.class}'>
            <button></button> 
        </div>`).get(0)
        super({
            element,
            target: options.target,
        })
        $(element).find('button').on('click', options.click)
    }
}

export { MapCore }

