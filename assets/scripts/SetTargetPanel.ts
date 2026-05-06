import { _decorator, Component, EditBox, instantiate, Node, Sprite } from 'cc';
import { BlockGridType, BlockType, ETargetType } from './GameConstant';
import CocosUtils from './CocosUtils';
import { GamePanel } from './GamePanel';
const { ccclass, property } = _decorator;

@ccclass('SetTargetPanel')
export class SetTargetPanel extends Component {
    @property(Node)
    tmpTarget: Node = null!
    @property(Node)
    layoutNode: Node = null!

    static readonly BlockType = '_BlockType';
    static readonly GridType = '_GridType';

    private _gamePanel: GamePanel = null!
    private _targetsMap: Map<ETargetType, Map<number, number>> = new Map();

    public showPanel(targets: Map<ETargetType, Map<number, number>>, gamePanel: GamePanel) {
        this._gamePanel = gamePanel;
        this._targetsMap = targets;
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
            targetNode[SetTargetPanel.BlockType] = i;
            this.layoutNode.addChild(targetNode);
            let icon = targetNode.getChildByName("icon").getComponent(Sprite);
            CocosUtils.loadTextureFromBundle("game", `textures/cells/type${i}`, icon);
            let count = this._getTargetCount(ETargetType.Grid, i);
            icon.getComponentInChildren(EditBox).string = count === 0 ? '' : count.toString();
        }
        let length2 = BlockGridType.Stone_Null;
        for (let i = BlockGridType.Ice_Thin; i < length2; i++) {
            let targetNode = instantiate(this.tmpTarget);
            targetNode.name = "gridType" + i;
            targetNode.active = true;
            targetNode[SetTargetPanel.GridType] = i;
            this.layoutNode.addChild(targetNode);
            let icon = targetNode.getChildByName("icon").getComponent(Sprite);
            let spriteName = BlockGridType[i === BlockGridType.Stone_Null ? BlockGridType.Stone : i];
            CocosUtils.loadTextureFromBundle("game", `textures/grids/${spriteName}`, icon);
            let count = this._getTargetCount(ETargetType.Block, i);
            icon.getComponentInChildren(EditBox).string = count === 0 ? '' : count.toString();
        }
    }

    private _initData() {
        for (let target of this.layoutNode.children) {
            let targetType = 0;
            let type = 0;
            if (target[SetTargetPanel.BlockType] !== undefined) {
                type = target[SetTargetPanel.BlockType];
                targetType = ETargetType.Block;
            }
            else if (target[SetTargetPanel.GridType] !== undefined) {
                type = target[SetTargetPanel.GridType];
                targetType = ETargetType.Grid;
            }
            let count = this._getTargetCount(targetType, type);
            target.getChildByName("icon").getComponentInChildren(EditBox).string = count === 0 ? '' : count.toString();
        }
    }

    private _getTargetCount(targetType: ETargetType, type: BlockType | BlockGridType) {
        let count = 0;
        if (this._targetsMap.has(targetType)) {
            let targets = this._targetsMap.get(targetType);
            if (targets && targets.has(type)) {
                count = targets.get(type);
            }
        }
        return count;
    }

    private _setTargetCount(targetType: ETargetType, type: BlockType | BlockGridType, count: number) {
        if (this._targetsMap.has(targetType)) {
            let targets = this._targetsMap.get(targetType)!;
            if (targets.has(type)) {
                if (count > 0) {
                    targets.set(type, count);
                }
                else {
                    targets.delete(type);
                }
            }
            else if (count > 0) {
                targets.set(type, count);
            }
        }
        else if (count > 0) {
            this._targetsMap.set(targetType, new Map().set(type, count));
        }
    }

    onClose() {
        this._targetsMap.clear();
        this.node.active = false;
    }

    onOk() {
        for (let target of this.layoutNode.children) {
            let icon = target.getChildByName("icon");
            let editStr = icon.getComponentInChildren(EditBox).string;
            let count = editStr === '' ? 0 : parseInt(editStr);
            let targetType = 0;
            let type = 0;
            if (target[SetTargetPanel.BlockType] !== undefined) {
                type = target[SetTargetPanel.BlockType];
                targetType = ETargetType.Block;
            }
            else if (target[SetTargetPanel.GridType] !== undefined) {
                type = target[SetTargetPanel.GridType];
                targetType = ETargetType.Grid;
            }
            this._setTargetCount(targetType, type, count);
        }
        this._targetsMap.forEach((value: Map<number, number>, key: ETargetType) => {
            if (value.size === 0) {
                this._targetsMap.delete(key);
            }
        });
        this._gamePanel.updateTargetEditbox(this._targetsMap);
        this.onClose();
    }
}