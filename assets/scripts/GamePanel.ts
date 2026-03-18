import { _decorator, Color, Component, EditBox, instantiate, Label, Node, randomRangeInt, Sprite, Vec2 } from 'cc';
import { SetBlock } from './SetBlock';
import { Block } from './Block';
import CocosUtils from './CocosUtils';
import { BlockGridType, BlockType, GameConstant, RewardType } from './GameConstant';
import { CommonTips } from './CommonTips';
import { SetTargetPanel } from './SetTargetPanel';
import { SetRewardPanel } from './SetRewardPanel';
const { ccclass, property } = _decorator;

export interface LevelConfig {
    lvID: number,
    totalSteps: number,
    target: Target,
    blockTypes: number[],
    gameGrid: number[][],
    blockGrid: number[][],
    guideBlocks: number[][],
    fullStar: number,
    mapId: number,
    rewards: Reward[],
    starCount: number,
    score: number
}

interface Target {
    type: number,
    value: TargetValue[]
}

export interface TargetValue {
    blockType: number,
    count: number
}

export interface Reward {
    type: RewardType,
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
    @property(CommonTips)
    commonTips: CommonTips = null!;
    @property(EditBox)
    checkLevelEditBox: EditBox = null!;
    @property(Label)
    selectFileLabel: Label = null!;
    @property(SetTargetPanel)
    setTargetPanel: SetTargetPanel = null!
    @property(SetRewardPanel)
    setRewardPanel: SetRewardPanel = null!

    private _blockGrid: Block[][] = [];
    private _levelConfigJson: LevelConfig[] = null!;
    private _selectFile: File = null!;

    start() {
        this._initCells();
    }

    private _initCells() {
        for (let i = 0; i < GameConstant.Col; i++) {
            let rowBlock: Block[] = [];
            for (let j = 0; j < GameConstant.Row; j++) {
                let cellNode = instantiate(this.cellTmp);
                this.cellParent.addChild(cellNode);
                cellNode.active = true;
                let block = cellNode.getComponent(Block);
                block.blockGridType = BlockGridType.Normal;
                block.blockGridID = new Vec2(j, GameConstant.Col - i - 1);
                cellNode.getComponentInChildren(Label).string = `${block.blockGridID.x},${block.blockGridID.y}`;
                cellNode.on("click", () => {
                    this.setBlock.showPanel(cellNode.getComponent(Block), this);
                }, this);
                rowBlock.push(block);
            }
            this._blockGrid.push(rowBlock);
        }
    }

    public updateBlock(block: Block) {
        let icon = block.node.getChildByName('icon');
        if (block.blockType) {
            icon.active = true;
            CocosUtils.loadTextureFromBundle("game", `textures/cells/type${block.blockType}`, icon.getComponent(Sprite));
        }
        else {
            icon.active = false;
        }
        block.node.getChildByName('guide').active = block.isGuide;
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

        let gameGrids: number[][] = [];//new Array(GameConstant.Row).fill(0).map(() => new Array(GameConstant.Col).fill(0));
        let blockGrid: BlockType[][] = new Array(GameConstant.Row).fill(0).map(() => new Array(GameConstant.Col).fill(0));
        let guides: number[][] = [];
        for (let i = 0; i < GameConstant.Row; i++) {
            let arr = [];
            for (let j = 0; j < GameConstant.Col; j++) {
                let blockType = this._blockGrid[j][i].blockType;
                blockGrid[i][GameConstant.Col - j - 1] = blockType;

                let block = this._blockGrid[i][j];
                arr.push(block.blockGridType);
                if (block.isGuide) {
                    guides.push([block.blockGridID.x, block.blockGridID.y]);
                }
            }
            gameGrids.push(arr);
        }

        let config: LevelConfig = {
            lvID: parseInt(this.levelEditBox.string),
            totalSteps: parseInt(this.stepsEditBox.string),
            target: {
                type: 1,
                value: this._getTargetsData()
            },
            blockTypes: [1, 2, 3, 4],
            gameGrid: gameGrids,
            blockGrid: blockGrid,
            guideBlocks: guides,
            fullStar: parseInt(this.fullStarsEditBox.string),
            mapId: parseInt(this.mapEditBox.string),
            rewards: this._getRewardData(),
            starCount: -1,
            score: 0
        }
        let success = this.updateLevelConfigs(config);
        if (success) {
            this.downloadFile();
        }
    }

