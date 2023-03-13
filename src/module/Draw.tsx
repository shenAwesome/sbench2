import { BaseState, Module } from "../Bench"

interface Config {

}
interface State extends BaseState {
}

class Draw extends Module<Config, State> {

    panel = <div>Draw</div>

    render() {

    }

    async init() {

    }


}


export { Draw }
