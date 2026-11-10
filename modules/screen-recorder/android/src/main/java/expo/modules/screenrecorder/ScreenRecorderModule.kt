package expo.modules.screenrecorder

import android.app.Activity
import android.content.Context
import android.media.projection.MediaProjectionManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val REQUEST_CODE = 7731

class ScreenRecorderModule : Module() {
  private var pending: Recorder.StartArgs? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenRecorder")

    Function("supportedCodecs") { Recorder.supportedCodecs() }

    // The system asks the person "Start recording?"; the answer comes back in OnActivityResult.
    AsyncFunction("start") { codec: String, bitrate: Int, fps: Int, promise: Promise ->
      if (Recorder.isRecording || pending != null) {
        throw CodedException("ERR_ALREADY_RECORDING", "Already recording", null)
      }
      val activity = appContext.throwingActivity
      pending = Recorder.StartArgs(codec, bitrate, fps, promise)
      val manager = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
      activity.startActivityForResult(manager.createScreenCaptureIntent(), REQUEST_CODE)
    }

    AsyncFunction("stop") { promise: Promise ->
      Recorder.stop(context, promise)
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode != REQUEST_CODE) return@OnActivityResult
      val args = pending ?: return@OnActivityResult
      pending = null
      val data = payload.data
      if (payload.resultCode != Activity.RESULT_OK || data == null) {
        args.promise.reject("ERR_PERMISSION_DENIED", "Screen recording was not allowed", null)
        return@OnActivityResult
      }
      Recorder.begin(context, payload.resultCode, data, args)
    }
  }

  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("ERR_NO_CONTEXT", "No app context", null)
}
