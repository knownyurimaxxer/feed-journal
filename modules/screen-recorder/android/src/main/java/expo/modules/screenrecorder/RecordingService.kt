package expo.modules.screenrecorder

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * Android only lets an app record the screen while a foreground service with a
 * notification is running. This is that service; the recording itself is done by [Recorder].
 */
class RecordingService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL, "Screen recording", NotificationManager.IMPORTANCE_LOW)
      )
    }
    val notification: Notification = NotificationCompat.Builder(this, CHANNEL)
      .setSmallIcon(android.R.drawable.presence_video_online)
      .setContentTitle("Recording the screen")
      .setOngoing(true)
      .build()
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)
    // The projection may only be created once the service is in the foreground.
    Recorder.startNow(this)
    return START_NOT_STICKY
  }

  companion object {
    private const val CHANNEL = "screen-recording"
    private const val NOTIFICATION_ID = 7732
  }
}
