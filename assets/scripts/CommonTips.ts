import { _decorator, Component, Label, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CommonTips')
export class CommonTips extends Component {
    @property(Label)
    tipsLabel: Label = null;
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;  // 透明度组件

    private _doAnimation() {
        this.node.scale = v3(0, 0, 0)
        const pos = this.node.getPosition()
        // 播放提示文本的动画
        tween(this.node)
            .to(0.3, { scale: Vec3.ONE }, { easing: "elasticOut" })
            .delay(0.8)
            .parallel( // 同时执行透明度变化
                tween(this.node).to(0.5, { position: v3(0, pos.y + 300, 0) }),
                tween(this.uiOpacity)
                    .to(0.5, { opacity: 0 }) // 逐渐变透明
            )
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    public setTips(tips: string) {
        this.node.setPosition(v3(0, 0, 0));
        this.node.active = true;
        this.uiOpacity.opacity = 255;
        this.tipsLabel.string = tips;
        this._doAnimation()
    }
}


