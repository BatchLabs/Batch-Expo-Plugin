package expo.modules.batch

import android.app.Application
import android.util.Log
import com.batch.batch_rn.RNBatchModuleImpl
import expo.modules.core.interfaces.ApplicationLifecycleListener

class BatchExpoApplicationLifecycleListener : ApplicationLifecycleListener {

    override fun onCreate(application: Application) {
        RNBatchModuleImpl.initialize(application);
    }
}
