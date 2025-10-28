import ExpoModulesCore
import RNBatchPush

public class ExpoBatchAppDelegate: ExpoAppDelegateSubscriber {

    public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        RNBatch.start()
        return true
    }
}
