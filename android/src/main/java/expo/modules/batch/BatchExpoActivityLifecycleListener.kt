package expo.modules.batch

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log;
import com.batch.android.Batch
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class BatchExpoActivityLifecycleListener : ReactActivityLifecycleListener {

    private var activity: Activity? = null

    override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
        this.activity = activity
    }

    override fun onNewIntent(intent: Intent?): Boolean {
        Batch.onNewIntent(activity, intent)
        return true
    }
}
