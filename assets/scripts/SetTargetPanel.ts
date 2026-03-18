import { _decorator, Component, EditBox, instantiate, Node, Sprite } from 'cc';
import { BlockType } from './GameConstant';
import CocosUtils from './CocosUtils';
import { GamePanel, TargetValue } from './GamePanel';
const { ccclass, property } = _decorator;

@ccclass('SetTargetPanel')
export class SetTargetPanel extends Component {
    @property(Node)
    tmpTarget: Node = null!
    @property(Node)
    layoutNode: Node = null!

    private _targets: TargetValue[] = [];
    private _gamePanel: GamePanel = null!

    public showPanel(targets: TargetValue[], gamePanel: GamePanel) {
        this._gamePanel = gamePanel;
        this._targets = targets;
        this.node.active = true;
        this._initTarget();
        this._initData();
    }

    private _initTarget() {
        if (this.layoutNode.children.length > 0) {
            return;
        }
        let length = BlockType.End;
        for (let i = BlockType.Type1; i < length; i++) {
            let targetNode = instantiate(this.tmpTarget);
            targetNode.name = "blockType" + i;
            targetNode.active = true;
            targetNode['blockType'] = i;
            this.layoutNode.addChild(targetNode);
            let icon = targetNode.getChildByName("icon").getComponent(Sprite);
            CocosUtils.loadTextureFromBundle("game", `textures/cells/type${i}`, icon);
            targetNode.getComponentInChildren(EditBox).string = this._getTargetCount(i) === 0 ? '' : this._getTargetCount(i).toString();
        }
    }

    private _initData() {
        for (let target of this.layoutNode.children) {
            let targetType = target['blockType'];
            let count = this._getTargetCount(targetType);
            target.getComponentInChildren(EditBox).string = count === 0 ? '' : count.toString();
        }
    }

    private _getTargetCount(type: BlockType) {
        if (this._targets.length > 0) {
            for (let t of this._targets) {
                if (t.blockType === type) {
                    return t.count;
                }
            }
        }
        return 0;
    }

    private _setTargetCount(type: BlockType, count: number) {
        if (this._targets.length > 0) {
            let isUpdate = false;
            for (let t of this._targets) {
                if (t.blockType === type) {
                    if (count > 0) {
                        t.count = count;
                    }
                    else {
                        let index = this._targets.indexOf(t);
                        this._targets.splice(index, 1);
                    }
                    isUpdate = true;
                    break;
                }
            }
            if (!isUpdate && count > 0) {
                this._targets.push({ blockType: type, count });
            }
        }
        else if (count > 0) {
            this._targets.push({ blockType: type, count });
        }
    }

    onClose() {
        this._targets = [];
        this.node.active = false;
    }

    onOk() {
        for (let target of this.layoutNode.children) {
            let count = target.getComponentInChildren(EditBox).string === '' ? 0 : parseInt(target.getComponentInChildren(EditBox).string);
            let targetType = target['blockType'];
            this._setTargetCount(targetType, count);
        }
        this._gamePanel.updateTargetEditbox(this._targets);
        this.onClose();
    }
}