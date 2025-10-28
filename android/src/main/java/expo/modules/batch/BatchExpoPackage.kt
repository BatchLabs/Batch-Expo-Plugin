package expo.modules.batch

import android.content.Context
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class BatchExpoPackage : Package {
    override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> {
        return listOf(BatchExpoActivityLifecycleListener())
    }

    override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
        return listOf(BatchExpoApplicationLifecycleListener())
    }
}
