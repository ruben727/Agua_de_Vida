// src/app/auth/face-capture/face-capture.ts
import {
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { FaceAuthService } from '../../services/face-auth';

@Component({
  selector: 'app-face-capture',
  templateUrl: './face-capture.html',
  styleUrls: ['./face-capture.css']
})
export class FaceCapture {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  @Input() mode: 'register' | 'verify' = 'verify';

  @Output() faceCaptured = new EventEmitter<{
    descriptor: Float32Array;
    imageBase64: string;
  }>();
  @Output() error = new EventEmitter<string>();

  isCameraActive = false;
  isProcessing = false;
  message = '';

  constructor(private faceAuthService: FaceAuthService) {}

  async startCamera(): Promise<void> {
    try {
      // Precarga modelos en paralelo mientras abre la cámara
      this.faceAuthService.loadModels().catch(err => {
        console.warn('⚠️ Error precargando modelos:', err);
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      this.videoElement.nativeElement.srcObject = stream;
      this.isCameraActive = true;
      this.message = '📷 Posiciónate frente a la cámara';

    } catch (err) {
      this.message = '❌ No se pudo acceder a la cámara';
      this.error.emit('No se pudo acceder a la cámara');
      console.error('Error cámara:', err);
    }
  }

  stopCamera(): void {
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.nativeElement.srcObject = null;
    }
    this.isCameraActive = false;
    this.message = '';
  }

  async captureImage(): Promise<void> {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Dibuja el frame actual del video en el canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Guarda el base64 para emitirlo
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

    this.isProcessing = true;
    this.message = '🔍 Analizando rostro...';

    try {
      // ✅ Pasa el HTMLCanvasElement directamente a face-api.js
      const descriptor = await this.faceAuthService.detectFace(canvas);

      this.isProcessing = false;

      if (descriptor) {
        this.message = '✅ Rostro detectado correctamente';
        this.faceCaptured.emit({ descriptor, imageBase64 });
        setTimeout(() => this.stopCamera(), 2000);
      } else {
        this.message = '❌ No se detectó ningún rostro. Intenta de nuevo.';
        this.error.emit('No se detectó rostro');
      }

    } catch (err) {
      this.isProcessing = false;
      this.message = '❌ Error al procesar el rostro';
      this.error.emit('Error en reconocimiento facial');
      console.error('Error face-api:', err);
    }
  }
}
