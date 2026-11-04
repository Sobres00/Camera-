export const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.apex.rawcamera">

    <!-- PERMISOS DE CÁMARA Y SENSOR MANUAL TOTAL -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.camera.level.full" android:required="false" />
    <uses-feature android:name="android.hardware.camera.capability.raw" android:required="false" />

    <!-- AUDIO PARA VIDEO SIN COMPRESIÓN -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- ALMACENAMIENTO Y EXPORTACIÓN DE FOTOS RAW/DNG/TIFF -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" tools:ignore="ScopedStorage" />

    <!-- SEGUNDO PLANO Y PROCESAMIENTO SEGURO (ANTI FORCE-CLOSE) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- VENTANA FLOTANTE Y SOBRE OTRAS APPS -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- HÁPTICA Y SENSORES DE HORIZONTE -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-feature android:name="android.hardware.sensor.accelerometer" android:required="false" />
    <uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Apex RAW Camera"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ApexCamera"
        android:hardwareAccelerated="true"
        android:largeHeap="true">

        <!-- ACTIVIDAD PRINCIPAL CONFIGURADA COMO CÁMARA PREDETERMINADA DEL SISTEMA -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:screenOrientation="portrait"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:resizeableActivity="true"
            android:supportsPictureInPicture="true">

            <!-- Lanzador tradicional -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- CÁMARA PREDETERMINADA DEL SISTEMA (Doble clic al botón de encendido) -->
            <intent-filter>
                <action android:name="android.media.action.STILL_IMAGE_CAMERA" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>

            <!-- CÁMARA CON PANTALLA BLOQUEADA -->
            <intent-filter>
                <action android:name="android.media.action.STILL_IMAGE_CAMERA_SECURE" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>

            <!-- INTENT DE DISPARO EXTERNO (Otras apps que piden foto) -->
            <intent-filter>
                <action android:name="android.media.action.IMAGE_CAPTURE" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- SERVICIO EN SEGUNDO PLANO PARA PROCESAMIENTO RAW Y COLA DE GUARDADO -->
        <service
            android:name=".service.RawProcessingService"
            android:foregroundServiceType="camera"
            android:exported="false" />

    </application>
</manifest>`;

export const CAMERA2_RAW_SERVICE_KT = `package com.apex.rawcamera.camera

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.ImageFormat
import android.hardware.camera2.*
import android.hardware.camera2.params.MeteringRectangle
import android.media.DngCreator
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Range
import android.view.Surface
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer

/**
 * Servicio Nativo de Cámara con Camera2 API y DngCreator
 * Permite control manual total sin compresión y bypass de reducción de ruido
 */
class Camera2RawService(private val context: Context) {

    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null

    private var backgroundThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null

    private var rawImageReader: ImageReader? = null
    private var previewRequestBuilder: CaptureRequest.Builder? = null
    private var cameraCharacteristics: CameraCharacteristics? = null

    // Estados expuestos a la interfaz de usuario
    val isoRange = MutableStateFlow<Range<Int>>(Range(50, 6400))
    val exposureTimeRange = MutableStateFlow<Range<Long>>(Range(100_000L, 30_000_000_000L)) // 1/10000s a 30s
    val supportsRaw = MutableStateFlow(false)
    val isSilentMode = MutableStateFlow(true) // Cero sonido del obturador

    // Ajustes manuales actuales
    private var currentIso: Int = 100
    private var currentExposureTimeNs: Long = 2_000_000L // 1/500s
    private var currentFocusDistance: Float = 0.0f // 0 = infinito, valores más altos = macro
    private var isManualMode: Boolean = true

    fun startBackgroundThread() {
        backgroundThread = HandlerThread("CameraBackgroundThread").also { it.start() }
        backgroundHandler = Handler(backgroundThread!!.looper)
    }

    fun stopBackgroundThread() {
        backgroundThread?.quitSafely()
        try {
            backgroundThread?.join()
            backgroundThread = null
            backgroundHandler = null
        } catch (e: InterruptedException) {
            Log.e("Camera2RawService", "Error deteniendo hilo de cámara", e)
        }
    }

    @SuppressLint("MissingPermission")
    fun openCamera(cameraId: String, previewSurface: Surface, onReady: () -> Unit) {
        startBackgroundThread()
        val characteristics = cameraManager.getCameraCharacteristics(cameraId)
        this.cameraCharacteristics = characteristics

        // Verificar soporte de RAW DNG en hardware
        val capabilities = characteristics.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES) ?: intArrayOf()
        val hasRaw = capabilities.contains(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES_RAW)
        supportsRaw.value = hasRaw

        // Obtener rangos físicos del sensor
        characteristics.get(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)?.let {
            isoRange.value = it
        }
        characteristics.get(CameraCharacteristics.SENSOR_INFO_EXPOSURE_TIME_RANGE)?.let {
            exposureTimeRange.value = it
        }

