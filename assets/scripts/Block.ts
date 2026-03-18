import { _decorator, Component, Node, Vec2 } from 'cc';
import { BlockGridType, BlockType, ToolType } from './GameConstant';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {
    blockType: BlockType = BlockType.INVALID;
    toolType: ToolType = ToolType.INVALID;
    isTool: boolean = false;
    blockGridType: BlockGridType = BlockGridType.INVALID;
    blockGridID: Vec2;
    isGuide: boolean = false;
}