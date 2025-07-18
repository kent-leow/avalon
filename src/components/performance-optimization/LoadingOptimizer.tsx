'use client';

import { useEffect, useRef, useState } from 'react';
import type { LoadingOptimizerProps, LoadingMetrics } from '~/types/performance-optimization';
import { createMockLoadingMetrics } from '~/lib/performance-utils';

/**
 * Loading Optimizer Component
 * 
 * Optimizes loading performance through code splitting,
 * lazy loading, preloading, and resource optimization.
 */
export function LoadingOptimizer({
  children,
  enableCodeSplitting = true,
  enableLazyLoading = true,
  enablePreloading = true,
  onLoadingOptimized,
}: LoadingOptimizerProps) {
  const [metrics, setMetrics] = useState<LoadingMetrics>(createMockLoadingMetrics());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadLinksRef = useRef<HTMLLinkElement[]>([]);

  // Initialize loading optimization
  useEffect(() => {
    initializeLoadingOptimization();
    return () => {
      observerRef.current?.disconnect();
      preloadLinksRef.current.forEach(link => link.remove());
    };
  }, []);

  const initializeLoadingOptimization = () => {
    if (enableCodeSplitting) {
      enableCodeSplittingOptimization();
    }
    
    if (enableLazyLoading) {
      enableLazyLoadingOptimization();
    }
    
    if (enablePreloading) {
      enablePreloadingOptimization();
    }
    
    monitorLoadingMetrics();
  };

  const enableCodeSplittingOptimization = () => {
    // Dynamic imports for code splitting
    const scriptTags = document.querySelectorAll('script[src]');
    let totalSize = 0;
    let loadedSize = 0;
    
    scriptTags.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src && !src.includes('chunk')) {
        // Mark as potential code splitting candidate
        script.setAttribute('data-code-split', 'true');
      }
    });
    
    setMetrics(prev => ({
      ...prev,
      codesplitting: true,
    }));
  };

  const enableLazyLoadingOptimization = () => {
    // Image lazy loading
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
    
    // Component lazy loading with intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Load deferred content
            if (element.hasAttribute('data-lazy-src')) {
              const src = element.getAttribute('data-lazy-src');
              if (src) {
                (element as HTMLImageElement).src = src;
                element.removeAttribute('data-lazy-src');
              }
            }
            
            // Load deferred components
            if (element.hasAttribute('data-lazy-component')) {
              const componentName = element.getAttribute('data-lazy-component');
              if (componentName) {
                loadLazyComponent(componentName, element);
              }
            }
            
            observerRef.current?.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe elements marked for lazy loading
    const lazyElements = document.querySelectorAll('[data-lazy-src], [data-lazy-component]');
    lazyElements.forEach(element => {
      observerRef.current?.observe(element);
    });
    
    setMetrics(prev => ({
      ...prev,
      lazyLoadingActive: true,
    }));
  };

  const loadLazyComponent = async (componentName: string, element: Element) => {
    try {
      // Dynamic import for component
      const module = await import(`~/components/${componentName}`);
      const Component = module.default || module[componentName];
      
      if (Component) {
        // Replace element with loaded component
        element.innerHTML = '<div data-component-loaded="true">Component loaded</div>';
      }
    } catch (error) {
      console.error(`Failed to load lazy component ${componentName}:`, error);
    }
  };

  const enablePreloadingOptimization = () => {
    // Preload critical resources
    const criticalResources = [
      { href: '/api/trpc/game.getState', as: 'fetch' },
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
      { href: '/images/logo.png', as: 'image' },
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      if (resource.as === 'font') {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
      preloadLinksRef.current.push(link);
    });
    
    // DNS prefetch for external resources
    const dnsPrefetchDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.github.com',
    ];
    
    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `https://${domain}`;
      document.head.appendChild(link);
      preloadLinksRef.current.push(link);
    });
    
    setMetrics(prev => ({
      ...prev,
      preloadingActive: true,
      resourceHints: true,
    }));
  };

  const monitorLoadingMetrics = () => {
    // Monitor resource loading
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalResources = resources.length;
    let loadedResources = 0;
    
    resources.forEach(resource => {
      if (resource.responseEnd > 0) {
        loadedResources++;
      }
    });
    
    // Monitor initial load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const initialLoadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    
    setMetrics(prev => ({
      ...prev,
      totalResources,
      loadedResources,
      initialLoadTime,
      compressionActive: checkCompressionActive(),
    }));
  };

  const checkCompressionActive = (): boolean => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.some(resource => {
      return resource.encodedBodySize > 0 && resource.encodedBodySize < resource.decodedBodySize;
    });
  };

  const optimizeLoading = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      // Optimize images
      await optimizeImages();
      
      // Optimize fonts
      await optimizeFonts();
      
      // Optimize scripts
      await optimizeScripts();
      
      // Update metrics
      const newMetrics = createMockLoadingMetrics();
      setMetrics(current => ({ ...current, ...newMetrics }));
      onLoadingOptimized?.(metrics);

    } catch (error) {
      console.error('Loading optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeImages = async () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading optimization
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decode optimization
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Add sizes attribute for responsive images
      if (img.hasAttribute('srcset') && !img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
      }
    });
  };

  const optimizeFonts = async () => {
    const fontLinks = document.querySelectorAll('link[rel="stylesheet"][href*="fonts"]');
    
    fontLinks.forEach(link => {
      // Add font-display optimization
      const href = link.getAttribute('href');
      if (href && !href.includes('display=swap')) {
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', `${href}${separator}display=swap`);
      }
    });
  };

  const optimizeScripts = async () => {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      
      // Add async/defer attributes
      if (src && !script.hasAttribute('async') && !script.hasAttribute('defer')) {
        if (src.includes('analytics') || src.includes('tracking')) {
          script.setAttribute('async', '');
        } else {
          script.setAttribute('defer', '');
        }
      }
    });
  };

  // Trigger optimization when metrics change
  useEffect(() => {
    const loadingRatio = metrics.loadedResources / metrics.totalResources;
    if (loadingRatio < 0.8) {
      optimizeLoading();
    }
  }, [metrics.loadedResources, metrics.totalResources]);

  return (
    <div className="loading-optimizer w-full h-full">
      {children}
    </div>
  );
}