        // Configurar lector RAW para el tamaño máximo nativo del sensor (hasta 108MP o 200MP sin compresión)
        val maxMap = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP_MAXIMUM_RESOLUTION)
                ?: characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
        } else {
            characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
        }

        val rawSizes = maxMap?.getOutputSizes(ImageFormat.RAW_SENSOR)
        val largestRawSize = rawSizes?.maxByOrNull { it.width * it.height }

        if (largestRawSize != null) {
            rawImageReader = ImageReader.newInstance(
                largestRawSize.width,
                largestRawSize.height,
                ImageFormat.RAW_SENSOR,
                3
            ).apply {
                setOnImageAvailableListener({ reader ->
                    // Procesar y guardar el buffer DNG en segundo plano
                    val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
                    backgroundHandler?.post {
                        saveRawDng(image, characteristics)
                    }
                }, backgroundHandler)
            }
        }

        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                createCaptureSession(previewSurface, onReady)
            }

            override fun onDisconnected(camera: CameraDevice) {
                camera.close()
                cameraDevice = null
            }

            override fun onError(camera: CameraDevice, error: Int) {
                Log.e("Camera2RawService", "Error abriendo cámara: $error")
                camera.close()
                cameraDevice = null
            }
        }, backgroundHandler)
    }

    private fun createCaptureSession(previewSurface: Surface, onReady: () -> Unit) {
        val targets = mutableListOf(previewSurface)
        rawImageReader?.surface?.let { targets.add(it) }

        cameraDevice?.createCaptureSession(targets, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                captureSession = session
                previewRequestBuilder = cameraDevice?.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)?.apply {
                    addTarget(previewSurface)
                    applyManualSettings(this)
                }
                previewRequestBuilder?.let {
                    session.setRepeatingRequest(it.build(), null, backgroundHandler)
                }
                onReady()
            }

            override fun onConfigureFailed(session: CameraCaptureSession) {
                Log.e("Camera2RawService", "Fallo al configurar sesión de captura")
            }
        }, backgroundHandler)
    }

    /**
     * Aplica los parámetros manuales directos al sensor de imagen
     */
    fun applyManualSettings(builder: CaptureRequest.Builder) {
        if (isManualMode) {
            // Desactivar exposición automática (AE) para control absoluto
            builder.set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_OFF)
            builder.set(CaptureRequest.SENSOR_SENSITIVITY, currentIso)
            builder.set(CaptureRequest.SENSOR_EXPOSURE_TIME, currentExposureTimeNs)

            // Control manual micrométrico de lente
            builder.set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
            builder.set(CaptureRequest.LENS_FOCUS_DISTANCE, currentFocusDistance)

            // Desactivar reducción de ruido agresiva destructiva
            builder.set(CaptureRequest.NOISE_REDUCTION_MODE, CaptureRequest.NOISE_REDUCTION_MODE_OFF)
            builder.set(CaptureRequest.EDGE_MODE, CaptureRequest.EDGE_MODE_OFF)
        } else {
            builder.set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
            builder.set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)
        }
    }

    fun setManualIso(iso: Int) {
        currentIso = iso
        isManualMode = true
        updateRepeatingRequest()
    }

    fun setManualShutterSpeedNs(shutterNs: Long) {
        currentExposureTimeNs = shutterNs
        isManualMode = true
        updateRepeatingRequest()
    }

    fun setManualFocus(distanceDiopters: Float) {
        currentFocusDistance = distanceDiopters
        isManualMode = true
        updateRepeatingRequest()
    }

    private fun updateRepeatingRequest() {
        val builder = previewRequestBuilder ?: return
        applyManualSettings(builder)
        try {
            captureSession?.setRepeatingRequest(builder.build(), null, backgroundHandler)
        } catch (e: CameraAccessException) {
            Log.e("Camera2RawService", "Error actualizando petición manual", e)
        }
    }

    /**
     * Captura en formato RAW DNG sin compresión de 14 bits
     */
    fun captureRawPhoto(outputFile: File, onSaved: (File) -> Unit) {
        val session = captureSession ?: return
        val device = cameraDevice ?: return
        val rawSurface = rawImageReader?.surface ?: return

        try {
            val captureBuilder = device.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
                addTarget(rawSurface)
                applyManualSettings(this)
                // Metadatos de calibración de lente
                set(CaptureRequest.COLOR_CORRECTION_MODE, CaptureRequest.COLOR_CORRECTION_MODE_FAST)
            }

            session.capture(captureBuilder.build(), object : CameraCaptureSession.CaptureCallback() {
                override fun onCaptureCompleted(
                    session: CameraCaptureSession,
                    request: CaptureRequest,
                    result: TotalCaptureResult
                ) {
                    lastCaptureResult = result
                }
            }, backgroundHandler)
        } catch (e: CameraAccessException) {
            Log.e("Camera2RawService", "Error en captura RAW", e)
        }
    }

    private var lastCaptureResult: TotalCaptureResult? = null

    private fun saveRawDng(image: android.media.Image, characteristics: CameraCharacteristics) {
        val result = lastCaptureResult ?: return
        val targetFile = File(context.cacheDir, "RAW_\${System.currentTimeMillis()}.dng")

        try {
            val dngCreator = DngCreator(characteristics, result)
            FileOutputStream(targetFile).use { output ->
                dngCreator.writeImage(output, image)
            }
            dngCreator.close()
            image.close()
            Log.d("Camera2RawService", "Archivo DNG guardado exitosamente: \${targetFile.length()} bytes")
        } catch (e: Exception) {
            Log.e("Camera2RawService", "Error escribiendo archivo DNG", e)
            image.close()
        }
    }

    fun closeCamera() {
        captureSession?.close()
        captureSession = null
        cameraDevice?.close()
        cameraDevice = null
        rawImageReader?.close()
        rawImageReader = null
        stopBackgroundThread()
    }
}`;

export const BUILD_GRADLE_KTS = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.apex.rawcamera"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.apex.rawcamera"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0-PRO"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // CameraX y Camera2 Extensions
    implementation("androidx.camera:camera-camera2:1.4.1")
    implementation("androidx.camera:camera-lifecycle:1.4.1")
    implementation("androidx.camera:camera-view:1.4.1")

    // Corrutinas y soporte asíncrono
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
}`;
