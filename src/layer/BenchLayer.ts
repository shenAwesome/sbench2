import { Layer } from "ol/layer"
import ImageLayer from "ol/layer/Image"
import TileLayer from "ol/layer/Tile"
import { ImageArcGISRest, ImageWMS, TileArcGISRest, TileWMS } from "ol/source"

type LayerType = 'MapServer' | 'FeatureServer' | 'WMS'

const BenchLayerOptions = {
    type: null as LayerType,
    tiled: false,
    layers: ''
}

class BenchLayer {

    layer: Layer

    options = BenchLayerOptions

    constructor(public url: string,
        options?: Partial<typeof BenchLayerOptions>) {
        this.options = Object.assign({}, this.options, options)
        if (!this.options.type) {
            let type = 'WMS' as LayerType
            if (url.includes('MapServer')) type = 'MapServer'
            this.options.type = type
        }

    }

    get type() {
        return this.options.type
    }

    createLayer() {
        let layer = null as Layer
        const { type, url, options } = this
        const { tiled, layers } = options
        const ratio = 1
        switch (type) {
            case 'MapServer':
                if (tiled) {
                    layer = new TileLayer<TileArcGISRest>({
                        source: new TileArcGISRest({
                            url
                        })
                    })
                } else {
                    layer = new ImageLayer<ImageArcGISRest>({
                        source: new ImageArcGISRest({
                            ratio, params: {}, url
                        })
                    })
                }
                break

            case 'WMS':
                if (tiled) {
                    layer = new TileLayer<TileWMS>({
                        source: new TileWMS({
                            url, params: { 'LAYERS': layers, 'TILED': true },
                            serverType: 'geoserver', transition: 0,
                        })
                    })
                } else {
                    layer = new ImageLayer<ImageWMS>({
                        source: new ImageWMS({
                            url, params: { 'LAYERS': layers },
                            serverType: 'geoserver', ratio
                        }),
                    })
                }
                break
        }

        this.layer = layer
        return this.layer
    }

}

export { BenchLayer }