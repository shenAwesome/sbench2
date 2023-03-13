import { Bench, Test2Module, TestModule } from './Bench'
import { MapCore } from './module/MapCore'
import { Layers } from './module/Layers'
import { Draw } from './module/Draw'
import { Print } from './module/Print'
import { Projects } from './module/Projects'

const bench = new Bench({
  TestModule, Test2Module, MapCore,
  Layers, Draw, Print, Projects
})

bench.start()