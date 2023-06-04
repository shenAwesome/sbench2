import Zoom from 'ol/control/Zoom'
import { defaults as defaultInteractions } from 'ol/interaction'
import DragPan from 'ol/interaction/DragPan'
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom'
import Map from 'ol/Map'
import {
    get as getProjection
} from 'ol/proj'
import OSM from 'ol/source/OSM'
import { Module, useEffect } from "../Bench"

import $ from "cash-dom"
import _ from 'lodash'
import Control from 'ol/control/Control'
import TileLayer from "ol/layer/Tile"
import 'ol/ol.css'
import View from "ol/View"
import '../css/MapCore.scss'
import { BenchLayer } from '../layer/BenchLayer'
import { until } from '../util/util'

interface Config {
    projection: string
    extent: string
}

interface State {
    extent: string
    active: boolean
}

class MapCore extends Module<Config, State> {
    public map: Map

    get view() {
        return this.map?.getView()
    }

    setExtent(extent: string) {
        if (extent != this.getExtent()) {
            const _extent = extent.split(',').map(e => parseFloat(e))
            this.view.fit(_extent)
        }
    }

    render() {
        const { extent } = this.state
        useEffect(() => {
            this.setExtent(extent)
        }, [extent], 'Always')
    }

    getExtent() {
        const view = this.map.getView()
        const _extent = view.calculateExtent()
        const isDegree = view.getProjection().getUnits() == 'degrees'
        return _extent.map(d => isDegree ? d.toFixed(6) : d.toFixed(0)).join(',')
    }

    async init() {

        await until(() => this.find('.screen').length > 0)

        const { config, mainDiv } = this
        const projection = getProjection(this.config.projection)
        const target = $(`<div class='benchMap'></div>`).appendTo(mainDiv).get(0)
        const screenDiv = this.get('.screen')
        const controlDiv = $(`<div class='controls'></div>`).appendTo(screenDiv).get(0)
        const baseLayer = new TileLayer({
            source: new OSM()
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

        const moveend = () => {
            const extent = this.getExtent()
            this.setState({ extent })
        }
        map.on('moveend', moveend)

        const updatePadding = () => {
            const rect1 = screenDiv.getBoundingClientRect() as any,
                rect2 = mainDiv.get(0).getBoundingClientRect() as any,
                padding = 'top,right,bottom,left'.split(',').map(k => Math.abs(rect1[k] - rect2[k]))
            map.getView().padding = padding
            if (this.initialized) moveend()
        }

        updatePadding()
        new ResizeObserver(_.debounce(updatePadding, 200)).observe(screenDiv)
        this.setExtent(this.state.extent)

        const layer = new BenchLayer('https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer', {
            tiled: true
        })

        const layer2 = new BenchLayer('https://ahocevar.com/geoserver/wms', {
            layers: 'topp:states'
        })

        map.addLayer(layer.createLayer())
        map.addLayer(layer2.createLayer())
        console.log('map: ', map)
        Object.assign(window, { getMapExtent: () => this.getExtent() })
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

