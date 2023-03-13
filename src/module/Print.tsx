import { Module } from "../Bench"

interface Config {

}
interface State {
    _: any
}

class Print extends Module<Config, State> {

    panel = <div>Print</div>

    render() {

    }



    async init() {

    }


}


export { Print }
