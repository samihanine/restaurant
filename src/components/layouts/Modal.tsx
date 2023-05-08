import React from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from '@heroicons/react/outline';

type ModalProps = {
  children: React.ReactNode;
  onClose?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  title: string;
};

export const Modal = ({ children, onClose, title }: ModalProps) =>
  ReactDOM.createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative z-[51] m-5 flex w-full max-w-[500px] items-center justify-center rounded-xl bg-white px-5 py-5">
        <div className="flex max-h-[90vh] !w-full max-w-[90vw] flex-col gap-8 overflow-auto px-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <button onClick={(e) => onClose?.(e)}>
              <XIcon className="h-8 w-8 text-gray-700" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.querySelector('body') as HTMLElement
  );
