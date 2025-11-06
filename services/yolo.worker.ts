/// <reference lib="webworker" />
import { PartnerPreference } from '../types';

// These are loaded from the script tags in index.html, but in a worker we must use importScripts.
// TypeScript doesn't know about these global variables from the scripts, so we declare them.
declare var cocoSsd: any;
declare var tf: any;

let model: any = null;

async function loadModel() {
    try {
        // In a worker, you must use importScripts to load external libraries.
        importScripts(
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js',
            'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js'
        );

        await tf.setBackend('wasm');
        await tf.ready();
        model = await cocoSsd.load();
        
        // Post a message back to the main thread that the model is ready
        self.postMessage({ type: 'ready' });
    } catch (error) {
        console.error("Worker: Failed to load COCO-SSD model:", error);
        self.postMessage({ type: 'error', error: (error as Error).message });
    }
}

self.onmessage = async (event: MessageEvent<{ imageBitmap: ImageBitmap, requestId: number }>) => {
    if (!model) {
        console.warn("Worker: Model not loaded yet, received message ignored.");
        return;
    }
    
    const { imageBitmap, requestId } = event.data;

    try {
        const predictions = await model.detect(imageBitmap);
        // We no longer need the bitmap, so close it to free up memory.
        imageBitmap.close();

        const personPrediction = predictions.find((p: any) => p.class === 'person' && p.score > 0.6);
        let result: PartnerPreference.Male | PartnerPreference.Female | null = null;
        
        if (personPrediction) {
            // =======================================================================
            // IMPORTANT: COCO-SSD does not detect gender. This is a simulation.
            // =======================================================================
            result = Math.random() > 0.5 ? PartnerPreference.Male : PartnerPreference.Female;
        }
        
        self.postMessage({ type: 'result', payload: result, requestId });

    } catch (error) {
        console.error("Worker: Error during object detection:", error);
        self.postMessage({ type: 'error', error: `Detection failed: ${(error as Error).message}`, requestId });
    }
};

// Start loading the model as soon as the worker is created.
loadModel();
