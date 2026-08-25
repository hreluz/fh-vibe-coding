'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * Hydration-safe React Portal component using useSyncExternalStore that renders modal content directly into document.body.
 * Ensures modals break out of any parent CSS stacking context, overflow, or sticky positioning.
 */
export function ModalPortal({ children }: ModalPortalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
}
