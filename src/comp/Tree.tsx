import classNames from 'classnames'
import _ from 'lodash'
import React from 'react'
import './Tree.scss'

type ChildrenType = 'hidden' | 'radio' | 'checkbox'

interface ITreeNode {
    id: string
    label: string
    children?: ITreeNode[]
    childrenType?: string
}

class TreeNode implements ITreeNode {
    id: string
    label: string
    children = [] as TreeNode[]
    childrenType = 'Checkbox' as ChildrenType
    parent: TreeNode

    static create(src: ITreeNode, isRoot = true) {
        const node = Object.assign(new TreeNode(), src)
        node.children = (src.children || []).map(c => TreeNode.create(c, false))
        node.descendants.forEach(d => {//link parent
            d.children.forEach(c => c.parent = d)
        })
        if (isRoot) node.id = '_root_'
        return node
    }

    get descendants() {
        const ret = [this] as TreeNode[]
        if (this.children) this.children.forEach(c => {
            ret.push(...c.descendants)
        })
        return ret
    }

    get ancestors() {
        const ret = [this] as TreeNode[]
        if (this.parent) {
            ret.push(...this.parent.ancestors)
        }
        return ret
    }

    get nestLevel() {
        return this.ancestors.length - 1
    }

    find(id: string) {
        return this.descendants.find(n => n.id == id)
    }

    get inputType() {
        return this.parent.childrenType
    }

    get isFolder() {
        return this.children.length > 0
    }

    fixChecked(checked: string[]) {
        const newChecked = [...checked]
        this.descendants.filter(n => n.isFolder).forEach(n => {
            const childrenId = n.children.map(c => c.id)
            if (n.childrenType == 'hidden') {
                newChecked.push(...childrenId)
            }
            if (n.childrenType == 'radio') {
                let checked = newChecked.find(c => childrenId.includes(c))
                if (!checked) checked = n.children[0].id
                _.pullAll(newChecked, childrenId)
                newChecked.push(checked)
            }
        })
        checked.length = 0
        checked.push(..._.uniq(newChecked).sort())
        return checked
    }

    isVisible(id: string, checked: string[]) {
        const ids = this.find(id).ancestors.map(n => n.id)
        _.remove(ids, '_root_')
        return ids.every(id => checked.includes(id))
    }
}

interface TreeProps {
    root: TreeNode
    checked: string[]
    setChecked: (checked: string[]) => void
}

function Tree(props: TreeProps) {
    const { root, checked, setChecked } = props
    root.fixChecked(checked)

    const onChange = () => { }

    const onClick = (id: string) => {
        const node = root.find(id)
        let newChecked = [...checked]
        if (node.inputType == 'radio') {
            _.pullAll(newChecked, node.parent.children.map(c => c.id))
            newChecked.push(id)
        } else {
            newChecked = _.xor(newChecked, [id])
        }
        setChecked(newChecked.sort())
    }

    function nodeToElement(node: TreeNode) {
        const { id, label, children, childrenType, nestLevel } = node
        const isChecked = checked.includes(id)
        let childrenEle = null
        if (children && isChecked && childrenType != 'hidden') {
            childrenEle = <ul>
                {node.children.map(c => nodeToElement(c))}
            </ul>
        }
        const inputType = node.parent.childrenType == 'radio' ? 'radio' : 'checkbox'

        return <li className="treeNode" key={id}>
            <div className={classNames("treeItem", "lev" + nestLevel, { checked })}
                onClick={() => onClick(id)}>
                <span style={{
                    display: 'inline-block',
                    width: nestLevel * 10 + 'px'
                }}></span>
                <input type={inputType} checked={isChecked} onChange={onChange} />
                <span>{label}</span>
            </div>
            {childrenEle}
        </li>
    }

    return <div className="Tree">
        <ul>
            {root.children.map(c => nodeToElement(c))}
        </ul>
    </div>
}


export { Tree, TreeNode }