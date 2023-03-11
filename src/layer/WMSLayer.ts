import TileLayer from "ol/layer/Tile"
import TileWMS from 'ol/source/TileWMS'

class WMSLayer extends TileLayer<TileWMS> {
    constructor() {
        super({
            source: new TileWMS({
                url: 'https://ahocevar.com/geoserver/wms',
                params: { 'LAYERS': 'topp:states', 'TILED': true },
                serverType: 'geoserver',
                transition: 0,
            })
        })
    }
}

export { WMSLayer }