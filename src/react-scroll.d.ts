declare module 'react-scroll' {
    export interface ScrollOptions {
      duration?: number;
      delay?: number;
      smooth?: string | boolean;
      containerId?: string;
      container?: HTMLElement;
      offset?: number;
      isDynamic?: boolean;
      ignoreCancelEvents?: boolean;
    }
  
    export interface Scroll {
      scrollToTop(options?: ScrollOptions): void;
    }
  
    export const animateScroll: Scroll;
  }