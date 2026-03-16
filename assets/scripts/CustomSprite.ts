import { _decorator, CCInteger, Component, Sprite, SpriteFrame } from "cc";

const { ccclass, property } = _decorator;
@ccclass
export default class CustomSprite extends Component {

    @property([SpriteFrame])
    spriteFrame: SpriteFrame[] = [];

    _index: number = 0;
    @property({
        type: CCInteger,
        range: [0, 10],
    })

    public set index(idx: number) {
        if (!this.spriteFrame[idx]) {
            idx = -1;
        }
        this._index = idx;
        this.node.getComponent(Sprite).spriteFrame = this.spriteFrame[idx];
        
    }

    public get index(): number {
        return this._index;
    }

}
