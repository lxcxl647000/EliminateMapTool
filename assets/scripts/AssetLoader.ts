import { assetManager, AssetManager } from "cc";
export default class AssetLoader {
    static loadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName, (error: Error, bundle: AssetManager.Bundle) => {
                error ? reject(error) : resolve(bundle);
            });
        });
    }
}
