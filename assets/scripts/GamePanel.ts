import { _decorator, Component, EditBox, instantiate, JsonAsset, Label, Node, randomRangeInt, Sprite, Vec2 } from 'cc';
import { SetBlock } from './SetBlock';
import { Block } from './Block';
import CocosUtils from './CocosUtils';
import { BlockGridType, BlockType, GameConstant } from './GameConstant';
import { CommonTips } from './CommonTips';
const { ccclass, property } = _decorator;

interface LevelConfig {
    lvID: number,
    totalSteps: number,
    target: Target,
    blockTypes: number[],
    gameGrid: number[][],
    blockGrid: number[][],
    guideBlocks: number[][],
    fullStars: number,
    mapId: number,
    rewards: Reward[]
}

interface Target {
    type: number,
    value: TargetValue[]
}

interface TargetValue {
    blockType: number,
    count: number
}

interface Reward {
    type: number,
    count: number
}

@ccclass('GamePanel')
export class GamePanel extends Component {
    @property(Node)
    cellTmp: Node = null!;
    @property(Node)
    cellParent: Node = null!;
    @property(SetBlock)
    setBlock: SetBlock = null!;
    @property(EditBox)
    mapEditBox: EditBox = null!;
    @property(EditBox)
    levelEditBox: EditBox = null!;
    @property(EditBox)
    stepsEditBox: EditBox = null!;
    @property(EditBox)
    fullStarsEditBox: EditBox = null!;
    @property(EditBox)
    targetEditBox: EditBox = null!;
    @property(EditBox)
    rewardEditBox: EditBox = null!;
    @property(EditBox)
    guideEditBox: EditBox = null!;
    @property(CommonTips)
    commonTips: CommonTips = null!;
    @property(JsonAsset)
    levelConfigJson: JsonAsset = null!;

    private _curBlock: Block = null!;
    private _blockGrid: Block[][] = [];

    start() {
        this._initCells();
    }

    private _initCells() {
        for (let i = 0; i < GameConstant.Row; i++) {
            let rowBlock: Block[] = [];
            for (let j = 0; j < GameConstant.Col; j++) {
                let cellNode = instantiate(this.cellTmp);
                cellNode.getComponentInChildren(Label).string = `${i},${j}`;
                this.cellParent.addChild(cellNode);
                cellNode.active = true;
                let block = cellNode.getComponent(Block);
                block.blockGridType = BlockGridType.Normal;
                block.blockGridID = new Vec2(i, j);
                cellNode.on("click", () => {
                    this._curBlock = cellNode.getComponent(Block);
                    this.setBlock.showPanel(this._curBlock, this);
                }, this);
                rowBlock.push(block);
            }
            this._blockGrid.push(rowBlock);
        }
    }

    public updateBlock(block: Block) {
        if (this._curBlock) {
            this._curBlock.blockType = block.blockType;
            let icon = this._curBlock.node.getChildByName('icon');
            if (this._curBlock.blockType) {
                icon.active = true;
                CocosUtils.loadTextureFromBundle("game", `textures/cells/type${this._curBlock.blockType}`, icon.getComponent(Sprite));
            }
            else {
                icon.active = false;
            }
        }
    }

    onExport() {
        if (this.levelEditBox.string === '') {
            this.commonTips.setTips('请输入关卡ID');
            return;
        }
        if (this.mapEditBox.string === '') {
            this.commonTips.setTips('请输入地图ID');
            return;
        }
        if (this.stepsEditBox.string === '') {
            this.commonTips.setTips('请输入总步数');
            return;
        }
        if (this.fullStarsEditBox.string === '') {
            this.commonTips.setTips('请输入3星分数');
            return;
        }
        if (this.targetEditBox.string === '') {
            this.commonTips.setTips('请输入目标');
            return;
        }
        if (this.rewardEditBox.string === '') {
            this.commonTips.setTips('请输入奖励');
            return;
        }

        let gameGrids: number[][] = [];
        let blockGrid: BlockType[][] = [];
        for (let i = 0; i < GameConstant.Row; i++) {
            let row: BlockType[] = [];
            let row2: number[] = [];
            for (let j = 0; j < GameConstant.Col; j++) {
                let block = this._blockGrid[i][j];
                row.push(block.blockType);
                row2.push(block.blockGridType);
            }
            blockGrid.push(row);
            gameGrids.push(row2);
        }

        let targetArr = this.targetEditBox.string.split('|');
        let targetVal: TargetValue[] = [];
        for (let i = 0; i < targetArr.length; i++) {
            let target = targetArr[i].split(',');
            targetVal.push({ blockType: parseInt(target[0]), count: parseInt(target[1]) });
        }

        let rewardArr = this.rewardEditBox.string.split('|');
        let rewards: Reward[] = [];
        for (let i = 0; i < rewardArr.length; i++) {
            let reward = rewardArr[i].split(',');
            rewards.push({ type: parseInt(reward[0]), count: parseInt(reward[1]) });
        }

        let guideArr = this.guideEditBox.string !== '' ? this.guideEditBox.string.split('|') : [];
        let guides: number[][] = [];
        for (let i = 0; i < guideArr.length; i++) {
            let guide = guideArr[i].split(',');
            guides.push([parseInt(guide[0]), parseInt(guide[1])]);
        }

        let config: LevelConfig = {
            lvID: parseInt(this.levelEditBox.string),
            totalSteps: parseInt(this.stepsEditBox.string),
            target: {
                type: 1,
                value: targetVal
            },
            blockTypes: [1, 2, 3, 4],
            gameGrid: gameGrids,
            blockGrid: blockGrid,
            guideBlocks: guides,
            fullStars: parseInt(this.fullStarsEditBox.string),
            mapId: parseInt(this.mapEditBox.string),
            rewards: rewards
        }
        console.log('export levelconfig : ', config);


        // let isNew = true;
        // let jsonObj: any[] = this.levelConfigJson.json as any[];
        // let obj = [];
        // jsonObj.forEach(o => {
        //     obj.push(o);
        // });
        // for (let o of obj) {
        //     if (o.mapId === config.mapId && o.lvID === config.lvID) {
        //         isNew = false;
        //         o = config;
        //         break;
        //     }
        // }
        // if (isNew) {
        //     obj.push(config);
        // }

        // let str = JSON.stringify(obj);
        // let fileName = 'levels.json';
        // const blob = new Blob([str], { type: "application/json" });
        // const url = URL.createObjectURL(blob);

        // const link = document.createElement("a");
        // link.href = url;
        // link.download = fileName; // 浏览器会询问用户保存位置，或使用默认下载目录

        // document.body.appendChild(link);
        // link.click();

        // // 清理
        // document.body.removeChild(link);
        // URL.revokeObjectURL(url);

        // console.log(`已触发下载: ${fileName}`);
    }

    onRandom() {
        for (let i = 0; i < GameConstant.Row; i++) {
            for (let j = 0; j < GameConstant.Col; j++) {
                let block = this._blockGrid[i][j];
                block.blockType = randomRangeInt(BlockType.Type1, BlockType.End);
                let icon = block.node.getChildByName('icon');
                icon.active = true;
                CocosUtils.loadTextureFromBundle("game", `textures/cells/type${block.blockType}`, icon.getComponent(Sprite));
            }
        }
    }
}