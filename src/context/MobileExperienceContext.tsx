'use client';

import { type ReactNode, createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { type MobileExperienceState, type MobileExperiencePreferences, type DeviceInfo, type TouchInteraction, type PerformanceMetrics, type ConnectivityStatus, type ViewportInfo, type LayoutInfo, type OptimizationRecommendation, type MobileAnalytics, DEFAULT_MOBILE_CONFIG } from '~/types/mobile-experience';
import { detectDeviceType, detectOrientation, detectTouchSupport, detectPlatformOS, getViewportInfo, detectConnectivityStatus, measurePerformanceMetrics, calculateLayoutInfo, generateOptimizationRecommendations, createMobileAnalytics, trackTouchInteraction, trackPerformanceMetrics, trackConnectivityChange } from '~/lib/mobile-experience-utils';
import { MOCK_STATE_TEMPLATES, MOCK_USER_PREFERENCES } from '~/data/mobile-experience-mock';

interface MobileExperienceContextType {
  state: MobileExperienceState;
  preferences: MobileExperiencePreferences;
  config: typeof DEFAULT_MOBILE_CONFIG;
  
  // Device management
  updateDeviceInfo: (info: Partial<DeviceInfo>) => void;
  updateViewportInfo: (info: ViewportInfo) => void;
  
  // Performance monitoring
  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
  updateConnectivityStatus: (status: ConnectivityStatus) => void;
  
  // Touch optimization
  recordTouchInteraction: (interaction: TouchInteraction) => void;
  optimizeTouchTargets: (enabled: boolean) => void;
  
  // Layout adaptation
  updateLayoutInfo: (info: LayoutInfo) => void;
  setAdaptationLevel: (level: 'basic' | 'enhanced' | 'native') => void;
  
  // Optimization
  runOptimization: () => void;
  applyOptimizationRecommendations: (recommendations: OptimizationRecommendation[]) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<MobileExperiencePreferences>) => void;
  
  // Analytics
  getAnalytics: () => MobileAnalytics;
  
  // Utility functions
  isMobileDevice: () => boolean;
  isTabletDevice: () => boolean;
  isDesktopDevice: () => boolean;
  hasTouch: () => boolean;
  isOffline: () => boolean;
  shouldOptimizeForBattery: () => boolean;
  shouldOptimizeForData: () => boolean;
}

const MobileExperienceContext = createContext<MobileExperienceContextType | undefined>(undefined);

