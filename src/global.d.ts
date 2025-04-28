declare module 'jquery' {
    interface JQuery<TElement = HTMLElement> {
      counterUp(options?: { delay?: number; time?: number }): JQuery<TElement>;
    }
    function $(selector: string | any): JQuery;
    namespace $ {}
    
  }
  