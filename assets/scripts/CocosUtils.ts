import { Asset, AssetManager, assetManager, ImageAsset, Node, Sprite, SpriteFrame, Texture2D, tween, UITransform, Vec3 } from "cc";
import AssetLoader from "./AssetLoader";

export default class CocosUtils {
    static spriteFrameMap: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();

    /**
     * 通过目标节点的世界坐标转换成需要设置的节点的ui坐标
     * @param node 
     * @param target 
     * @returns 
     */
    public static setNodeToTargetPos(node: Node, target: Node): Vec3 {
        let pos = new Vec3(0, 0, 0);
        if (!node || !target || !node.parent) {
            return pos;
        }
        let targetUITransform = target.getComponent(UITransform);
        if (!targetUITransform) {
            return pos;
        }
        let nodeParentUITransform = node.parent.getComponent(UITransform);
        if (!nodeParentUITransform) {
            return pos;
        }
        let targetWorldPos = targetUITransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        pos = nodeParentUITransform.convertToNodeSpaceAR(targetWorldPos);
        return pos;
    }

    /**
     * 加载远程图片
     * @param url 
     * @param sprite 
     */
    public static loadRemoteTexture(url: string, sprite: Sprite, ext: string = '') {
        assetManager.loadRemote<ImageAsset>(url, { ext }, function (err, imageAsset) {
            if (err) {
                console.log(err);
                return;
            }
            CocosUtils.setImageAsset(imageAsset, sprite);
        });
    }

    /**
     * 从自定义bundle里动态加载图片
     * @param bundleName 
     * @param path 
     * @param sprite 
     */
    public static loadTextureFromBundle(bundleName: string, path: string, sprite: Sprite, cb?: Function) {
        CocosUtils.loadFromBundle<ImageAsset>(bundleName, path, Asset).then((imageAsset: ImageAsset) => {
            if (imageAsset) {
                const spriteFrame = new SpriteFrame();
                let texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                sprite.spriteFrame = spriteFrame;
                // CocosUtils.setImageAsset(imageAsset, sprite);
                cb && cb();
            }
        });
    }

    static setImageAsset(imageAsset: ImageAsset, sprite: Sprite) {
        if (imageAsset) {
            let isSameTex = false;
            if (sprite && sprite.spriteFrame && sprite.spriteFrame.texture) {
                let tex = sprite.spriteFrame.texture as Texture2D;
                if (sprite.spriteFrame.packable) {
                    tex = sprite.spriteFrame.original?._texture as Texture2D;
                }
                if (tex && tex.image) {
                    isSameTex = tex.image.uuid === imageAsset.uuid;
                    if (!isSameTex) {
                        CocosUtils.releaseTexture(sprite);
                    }
                }
            }
            let isNewSpriteFrame = false;
            let spriteFrame = CocosUtils.spriteFrameMap.get(imageAsset.uuid);
            if (!spriteFrame) {
                isNewSpriteFrame = true;
                spriteFrame = new SpriteFrame();
                let texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
            }
            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
            if (!isSameTex || isNewSpriteFrame) {
                spriteFrame.addRef();
            }
            CocosUtils.spriteFrameMap.set(imageAsset.uuid, spriteFrame);
        }
    }

    public static releaseTexture(sprite: Sprite) {
        if (sprite && sprite.spriteFrame) {
            let spriteFrame = sprite.spriteFrame;
            spriteFrame.decRef();
            if (spriteFrame.refCount <= 0) {
                let texture = spriteFrame.texture as Texture2D;
                // 如果已加入动态合图，必须取原始的Texture2D
                if (spriteFrame.packable) {
                    texture = spriteFrame.original?._texture as Texture2D;
                }
                if (texture) {
                    let imageAsset = texture.image;
                    if (imageAsset) {
                        CocosUtils.spriteFrameMap.delete(imageAsset.uuid);
                        imageAsset.decRef();
                    }
                    texture.destroy();
                }
                spriteFrame.destroy();
            }
            sprite.spriteFrame = null;
        }
    }

    public static loadFromBundle<T extends Asset>(bundleName: string, path: string, type: typeof Asset): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            let loadBundle = (bundle: AssetManager.Bundle) => {
                bundle.load(path, type, (error: Error, resLoad: T) => {
                    error ? resolve(null) : resolve(resLoad);
                });
            };
            let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
            if (bundle == null) {
                AssetLoader.loadBundle(bundleName).then((bundle: AssetManager.Bundle) => {
                    loadBundle(bundle);
                })
            } else {
                loadBundle(bundle);
            }
        });
    }

    // 打开弹窗动画
    public static openPopAnimation(totalNode: Node, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                totalNode.setScale(0.3, 0.3);
                tween(totalNode)
                    .to(5 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                    .to(4 / 30, { scale: new Vec3(.95, .95, 1) }, { easing: 'sineInOut' })
                    .to(4 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }

    // 关闭弹窗动画
    public static closePopAnimation(totalNode: Node, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                tween(totalNode)
                    .to(5 / 30, { scale: Vec3.ZERO }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }
}