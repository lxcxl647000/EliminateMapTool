import { _decorator, Component, EditBox, Node } from 'cc';
import { BlockType, RewardType } from './GameConstant';
import { GamePanel, Reward } from './GamePanel';
const { ccclass, property } = _decorator;

@ccclass('SetRewardPanel')
export class SetRewardPanel extends Component {
    @property(Node)
    layoutNode: Node = null!

    private _rewards: Reward[] = [];
    private _gamePanel: GamePanel = null!

    public showPanel(rewards: Reward[], gamePanel: GamePanel) {
        this._gamePanel = gamePanel;
        this._rewards = rewards;
        this.node.active = true;
        this._initData();
    }

    private _initData() {
        for (let target of this.layoutNode.children) {
            if (target['rewardType'] === undefined) {
                target['rewardType'] = this._getRewardTypeByName(target.name);
            }
            let count = this._getTargetCount(target['rewardType']);
            target.getComponentInChildren(EditBox).string = count === 0 ? '' : count.toString();
        }
    }

    private _getTargetCount(type: RewardType) {
        if (this._rewards.length > 0) {
            for (let t of this._rewards) {
                if (t.type === type) {
                    return t.count;
                }
            }
        }
        return 0;
    }

    private _setTargetCount(type: RewardType, count: number) {
        if (this._rewards.length > 0) {
            let isUpdate = false;
            for (let t of this._rewards) {
                if (t.type === type) {
                    if (count > 0) {
                        t.count = count;
                    }
                    else {
                        let index = this._rewards.indexOf(t);
                        this._rewards.splice(index, 1);
                    }
                    isUpdate = true;
                    break;
                }
            }
            if (!isUpdate && count > 0) {
                this._rewards.push({ type, count });
            }
        }
        else if (count > 0) {
            this._rewards.push({ type, count });
        }
    }

    // 和面板节点名字相对应
    private _getRewardTypeByName(nodeName: string) {
        let type = RewardType.Gold;
        switch (nodeName) {
            case 'gold':
                type = RewardType.Gold;
                break;
            case 'hammer':
                type = RewardType.Hammer;
                break;
            case 'energy':
                type = RewardType.Energy;
                break;
            case 'boom':
                type = RewardType.Boom;
                break;
            case 'chips':
                type = RewardType.Theme_Clips;
                break;
            case 'steps':
                type = RewardType.Steps;
                break;
            case 'sort':
                type = RewardType.Sort;
                break;
        }
        return type;
    }

    onClose() {
        this._rewards = [];
        this.node.active = false;
    }

    onOk() {
        for (let reward of this.layoutNode.children) {
            let count = reward.getComponentInChildren(EditBox).string === '' ? 0 : parseInt(reward.getComponentInChildren(EditBox).string);
            let type = reward['rewardType'];
            this._setTargetCount(type, count);
        }
        this._gamePanel.updateRewardEditbox(this._rewards);
        this.onClose();
    }
}