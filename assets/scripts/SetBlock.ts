import { _decorator, Component, EventTouch, instantiate, Layout, Node, Sprite, Toggle, UITransform } from 'cc';
import { Block } from './Block';
import { BlockType } from './GameConstant';
import CocosUtils from './CocosUtils';
import { GamePanel } from './GamePanel';
const { ccclass, property } = _decorator;

@ccclass('SetBlock')
export class SetBlock extends Component {
    @property(Layout)
    layout: Layout = null!
    @property(Node)
    blockTypeToggle: Node = null!
    @property(Node)
    blockToggleTemp: Node = null!
    @property(UITransform)
    blockUITransform: UITransform = null!
    @property(Toggle)
    checkGuideToggle: Toggle = null!

    private _gamePanel: GamePanel = null!
    private _curBlock: Block = null!;
    private _selectBlockType: BlockType = BlockType.INVALID;

    public showPanel(block: Block, gamePanel: GamePanel) {
        this._gamePanel = gamePanel;
        this._curBlock = block;
        this.node.active = true;

        this._initBlockTypeToggle();
        this._initData();
    }

    private _initData() {
        if (this._curBlock) {
            this.checkGuideToggle.isChecked = this._curBlock.isGuide;
            this._selectBlockType = this._curBlock.blockType;
            for (let toggle of this.blockTypeToggle.children) {
                toggle.getComponent(Toggle).isChecked = toggle['blockType'] === this._selectBlockType;
            }
        }
    }

    private _initBlockTypeToggle() {
        if (this.blockTypeToggle.children.length > 0) {
            this.blockTypeToggle.getChildByName(`blockType${BlockType.INVALID}`).getComponent(Toggle).isChecked = true;
            return;
        }
        let length = BlockType.End;
        for (let i = 0; i < length; i++) {
            let blockToggleNode = instantiate(this.blockToggleTemp);
            blockToggleNode.name = "blockType" + i;
            blockToggleNode.active = true;
            blockToggleNode['blockType'] = i;
            this.blockTypeToggle.addChild(blockToggleNode);
            let pos = blockToggleNode.getPosition();
            blockToggleNode.setPosition(16, pos.y, 0);
            let icon = blockToggleNode.getChildByName("icon").getComponent(Sprite);
            if (i > 0) {
                CocosUtils.loadTextureFromBundle("game", `textures/cells/type${i}`, icon);
            }
        }
        setTimeout(() => {
            this.blockUITransform.setContentSize(this.blockUITransform.width, this.blockUITransform.height + this.blockTypeToggle.getComponent(UITransform).height);
        }, 0);
    }

    private _clearData() {
        this._curBlock = null;
        this._selectBlockType = BlockType.INVALID;
        this.checkGuideToggle.isChecked = false;
    }

    onClose() {
        this._clearData();
        this.node.active = false;
    }

    onBlockTypeToggle(e: EventTouch) {
        this._selectBlockType = e.target['blockType'];
    }

    onOk() {
        this._curBlock.blockType = this._selectBlockType;
        this._curBlock.isGuide = this.checkGuideToggle.isChecked;
        this._gamePanel.updateBlock(this._curBlock);
        this.onClose();
    }
}