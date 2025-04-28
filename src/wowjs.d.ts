declare module 'wowjs' {
    export class WOW {
      constructor(config?: WOWConfig);
      init(): void;
    }
  
    interface WOWConfig {
      boxClass?: string;
      animateClass?: string;
      offset?: number;
      mobile?: boolean;
      live?: boolean;
    }
  }
  