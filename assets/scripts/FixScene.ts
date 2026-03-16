import { _decorator, Component, view, ResolutionPolicy } from 'cc';
const { ccclass } = _decorator;

@ccclass('FixScene')
export class FixScene extends Component {
    protected onLoad(): void {
        const visibleSize = view.getVisibleSize();
        const designRatio = 720 / 1280;
        const screenRatio = visibleSize.width / visibleSize.height;

        if (screenRatio < designRatio) {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}