/**
 * Connection Optimization Service
 * Handles adaptive bitrate streaming, bandwidth monitoring, and quality adjustments
 */

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';
export type QualityPreset = 'auto' | 'high' | 'medium' | 'low';

interface VideoConstraints {
  width: { ideal: number; max?: number };
  height: { ideal: number; max?: number };
  frameRate: { ideal: number; max?: number };
}

interface NetworkStats {
  latency: number;
  bandwidth: number; // kbps
  packetLoss: number; // percentage
  jitter: number;
}

class ConnectionOptimizationService {
  private currentQuality: ConnectionQuality = 'excellent';
  private qualityPreset: QualityPreset = 'auto';
  private networkStats: NetworkStats = {
    latency: 0,
    bandwidth: 0,
    packetLoss: 0,
    jitter: 0
  };
  private monitoringInterval: number | null = null;
  private qualityChangeCallbacks: ((quality: ConnectionQuality) => void)[] = [];

  // Quality presets for different connection levels
  private readonly qualityPresets = {
    high: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    },
    medium: {
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { ideal: 24, max: 30 }
    },
    low: {
      width: { ideal: 320, max: 640 },
      height: { ideal: 240, max: 480 },
      frameRate: { ideal: 15, max: 24 }
    }
  };

  /**
   * Get video constraints based on quality preset or auto-detection
   */
  getVideoConstraints(preset?: QualityPreset): MediaTrackConstraints {
    const selectedPreset = preset || this.qualityPreset;

    if (selectedPreset === 'auto') {
      return this.getAutoConstraints();
    }

    const constraints = this.qualityPresets[selectedPreset];
    return {
      ...constraints,
      facingMode: 'user'
    };
  }

  /**
   * Automatically determine best video constraints based on current network
   */
  private getAutoConstraints(): MediaTrackConstraints {
    const quality = this.currentQuality;

    if (quality === 'excellent' || quality === 'good') {
      return { ...this.qualityPresets.high, facingMode: 'user' };
    } else if (quality === 'fair') {
      return { ...this.qualityPresets.medium, facingMode: 'user' };
    } else {
      return { ...this.qualityPresets.low, facingMode: 'user' };
    }
  }

  /**
   * Set quality preset
   */
  setQualityPreset(preset: QualityPreset): void {
    this.qualityPreset = preset;
  }

  /**
   * Get current quality preset
   */
  getQualityPreset(): QualityPreset {
    return this.qualityPreset;
  }

  /**
   * Start monitoring connection quality
   */
  startMonitoring(stream: MediaStream): void {
    this.stopMonitoring();

    this.monitoringInterval = window.setInterval(() => {
      this.checkConnectionQuality(stream);
    }, 3000);
  }

  /**
   * Stop monitoring connection quality
   */
  stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check current connection quality
   */
  private async checkConnectionQuality(stream: MediaStream): Promise<void> {
    try {
      // Simulate network quality check
      // In a real implementation, this would use WebRTC stats API
      const stats = await this.getNetworkStats(stream);
      this.networkStats = stats;

      const newQuality = this.calculateQuality(stats);
      
      if (newQuality !== this.currentQuality) {
        this.currentQuality = newQuality;
        this.notifyQualityChange(newQuality);
      }
    } catch (error) {
      console.error('Error checking connection quality:', error);
    }
  }

  /**
   * Get network statistics (simulated for now)
   */
  private async getNetworkStats(stream: MediaStream): Promise<NetworkStats> {
    // In production, use RTCPeerConnection.getStats() for real metrics
    // This is a simplified simulation
    
    const startTime = Date.now();
    
    // Simulate a simple network check
    try {
      await fetch('/api/health', { method: 'HEAD' });
      const latency = Date.now() - startTime;

      // Estimate bandwidth based on latency (rough approximation)
      let bandwidth = 5000; // kbps
      if (latency < 50) bandwidth = 10000;
      else if (latency < 100) bandwidth = 5000;
      else if (latency < 200) bandwidth = 2000;
      else bandwidth = 1000;

      return {
        latency,
        bandwidth,
        packetLoss: Math.random() * 2, // 0-2% simulated
        jitter: Math.random() * 10 // 0-10ms simulated
      };
    } catch (error) {
      return {
        latency: 999,
        bandwidth: 500,
        packetLoss: 10,
        jitter: 50
      };
    }
  }

  /**
   * Calculate connection quality from network stats
   */
  private calculateQuality(stats: NetworkStats): ConnectionQuality {
    const { latency, bandwidth, packetLoss } = stats;

    // Score based on multiple factors
    let score = 100;

    // Latency impact
    if (latency > 200) score -= 30;
    else if (latency > 100) score -= 15;
    else if (latency > 50) score -= 5;

    // Bandwidth impact
    if (bandwidth < 1000) score -= 40;
    else if (bandwidth < 2000) score -= 20;
    else if (bandwidth < 5000) score -= 10;

    // Packet loss impact
    score -= packetLoss * 10;

    // Determine quality
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Get current connection quality
   */
  getConnectionQuality(): ConnectionQuality {
    return this.currentQuality;
  }

  /**
   * Get network statistics
   */
  getNetworkStatistics(): NetworkStats {
    return { ...this.networkStats };
  }

  /**
   * Subscribe to quality changes
   */
  onQualityChange(callback: (quality: ConnectionQuality) => void): void {
    this.qualityChangeCallbacks.push(callback);
  }

  /**
   * Unsubscribe from quality changes
   */
  offQualityChange(callback: (quality: ConnectionQuality) => void): void {
    this.qualityChangeCallbacks = this.qualityChangeCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notify subscribers of quality change
   */
  private notifyQualityChange(quality: ConnectionQuality): void {
    this.qualityChangeCallbacks.forEach(callback => {
      try {
        callback(quality);
      } catch (error) {
        console.error('Error in quality change callback:', error);
      }
    });
  }

  /**
   * Adjust video track quality dynamically
   */
  async adjustVideoQuality(track: MediaStreamTrack, quality: ConnectionQuality): Promise<void> {
    try {
      let constraints: MediaTrackConstraints;

      switch (quality) {
        case 'excellent':
        case 'good':
          constraints = this.qualityPresets.high;
          break;
        case 'fair':
          constraints = this.qualityPresets.medium;
          break;
        case 'poor':
          constraints = this.qualityPresets.low;
          break;
      }

      await track.applyConstraints(constraints);
      console.log(`Video quality adjusted to ${quality}`, constraints);
    } catch (error) {
      console.error('Error adjusting video quality:', error);
    }
  }

  /**
   * Get recommended quality settings based on device
   */
  getDeviceOptimizedConstraints(): MediaTrackConstraints {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    if (isMobile || isLowEnd) {
      return {
        ...this.qualityPresets.medium,
        facingMode: 'user'
      };
    }

    return {
      ...this.qualityPresets.high,
      facingMode: 'user'
    };
  }

  /**
   * Enable bandwidth saver mode
   */
  enableBandwidthSaver(stream: MediaStream): void {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      this.adjustVideoQuality(videoTrack, 'poor');
    }
  }

  /**
   * Get quality statistics as a readable object
   */
  getQualityReport() {
    const stats = this.networkStats;
    return {
      quality: this.currentQuality,
      latency: `${Math.round(stats.latency)}ms`,
      bandwidth: `${Math.round(stats.bandwidth / 1000)} Mbps`,
      packetLoss: `${stats.packetLoss.toFixed(1)}%`,
      jitter: `${Math.round(stats.jitter)}ms`,
      recommendation: this.getQualityRecommendation()
    };
  }

  /**
   * Get quality improvement recommendations
   */
  private getQualityRecommendation(): string {
    const { latency, bandwidth, packetLoss } = this.networkStats;

    if (packetLoss > 5) {
      return 'High packet loss detected. Check your network connection.';
    }
    if (latency > 200) {
      return 'High latency detected. Try moving closer to your router.';
    }
    if (bandwidth < 1000) {
      return 'Low bandwidth detected. Close other applications using internet.';
    }
    if (this.currentQuality === 'excellent') {
      return 'Connection quality is excellent!';
    }
    return 'Connection quality is acceptable.';
  }
}

export const connectionOptimization = new ConnectionOptimizationService();
