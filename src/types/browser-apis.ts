/**
 * Browser API type definitions for better type safety
 * Replaces `any` types with proper browser API definitions
 */

// Navigator extensions for mobile-specific APIs
export interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface NetworkConnection {
  type: string;
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData?: boolean;
  onchange?: (event: Event) => void;
}

export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange?: (event: Event) => void;
  onchargingtimechange?: (event: Event) => void;
  ondischargingtimechange?: (event: Event) => void;
  onlevelchange?: (event: Event) => void;
}

export interface NavigatorWithBattery extends Navigator {
  battery?: BatteryManager;
  mozBattery?: BatteryManager;
  webkitBattery?: BatteryManager;
}

export interface WakeLockSentinel {
  released: boolean;
  type: string;
  release(): Promise<void>;
}

export interface WakeLock {
  request(type: string): Promise<WakeLockSentinel>;
}

export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export interface DocumentWithFullscreen extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
}

export interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface RelatedApplication {
  platform: string;
  url: string;
  id?: string;
}

export interface NavigatorWithInstallPrompt extends Navigator {
  getInstalledRelatedApps?: () => Promise<RelatedApplication[]>;
}

export interface WindowWithExtensions extends Window {
  DeviceMotionEvent?: typeof DeviceMotionEvent;
  DeviceOrientationEvent?: typeof DeviceOrientationEvent;
}

export interface TouchEventWithForce extends TouchEvent {
  force?: number;
}

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface DeviceLightEvent extends Event {
  value: number;
}

export interface UserProximityEvent extends Event {
  near: boolean;
}

export interface DeviceProximityEvent extends Event {
  value: number;
  min: number;
  max: number;
}

export interface WindowWithAmbientLight extends Window {
  ondevicelight?: (event: DeviceLightEvent) => void;
}

export interface WindowWithProximity extends Window {
  onuserproximity?: (event: UserProximityEvent) => void;
  ondeviceproximity?: (event: DeviceProximityEvent) => void;
}

// Utility types for casting - using intersection types to avoid extension conflicts
export type ExtendedNavigator = Navigator & {
  standalone?: boolean;
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
  battery?: BatteryManager;
  mozBattery?: BatteryManager;
  webkitBattery?: BatteryManager;
  wakeLock?: WakeLock;
  deviceMemory?: number;
  getInstalledRelatedApps?: () => Promise<RelatedApplication[]>;
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
};

export type ExtendedWindow = Window & {
  DeviceMotionEvent?: typeof DeviceMotionEvent;
  DeviceOrientationEvent?: typeof DeviceOrientationEvent;
  ondevicelight?: (event: DeviceLightEvent) => void;
  onuserproximity?: (event: UserProximityEvent) => void;
  ondeviceproximity?: (event: DeviceProximityEvent) => void;
};

export type ExtendedDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
};

export type ExtendedScreen = Screen & {
  orientation?: ScreenOrientation & {
    lock?: (orientation: string) => Promise<void>;
    unlock?: () => void;
  };
  mozOrientation?: string;
  msOrientation?: string;
};

export type ExtendedElement = Element & {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

export type ExtendedPerformance = Performance & {
  memory?: PerformanceMemory;
};