    onRandomBlockType() {
        this.setAllBlockType(null);
    }

    onClearBlockType() {
        this.setAllBlockType(null, true);
    }

    onCheckLevel() {
        if (this.checkLevelEditBox.string === '') {
            this.commonTips.setTips('请输入关卡ID');
            return;
        }
        let level = this.getLevelConfigByID(parseInt(this.checkLevelEditBox.string));
        if (level) {
            this.fillLevelData(level);
        }
    }

    public getLevelConfigByID(id: number): LevelConfig {
        if (!this._levelConfigJson) {
            this.commonTips.setTips('请先选择关卡文件');
            return null;
        }
        for (let o of this._levelConfigJson) {
            if (o.lvID === id) {
                return o;
            }
        }
        this.commonTips.setTips('关卡不存在');
        return null;
    }

    public updateLevelConfigs(levelConfig: LevelConfig): boolean {
        if (!this._levelConfigJson) {
            this.commonTips.setTips('请先选择关卡文件');
            return false;
        }
        let isUpdate = false;
        for (let i = 0; i < this._levelConfigJson.length; i++) {
            let level = this._levelConfigJson[i];
            if (level.lvID === levelConfig.lvID && level.mapId === levelConfig.mapId) {
                this._levelConfigJson[i] = levelConfig;
                isUpdate = true;
                break;
            }
        }
        if (!isUpdate) {
            this._levelConfigJson.push(levelConfig);
        }
        this._levelConfigJson.sort((a, b) => a.lvID - b.lvID);
        return true;
    }

    public fillLevelData(level: LevelConfig) {
        this.mapEditBox.string = level ? level.mapId.toString() : '';
        this.levelEditBox.string = level ? level.lvID.toString() : '';
        this.stepsEditBox.string = level ? level.totalSteps.toString() : '';
        this.fullStarsEditBox.string = level ? level.fullStar.toString() : '';

        if (!level) {
            this.targetEditBox.string = '';
            this.rewardEditBox.string = '';
            this.setAllBlockType(null, true);
        }
        else {
            this.updateTargetEditbox(level.target.value);
            this.updateRewardEditbox(level.rewards);
            if (level.blockGrid) {
                this.setAllBlockType(level);
            }
            else {
                this.setAllBlockType(null, true);
            }
        }
    }

    public setAllBlockType(level: LevelConfig, isClear: boolean = false) {
        let blockGrid = null;
        let guideBlocks = null;
        if (level && level.blockGrid && !isClear) {
            blockGrid = new Array(GameConstant.Row).fill(0).map(() => new Array(GameConstant.Col).fill(0));
            for (let i = 0; i < GameConstant.Col; i++) {
                for (let j = 0; j < GameConstant.Row; j++) {
                    let blockType = level.blockGrid[i][j];
                    blockGrid[GameConstant.Row - j - 1][i] = blockType;
                }
            }
        }
        if (level && level.guideBlocks && !isClear) {
            guideBlocks = level.guideBlocks;
        }
        for (let i = 0; i < GameConstant.Row; i++) {
            for (let j = 0; j < GameConstant.Col; j++) {
                let block = this._blockGrid[i][j];
                block.isGuide = false;
                if (guideBlocks) {
                    for (let k = 0; k < guideBlocks.length; k++) {
                        if (guideBlocks[k][0] === block.blockGridID.x && guideBlocks[k][1] === block.blockGridID.y) {
                            block.isGuide = true;
                            break;
                        }
                    }
                }
                if (isClear) {
                    block.blockType = BlockType.INVALID;
                }
                else {
                    block.blockType = (blockGrid && blockGrid[i] && blockGrid[i][j]) ? blockGrid[i][j] : randomRangeInt(BlockType.Type1, BlockType.End);
                }
                this.updateBlock(block);
            }
        }
    }

