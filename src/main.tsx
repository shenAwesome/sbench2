import { Bench, Test2Module, TestModule } from './Bench'
import { MapCore } from './module/MapCore'
import { Layers } from './module/Layers'
import { Draw } from './module/Draw'


const bench = new Bench({
  TestModule, Test2Module, MapCore, Layers, Draw
})

bench.start()