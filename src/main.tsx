import { Bench } from './Bench'
import { MapCore } from './module/MapCore'
import { Layers } from './module/Layers'
import { Draw } from './module/Draw'
import { Print } from './module/Print'
import { Projects } from './module/Projects'

const bench = new Bench({
  MapCore,
  Layers, Draw, Print, Projects
})

bench.start()