    onSelectFile() {
        this.selectFileInput();
    }

    selectFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        input.style.display = 'none'; // 隐藏元素

        // 监听文件选择变化
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                this._selectFile = target.files[0];
                console.log(`用户选择了文件: ${this._selectFile.name}`);
                this.readFileContent(this._selectFile);
            }
            // 清理 DOM，防止重复添加
            document.body.removeChild(input);
        };

        document.body.appendChild(input);
        input.click(); // 模拟点击，弹出系统对话框
    }

    readFileContent(file: File) {
        const reader = new FileReader();
        reader.readAsText(file); // 读取为文本 (json, txt等)
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // 如果是 JSON，可以解析
            try {
                const json = JSON.parse(text);
                this._levelConfigJson = json;
                console.log("解析后的JSON:", json);
                this.selectFileLabel.string = '文件已选择';
                this.selectFileLabel.node.parent.getComponent(Sprite).color = Color.GREEN;
            } catch (err) {
                console.log("不是 JSON 文件，纯文本内容如上");
            }
        };

        reader.onerror = () => {
            console.error("文件读取失败");
        };
    }

    downloadFile() {
        let str = JSON.stringify(this._levelConfigJson, null, 4);
        let fileName = this._selectFile.name;
        const blob = new Blob([str], { type: this._selectFile.type });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // 浏览器会询问用户保存位置，或使用默认下载目录

        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    onDelete() {
        if (!this._levelConfigJson) {
            this.commonTips.setTips('请先选择文件');
            return;
        }
        if (this.levelEditBox.string === '') {
            this.commonTips.setTips('请输入关卡ID');
            return;
        }
        let levelID = parseInt(this.levelEditBox.string);
        for (let i = 0; i < this._levelConfigJson.length; i++) {
            if (this._levelConfigJson[i].lvID === levelID) {
                this._levelConfigJson.splice(i, 1);
                this.commonTips.setTips('删除成功');
                this.fillLevelData(null);
                break;
            }
        }
    }

    public updateTargetEditbox(targets: TargetValue[]) {
        if (!targets || targets.length === 0) {
            this.targetEditBox.string = '';
        }
        else {
            let targetStr = '';
            for (let i = 0; i < targets.length; i++) {
                let target = targets[i];
                targetStr += `${target.blockType},${target.count}${i === targets.length - 1 ? '' : '|'}`;
            }
            this.targetEditBox.string = targetStr;
        }
    }

    onSelectTarget() {
        this.setTargetPanel.showPanel(this._getTargetsData(), this);
    }

    private _getTargetsData() {
        let targetVal: TargetValue[] = [];
        if (this.targetEditBox.string !== '') {
            let targetArr = this.targetEditBox.string.split('|');
            for (let i = 0; i < targetArr.length; i++) {
                let target = targetArr[i].split(',');
                targetVal.push({ blockType: parseInt(target[0]), count: parseInt(target[1]) });
            }
        }
        return targetVal;
    }

    public updateRewardEditbox(rewards: Reward[]) {
        if (!rewards || rewards.length === 0) {
            this.rewardEditBox.string = '';
        }
        else {
            let rewardStr = '';
            for (let i = 0; i < rewards.length; i++) {
                let reward = rewards[i];
                rewardStr += `${reward.type},${reward.count}${i === rewards.length - 1 ? '' : '|'}`;
            }
            this.rewardEditBox.string = rewardStr;
        }
    }

    onSelectReward() {
        this.setRewardPanel.showPanel(this._getRewardData(), this);
    }

    private _getRewardData() {
        let rewards: Reward[] = [];
        if (this.rewardEditBox.string !== '') {
            let rewardArr = this.rewardEditBox.string.split('|');
            for (let i = 0; i < rewardArr.length; i++) {
                let reward = rewardArr[i].split(',');
                rewards.push({ type: parseInt(reward[0]), count: parseInt(reward[1]) });
            }
        }
        return rewards;
    }
}