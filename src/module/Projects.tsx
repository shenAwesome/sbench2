import { BaseState, Module } from "../Bench"

interface Config {

}
interface State extends BaseState {
}

class Projects extends Module<Config, State> {

    panel = <div>Projects</div>

    render() {

    }



    async init() {

    }


}


export { Projects }