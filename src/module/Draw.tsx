import { Module } from "../Bench"

interface Config {

}
interface State {
    _: any
}

class Draw extends Module<Config, State> {

    panel = <div>Draw</div>

    render() {

    }

    async init() {

    }


}


export { Draw }
