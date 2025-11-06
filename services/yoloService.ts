import { PartnerPreference } from '../types';

type WorkerResponse = {
  type: 'ready' | 'error' | 'result';
  payload?: any;
  error?: string;
  requestId?: number;
};

class YoloService {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReadyPromise!: () => void;
  
  private requestCounter = 0;
  private pendingRequests: Map<number, (value: any) => void> = new Map();

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./yolo.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      
      this.readyPromise = new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject("Worker loading timed out"), 15000);
          this.resolveReadyPromise = () => {
              clearTimeout(timer);
              resolve();
          };
      });

    } else {
      console.error("Web Workers are not supported in this browser.");
      this.readyPromise = Promise.reject("Web Workers not supported.");
    }
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
    const { type, payload, error, requestId } = event.data;

    switch (type) {
      case 'ready':
        this.isReady = true;
        console.log("YOLO Worker is ready.");
        this.resolveReadyPromise();
        break;
      case 'error':
        console.error("Error from YOLO Worker:", error);
        if (requestId !== undefined && this.pendingRequests.has(requestId)) {
            this.pendingRequests.get(requestId)?.(null);
            this.pendingRequests.delete(requestId);
        }
        break;
      case 'result':
        if (requestId !== undefined && this.pendingRequests.has(requestId)) {
          this.pendingRequests.get(requestId)?.(payload);
          this.pendingRequests.delete(requestId);
        }
        break;
    }
  }

  loadModel(): Promise<void> {
    return this.readyPromise;
  }

  async detectGender(videoElement: HTMLVideoElement): Promise<PartnerPreference.Male | PartnerPreference.Female | null> {
    if (!this.worker || !this.isReady) {
      console.warn("YOLO Worker not ready yet, detection skipped.");
      return null;
    }

    if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
      return null;
    }

    try {
      const imageBitmap = await createImageBitmap(videoElement);
      const requestId = this.requestCounter++;
      
      const resultPromise = new Promise<PartnerPreference.Male | PartnerPreference.Female | null>((resolve) => {
        this.pendingRequests.set(requestId, resolve);
      });

      // Transfer the bitmap to the worker. This is a zero-copy operation.
      this.worker.postMessage({ imageBitmap, requestId }, [imageBitmap]);

      return resultPromise;

    } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
             console.warn("Could not create ImageBitmap from video, state is invalid.");
        } else {
            console.error("Error creating ImageBitmap or posting to worker:", error);
        }
      return null;
    }
  }
}

export const yoloService = new YoloService();
