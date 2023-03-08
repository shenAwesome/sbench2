import { useEffect, useState } from "react"
import { Module } from "../Bench"
import { Tree, TreeNode } from "../comp/Tree"

interface Config {

}
interface State {
    checked: string[]
}

class Layers extends Module<Config, State> {

    panel = <div>hello</div>

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
            console.log('layer!')
        }, [checked.join(',')])

        this.panel = <div>
            <Tree root={root} checked={checked} setChecked={setChecked} />
        </div>
    }


    async init() {

    }


}


export { Layers }
