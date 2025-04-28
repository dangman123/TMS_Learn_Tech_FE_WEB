declare module "react-modal" {
  import * as React from "react";

  export interface ModalProps {
    isOpen: boolean;
    onRequestClose?: () => void;
    style?: {
      content?: React.CSSProperties;
      overlay?: React.CSSProperties;
    };
    appElement?: HTMLElement | null;
    ariaHideApp?: boolean;
    children?: React.ReactNode;
  }

  export default class Modal extends React.Component<ModalProps> {}
}
