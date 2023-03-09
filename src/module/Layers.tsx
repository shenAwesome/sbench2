import { Module, useEffect } from "../Bench"
import { Tree, TreeNode } from "../comp/Tree"
import { MapCore } from "./MapCore"

interface Config {

}
interface State {
    checked: string[]
}

class Layers extends Module<Config, State> {

    panel = <div>hello</div>

    using = {
        MapCore: null as MapCore
    }

    render() {

        const _root = {
            id: '',
            label: '',
            children: [
                {
                    id: '1',
                    label: 'hello1',
                    children: [
                        {
                            id: '4',
                            label: 'hello1',
                        },
                        {
                            id: '5',
                            label: 'hello1',
                        },
                        {
                            id: '6',
                            label: 'hello1',
                        },

                    ]
                },
                {
                    id: '2',
                    label: 'hello2',
                    childrenType: 'radio',
                    children: [
                        {
                            id: '7',
                            label: 'hello1',
                        },
                        {
                            id: '8',
                            label: 'hello1',
                        },
                        {
                            id: '9',
                            label: 'hello1',
                        },

                    ]
                },
                {
                    id: '3',
                    label: 'hello3'
                },
            ]
        }

        const root = TreeNode.create(_root)

        const [checked, setChecked] = this.useState('checked', [])
        root.fixChecked(checked)

        useEffect(() => {
            console.log(checked.join(','))
        }, [checked.join(',')])

        this.panel = <div>
            <Tree root={root} checked={checked} setChecked={setChecked} />
        </div>
    }


    async init() {
        console.log(this.using.MapCore)
    }


}


export { Layers }
