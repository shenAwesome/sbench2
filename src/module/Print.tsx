import { BaseState, Module } from "../Bench"

interface Config {

}
interface State extends BaseState {
}

class Print extends Module<Config, State> {

    panel = <div>Print</div>

    render() {

    }



    async init() {

    }


}


export { Print }
