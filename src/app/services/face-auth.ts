// src/app/services/face-auth.service.ts
import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
providedIn: 'root'
})
export class FaceAuthService {
private modelsLoaded = false;
// ✅ Apunta al backend Express
private readonly MODEL_URL = 'http://localhost:3000/models';

async loadModels(): Promise<void> {
  if (this.modelsLoaded) return;

  console.log('⏳ Cargando modelos desde:', this.MODEL_URL);

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
  ]);

  this.modelsLoaded = true;
  console.log('✅ Modelos face-api.js cargados correctamente');
}

async detectFace(element: HTMLCanvasElement | HTMLVideoElement): Promise<Float32Array | null> {
  await this.loadModels();

  const detection = await faceapi
    .detectSingleFace(element)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return detection.descriptor;
}

verifyFaces(descriptor1: Float32Array, descriptor2: Float32Array): boolean {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  console.log('📏 Distancia facial:', distance);
  // Menor a 0.5 = misma persona
  return distance < 0.5;
}

descriptorToString(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

stringToDescriptor(str: string): Float32Array {
  return new Float32Array(JSON.parse(str));
}
}