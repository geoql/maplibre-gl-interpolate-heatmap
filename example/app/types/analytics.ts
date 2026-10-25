/** Where on the page a tracked link lives. */
export type LinkSection = 'panel' | 'footer' | 'install' | 'attribution';

/** The heatmap controls the demo exposes. */
export type DemoControl =
  | 'opacity'
  | 'power'
  | 'resolution'
  | 'palette'
  | 'stations';

/** Closed event map: event name → its properties. */
export interface AnalyticsEventMap {
  outbound_click: {
    /** Absolute URL of the link target. */
    target: string;
    section: LinkSection;
  };
  install_copy: {
    command: string;
  };
  demo_interaction: {
    control: DemoControl;
    value: string;
  };
  theme_changed: {
    preference: 'light' | 'dark' | 'system';
  };
}

export type AnalyticsEvent = keyof AnalyticsEventMap;

/** A queue-backed global: callable, with the loader's bookkeeping. */
export interface QueuedFn {
  (...args: unknown[]): void;
  q?: unknown[];
  o?: Record<string, unknown>;
  init?: (options?: Record<string, unknown>) => void;
}

export interface GtagHandle {
  gtag: (...args: unknown[]) => void;
}

export interface PlausibleHandle {
  plausible: (...args: unknown[]) => void;
}

export interface OpenPanelHandle {
  track: (name: string, properties?: Record<string, unknown>) => void;
}

export interface AnalyticsHandles {
  ga?: GtagHandle;
  plausible?: PlausibleHandle;
  openpanel?: OpenPanelHandle;
}