type MobileExperienceAction =
  | { type: 'UPDATE_DEVICE_INFO'; payload: Partial<DeviceInfo> }
  | { type: 'UPDATE_VIEWPORT_INFO'; payload: ViewportInfo }
  | { type: 'UPDATE_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'UPDATE_CONNECTIVITY_STATUS'; payload: ConnectivityStatus }
  | { type: 'RECORD_TOUCH_INTERACTION'; payload: TouchInteraction }
  | { type: 'UPDATE_LAYOUT_INFO'; payload: LayoutInfo }
  | { type: 'SET_TOUCH_OPTIMIZATION'; payload: boolean }
  | { type: 'SET_ADAPTATION_LEVEL'; payload: 'basic' | 'enhanced' | 'native' }
  | { type: 'SET_OPTIMIZATION_LEVEL'; payload: 'low' | 'medium' | 'high' }
  | { type: 'SET_BATTERY_OPTIMIZATION'; payload: boolean }
  | { type: 'SET_DATA_OPTIMIZATION'; payload: boolean }
  | { type: 'SET_OFFLINE_MODE'; payload: boolean }
  | { type: 'APPLY_OPTIMIZATION_RECOMMENDATIONS'; payload: OptimizationRecommendation[] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<MobileExperiencePreferences> }
  | { type: 'INITIALIZE_STATE'; payload: MobileExperienceState };

function createInitialState(): MobileExperienceState {
  if (typeof window === 'undefined') {
    return {
      ...MOCK_STATE_TEMPLATES.initial,
      deviceInfo: {
        type: 'desktop',
        orientation: 'landscape',
        screenSize: { width: 1440, height: 900 },
        touchSupport: false,
        platformOS: 'linux',
        devicePixelRatio: 1,
      },
      viewportInfo: {
        width: 1440,
        height: 900,
        availableWidth: 1440,
        availableHeight: 900,
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      performanceMetrics: {
        frameRate: 60,
        memoryUsage: 45,
        batteryImpact: 'medium',
        dataUsage: 1.2,
        renderTime: 150,
        cpuUsage: 25,
        networkLatency: 120,
        cacheHitRate: 0.85,
      },
      connectivityStatus: {
        isOnline: true,
        connectionType: 'wifi',
        bandwidth: 10,
        latency: 50,
        signalStrength: 100,
        dataLimitReached: false,
      },
      touchOptimization: {
        enabled: false,
        targetSize: 'medium',
        hapticFeedback: false,
      },
      layoutAdaptation: {
        level: 'basic',
        currentLayout: {
          adaptationLevel: 'basic',
          layout: 'expanded',
          components: {
            header: { height: 64, visible: true },
            footer: { height: 60, visible: true },
            sidebar: { width: 320, visible: true },
            content: { width: 1056, height: 776 },
          },
        },
      },
      optimizationLevel: 'medium',
      batteryOptimization: true,
      dataOptimization: true,
      offlineMode: false,
    } as MobileExperienceState;
  }

  // Client-side initialization
  const deviceInfo: DeviceInfo = {
    type: detectDeviceType(),
    orientation: detectOrientation(),
    screenSize: { width: window.innerWidth, height: window.innerHeight },
    touchSupport: detectTouchSupport(),
    platformOS: detectPlatformOS(),
    devicePixelRatio: window.devicePixelRatio || 1,
    userAgent: navigator.userAgent,
  };

  const viewportInfo = getViewportInfo();
  const connectivityStatus = detectConnectivityStatus();
  const performanceMetrics = measurePerformanceMetrics();
  const layoutInfo = calculateLayoutInfo(viewportInfo, 'enhanced');

  return {
    deviceInfo,
    viewportInfo,
    performanceMetrics,
    connectivityStatus,
    touchOptimization: {
      enabled: deviceInfo.touchSupport,
      targetSize: deviceInfo.type === 'mobile' ? 'medium' : 'small',
      hapticFeedback: deviceInfo.touchSupport && deviceInfo.type === 'mobile',
    },
    layoutAdaptation: {
      level: deviceInfo.type === 'mobile' ? 'enhanced' : 'basic',
      currentLayout: layoutInfo,
    },
    optimizationLevel: 'medium',
    batteryOptimization: deviceInfo.type === 'mobile',
    dataOptimization: connectivityStatus.connectionType === 'cellular',
    offlineMode: !connectivityStatus.isOnline,
  };
}

function mobileExperienceReducer(state: MobileExperienceState, action: MobileExperienceAction): MobileExperienceState {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return action.payload;
    
    case 'UPDATE_DEVICE_INFO':
      return {
        ...state,
        deviceInfo: { ...state.deviceInfo, ...action.payload },
      };
    
    case 'UPDATE_VIEWPORT_INFO':
      return {
        ...state,
        viewportInfo: action.payload,
      };
    
    case 'UPDATE_PERFORMANCE_METRICS':
      return {
        ...state,
        performanceMetrics: action.payload,
      };
    
    case 'UPDATE_CONNECTIVITY_STATUS':
      return {
        ...state,
        connectivityStatus: action.payload,
        offlineMode: !action.payload.isOnline,
      };
    
    case 'RECORD_TOUCH_INTERACTION':
      // Track touch interaction for analytics
      trackTouchInteraction(action.payload);
      return state;
    
    case 'UPDATE_LAYOUT_INFO':
      return {
        ...state,
        layoutAdaptation: {
          ...state.layoutAdaptation,
          currentLayout: action.payload,
        },
      };
    
    case 'SET_TOUCH_OPTIMIZATION':
      return {
        ...state,
        touchOptimization: {
          ...state.touchOptimization,
          enabled: action.payload,
        },
      };
    
    case 'SET_ADAPTATION_LEVEL':
      return {
        ...state,
        layoutAdaptation: {
          ...state.layoutAdaptation,
          level: action.payload,
        },
      };
    
    case 'SET_OPTIMIZATION_LEVEL':
      return {
        ...state,
        optimizationLevel: action.payload,
      };
    
    case 'SET_BATTERY_OPTIMIZATION':
      return {
        ...state,
        batteryOptimization: action.payload,
      };
    
    case 'SET_DATA_OPTIMIZATION':
      return {
        ...state,
        dataOptimization: action.payload,
      };
    
    case 'SET_OFFLINE_MODE':
      return {
        ...state,
        offlineMode: action.payload,
      };
    
    case 'APPLY_OPTIMIZATION_RECOMMENDATIONS':
      // Apply optimization recommendations
      const newState = { ...state };
      
      action.payload.forEach(recommendation => {
        switch (recommendation.type) {
          case 'performance':
            if (recommendation.priority === 'high') {
              newState.optimizationLevel = 'high';
            }
            break;
          case 'battery':
            if (recommendation.priority === 'high') {
              newState.batteryOptimization = true;
            }
            break;
          case 'connectivity':
            if (recommendation.priority === 'high') {
              newState.dataOptimization = true;
            }
            break;
        }
      });
      
      return newState;
    
    case 'UPDATE_PREFERENCES':
      // Note: Preferences are managed separately but can influence state
      return state;
    
    default:
      return state;
  }
}

interface MobileExperienceProviderProps {
  children: ReactNode;
  initialPreferences?: Partial<MobileExperiencePreferences>;
}

export function MobileExperienceProvider({ children, initialPreferences }: MobileExperienceProviderProps) {
  const [state, dispatch] = useReducer(mobileExperienceReducer, createInitialState());
  const [preferences, setPreferences] = useReducer(
    (prev: MobileExperiencePreferences, next: Partial<MobileExperiencePreferences>) => ({ ...prev, ...next }),
    {
      ...MOCK_USER_PREFERENCES.casualUser!,
      ...initialPreferences,
    }
  );

  // Initialize state on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialState = createInitialState();
      dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
    }
  }, []);

  // Monitor viewport changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const viewportInfo = getViewportInfo();
      dispatch({ type: 'UPDATE_VIEWPORT_INFO', payload: viewportInfo });
      
      const deviceInfo = {
        orientation: detectOrientation(),
        screenSize: { width: window.innerWidth, height: window.innerHeight },
      };
      dispatch({ type: 'UPDATE_DEVICE_INFO', payload: deviceInfo });
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        handleResize();
      }, 100); // Small delay to ensure screen dimensions are updated
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Monitor connectivity changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      const connectivityStatus = detectConnectivityStatus();
      dispatch({ type: 'UPDATE_CONNECTIVITY_STATUS', payload: connectivityStatus });
      trackConnectivityChange(connectivityStatus);
    };

    const handleOffline = () => {
      const connectivityStatus = detectConnectivityStatus();
      dispatch({ type: 'UPDATE_CONNECTIVITY_STATUS', payload: connectivityStatus });
      trackConnectivityChange(connectivityStatus);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor performance metrics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const intervalId = setInterval(() => {
      const metrics = measurePerformanceMetrics();
      dispatch({ type: 'UPDATE_PERFORMANCE_METRICS', payload: metrics });
      trackPerformanceMetrics(metrics);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Context value
  const contextValue: MobileExperienceContextType = {
    state,
    preferences,
    config: DEFAULT_MOBILE_CONFIG,

    // Device management
    updateDeviceInfo: useCallback((info: Partial<DeviceInfo>) => {
      dispatch({ type: 'UPDATE_DEVICE_INFO', payload: info });
    }, []),

    updateViewportInfo: useCallback((info: ViewportInfo) => {
      dispatch({ type: 'UPDATE_VIEWPORT_INFO', payload: info });
    }, []),

    // Performance monitoring
    updatePerformanceMetrics: useCallback((metrics: PerformanceMetrics) => {
      dispatch({ type: 'UPDATE_PERFORMANCE_METRICS', payload: metrics });
    }, []),

    updateConnectivityStatus: useCallback((status: ConnectivityStatus) => {
      dispatch({ type: 'UPDATE_CONNECTIVITY_STATUS', payload: status });
    }, []),

    // Touch optimization
    recordTouchInteraction: useCallback((interaction: TouchInteraction) => {
      dispatch({ type: 'RECORD_TOUCH_INTERACTION', payload: interaction });
    }, []),

    optimizeTouchTargets: useCallback((enabled: boolean) => {
      dispatch({ type: 'SET_TOUCH_OPTIMIZATION', payload: enabled });
    }, []),

    // Layout adaptation
    updateLayoutInfo: useCallback((info: LayoutInfo) => {
      dispatch({ type: 'UPDATE_LAYOUT_INFO', payload: info });
    }, []),

    setAdaptationLevel: useCallback((level: 'basic' | 'enhanced' | 'native') => {
      dispatch({ type: 'SET_ADAPTATION_LEVEL', payload: level });
    }, []),

    // Optimization
    runOptimization: useCallback(() => {
      const recommendations = generateOptimizationRecommendations(
        state.performanceMetrics,
        state.deviceInfo,
        state.connectivityStatus
      );
      dispatch({ type: 'APPLY_OPTIMIZATION_RECOMMENDATIONS', payload: recommendations });
    }, [state.performanceMetrics, state.deviceInfo, state.connectivityStatus]),

    applyOptimizationRecommendations: useCallback((recommendations: OptimizationRecommendation[]) => {
      dispatch({ type: 'APPLY_OPTIMIZATION_RECOMMENDATIONS', payload: recommendations });
    }, []),

    // Preferences
    updatePreferences: useCallback((newPreferences: Partial<MobileExperiencePreferences>) => {
      setPreferences(newPreferences);
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPreferences });
    }, []),

    // Analytics
    getAnalytics: useCallback(() => {
      return createMobileAnalytics('session_' + Date.now());
    }, []),

    // Utility functions
    isMobileDevice: useCallback(() => state.deviceInfo.type === 'mobile', [state.deviceInfo.type]),
    isTabletDevice: useCallback(() => state.deviceInfo.type === 'tablet', [state.deviceInfo.type]),
    isDesktopDevice: useCallback(() => state.deviceInfo.type === 'desktop', [state.deviceInfo.type]),
    hasTouch: useCallback(() => state.deviceInfo.touchSupport, [state.deviceInfo.touchSupport]),
    isOffline: useCallback(() => !state.connectivityStatus.isOnline, [state.connectivityStatus.isOnline]),
    shouldOptimizeForBattery: useCallback(() => state.batteryOptimization, [state.batteryOptimization]),
    shouldOptimizeForData: useCallback(() => state.dataOptimization, [state.dataOptimization]),
  };

  return (
    <MobileExperienceContext.Provider value={contextValue}>
      {children}
    </MobileExperienceContext.Provider>
  );
}

export function useMobileExperience() {
  const context = useContext(MobileExperienceContext);
  if (context === undefined) {
    throw new Error('useMobileExperience must be used within a MobileExperienceProvider');
  }
  return context;
}
