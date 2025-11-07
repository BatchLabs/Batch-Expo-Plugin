package expo.modules.batch

import android.app.Application
import android.util.Log
import com.batch.batch_rn.RNBatchModule
import expo.modules.core.interfaces.ApplicationLifecycleListener

class BatchExpoApplicationLifecycleListener : ApplicationLifecycleListener {

    override fun onCreate(application: Application) {
        RNBatchModule.initialize(application);
    }
}
