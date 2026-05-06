import { _decorator, Component, EventTouch, instantiate, Label, Layout, Node, Sprite, Toggle, UITransform } from 'cc';
import { Block } from './Block';
import { BlockGridType, BlockType, ToolType } from './GameConstant';
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
    gridTypeToggle: Node = null!
    @property(Node)
    toolTypeToggle: Node = null!
    @property(Node)
    blockToggleTemp: Node = null!
    @property(Node)
    gridToggleTemp: Node = null!
    @property(Node)
    toolToggleTemp: Node = null!
    @property(UITransform)
    blockUITransform: UITransform = null!
    @property(UITransform)
    gridUITransform: UITransform = null!
    @property(UITransform)
    toolUITransform: UITransform = null!
    @property(Toggle)
    checkGuideToggle: Toggle = null!

    private _gamePanel: GamePanel = null!
    private _curBlock: Block = null!;
    private _selectBlockType: BlockType = BlockType.INVALID;
    private _selectGridType: BlockGridType = BlockGridType.Normal;
    private _selectToolType: ToolType = ToolType.INVALID;

    public showPanel(block: Block, gamePanel: GamePanel) {
        this._gamePanel = gamePanel;
        this._curBlock = block;
        this.node.active = true;

        this._initBlockTypeToggle();
        this._initGridTypeToggle();
        this._initToolTypeToggle();
        this._initData();
    }

    private _initData() {
        if (this._curBlock) {
            this.checkGuideToggle.isChecked = this._curBlock.isGuide;
            this._selectBlockType = this._curBlock.blockType;
            for (let toggle of this.blockTypeToggle.children) {
                toggle.getComponent(Toggle).isChecked = toggle['blockType'] === this._selectBlockType;
            }

            this._selectGridType = this._curBlock.blockGridType;
            for (let toggle of this.gridTypeToggle.children) {
                toggle.getComponent(Toggle).isChecked = toggle['gridType'] === this._selectGridType;
            }
        }
    }

    private _initBlockTypeToggle() {
        if (this.blockTypeToggle.children.length > 0) {
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

    private _initGridTypeToggle() {
        if (this.gridTypeToggle.children.length > 0) {
            return;
        }
        let length = BlockGridType.End;
        for (let i = 1; i < length; i++) {
            let gridToggleNode = instantiate(this.gridToggleTemp);
            gridToggleNode.name = "gridType" + i;
            gridToggleNode.active = true;
            gridToggleNode['gridType'] = i;
            this.gridTypeToggle.addChild(gridToggleNode);
            let pos = gridToggleNode.getPosition();
            gridToggleNode.setPosition(16, pos.y, 0);
            let icon = gridToggleNode.getChildByName("icon").getComponent(Sprite);
            if (i > 1) {
                let spriteName = BlockGridType[i === BlockGridType.Stone_Null ? BlockGridType.Stone : i];
                CocosUtils.loadTextureFromBundle("game", `textures/grids/${spriteName}`, icon);
                if (i === BlockGridType.Stone_Null) {
                    icon.getComponentInChildren(Label).node.active = true;
                }
            }
            else if (i === 0) {
                icon.getComponentInChildren(Label).node.active = true;
            }
        }
        setTimeout(() => {
            this.gridUITransform.setContentSize(this.gridUITransform.width, this.gridUITransform.height + this.gridTypeToggle.getComponent(UITransform).height);
        }, 0);
    }

    private _initToolTypeToggle() {
        if (this.toolTypeToggle.children.length > 0) {
            this.toolTypeToggle.getChildByName(`toolType${ToolType.INVALID}`).getComponent(Toggle).isChecked = true;
            return;
        }
        let typeArr: ToolType[] = [ToolType.INVALID, ToolType.Row, ToolType.Col, ToolType.BoomInGrid, ToolType.TypeMatch];
        for (let i = 0; i < typeArr.length; i++) {
            let type = typeArr[i];
            let toolToggleNode = instantiate(this.toolToggleTemp);
            toolToggleNode.name = "toolType" + type;
            toolToggleNode.active = true;
            toolToggleNode['toolType'] = type;
            this.toolTypeToggle.addChild(toolToggleNode);
            let pos = toolToggleNode.getPosition();
            toolToggleNode.setPosition(16, pos.y, 0);
            let icon = toolToggleNode.getChildByName("icon").getComponent(Sprite);
            if (type > 0) {
                CocosUtils.loadTextureFromBundle("game", `textures/cells/${ToolType[type]}`, icon);
            }
        }
        setTimeout(() => {
            this.toolUITransform.setContentSize(this.toolUITransform.width, this.toolUITransform.height + this.toolTypeToggle.getComponent(UITransform).height);
        }, 0);
    }

    private _clearData() {
        this._curBlock = null;
        this._selectBlockType = BlockType.INVALID;
        this._selectGridType = BlockGridType.Normal;
        this.checkGuideToggle.isChecked = false;
        this._selectToolType = ToolType.INVALID;
    }

    onClose() {
        this._clearData();
        this.node.active = false;
    }

    onBlockTypeToggle(e: EventTouch) {
        this._selectBlockType = e.target['blockType'];
        if (this._selectBlockType === BlockType.INVALID) {
            return;
        }
        if (this._selectGridType > BlockGridType.Ice_Thin) {
            this._resetSelectGrid();
        }
        if (this._selectToolType !== ToolType.INVALID) {
            this._resetSelectTool();
        }
    }

    onOk() {
        if (this._selectBlockType !== BlockType.INVALID) {
            if (this._selectGridType > BlockGridType.Ice_Thin) {
                this._resetSelectGrid();
            }
            this._resetSelectTool();
        }
        else if (this._selectGridType > BlockGridType.Ice_Thin) {
            this._resetSelectBlock();
            this._resetSelectTool();
            this.checkGuideToggle.isChecked = false;
        }
        else if (this._selectToolType !== ToolType.INVALID) {
            this._resetSelectBlock();
            this._resetSelectGrid();
            this.checkGuideToggle.isChecked = false;
        }
        this._curBlock.blockGridType = this._selectGridType;
        this._curBlock.blockType = this._selectBlockType;
        this._curBlock.toolType = this._selectToolType;
        this._curBlock.isGuide = this.checkGuideToggle.isChecked;
        this._gamePanel.updateBlock(this._curBlock);
        this.onClose();
    }

    onGridTypeToggle(e: EventTouch) {
        this._selectGridType = e.target['gridType'];
        if (this._selectGridType === BlockGridType.Normal || this._selectGridType === BlockGridType.Ice_Thin) {
            if (this._selectBlockType === BlockType.INVALID) {
                this._selectBlockType = BlockType.Type1;
                this.blockTypeToggle.getChildByName(`blockType${BlockType.Type1}`).getComponent(Toggle).isChecked = true;
            }
            return;
        }
        if (this._selectBlockType !== BlockType.INVALID) {
            this._resetSelectBlock();
        }
        if (this._selectToolType !== ToolType.INVALID) {
            this._resetSelectTool();
        }
        this.checkGuideToggle.isChecked = false;
    }

    onToolTypeToggle(e: EventTouch) {
        this._selectToolType = e.target['toolType'];
        if (this._selectToolType === ToolType.INVALID) {
            return;
        }
        if (this._selectBlockType !== BlockType.INVALID) {
            this._resetSelectBlock();
        }
        if (this._selectGridType > BlockGridType.Normal) {
            this._resetSelectGrid();
        }
        this.checkGuideToggle.isChecked = false;
    }

    private _resetSelectGrid() {
        this._selectGridType = BlockGridType.Normal;
        this.gridTypeToggle.getChildByName(`gridType${BlockGridType.Normal}`).getComponent(Toggle).isChecked = true;
    }

    private _resetSelectBlock() {
        this._selectBlockType = BlockType.INVALID;
        this.blockTypeToggle.getChildByName(`blockType${BlockType.INVALID}`).getComponent(Toggle).isChecked = true;
    }

    private _resetSelectTool() {
        this._selectToolType = ToolType.INVALID;
        this.toolTypeToggle.getChildByName(`toolType${ToolType.INVALID}`).getComponent(Toggle).isChecked = true;
    }
}