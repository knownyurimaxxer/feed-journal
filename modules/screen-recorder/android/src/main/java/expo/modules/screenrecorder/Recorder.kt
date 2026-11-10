package expo.modules.screenrecorder

import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.MediaCodecList
import android.media.MediaRecorder
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import java.io.File
import kotlin.math.max
import kotlin.math.min

/** Records the screen to an .mp4 with the system's MediaProjection and MediaRecorder. */
object Recorder {
  class StartArgs(val codec: String, val bitrate: Int, val fps: Int, val promise: Promise)

  private class Launch(val resultCode: Int, val data: Intent, val args: StartArgs)

  @Volatile var isRecording = false
    private set

  private var launch: Launch? = null
  private var projection: MediaProjection? = null
  private var recorder: MediaRecorder? = null
  private var display: VirtualDisplay? = null
  private var file: File? = null
  private var result: String? = null // the finished file, kept until stop() asks for it

  fun supportedCodecs(): List<String> {
    val list = mutableListOf("h264")
    if (hasEncoder("video/hevc")) list.add("hevc")
    return list
  }

  private fun hasEncoder(mime: String): Boolean =
    MediaCodecList(MediaCodecList.REGULAR_CODECS).codecInfos.any { info ->
      info.isEncoder && info.supportedTypes.any { it.equals(mime, ignoreCase = true) }
    }

  /** Permission was given: start the foreground service, which calls [startNow]. */
  fun begin(context: Context, resultCode: Int, data: Intent, args: StartArgs) {
    launch = Launch(resultCode, data, args)
    result = null
    ContextCompat.startForegroundService(context, Intent(context, RecordingService::class.java))
  }

  fun startNow(service: Service) {
    val current = launch ?: return
    launch = null
    val args = current.args
    try {
      val manager = service.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
      val proj = manager.getMediaProjection(current.resultCode, current.data)

      // Screen size, even numbers, longest side at most 1920 (what encoders handle everywhere).
      val metrics = service.resources.displayMetrics
      val scale = min(1f, 1920f / max(metrics.widthPixels, metrics.heightPixels))
      val width = (metrics.widthPixels * scale).toInt() and 1.inv()
      val height = (metrics.heightPixels * scale).toInt() and 1.inv()

      val useHevc = args.codec == "hevc" && hasEncoder("video/hevc")
      val out = File(service.cacheDir, "rec-${System.currentTimeMillis()}.mp4")
      val mr = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        MediaRecorder(service)
      } else {
        @Suppress("DEPRECATION") MediaRecorder()
      }
      mr.setVideoSource(MediaRecorder.VideoSource.SURFACE)
      mr.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
      mr.setVideoEncoder(if (useHevc) MediaRecorder.VideoEncoder.HEVC else MediaRecorder.VideoEncoder.H264)
      mr.setVideoSize(width, height)
      mr.setVideoFrameRate(args.fps)
      mr.setVideoEncodingBitRate(args.bitrate)
      mr.setOutputFile(out.absolutePath)
      mr.prepare()

      // Required from Android 14, and the way to hear that the system ended the recording.
      proj.registerCallback(object : MediaProjection.Callback() {
        override fun onStop() {
          finish(service)
        }
      }, Handler(Looper.getMainLooper()))

      display = proj.createVirtualDisplay(
        "ScreenRecorder", width, height, metrics.densityDpi,
        DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, mr.surface, null, null,
      )
      mr.start()

      projection = proj
      recorder = mr
      file = out
      isRecording = true
      args.promise.resolve(if (useHevc) "hevc" else "h264")
    } catch (e: Exception) {
      cleanup()
      service.stopSelf()
      args.promise.reject("ERR_RECORD_START", e.message ?: "Could not start recording", e)
    }
  }

  /** Stops recording; the result is the file, or null when it was too short to keep. */
  private fun finish(context: Context) {
    if (!isRecording) return
    isRecording = false
    var kept = true
    try {
      recorder?.stop()
    } catch (e: RuntimeException) {
      kept = false // stopped right after starting: the file is empty
    }
    val out = file
    cleanup()
    if (!kept) out?.delete()
    result = if (kept && out != null) "file://" + out.absolutePath else null
    context.stopService(Intent(context, RecordingService::class.java))
  }

  fun stop(context: Context, promise: Promise) {
    finish(context)
    val path = result
    result = null
    promise.resolve(path)
  }

  private fun cleanup() {
    try { recorder?.release() } catch (_: Exception) {}
    try { display?.release() } catch (_: Exception) {}
    try { projection?.stop() } catch (_: Exception) {}
    recorder = null
    display = null
    projection = null
    file = null
  }
}
