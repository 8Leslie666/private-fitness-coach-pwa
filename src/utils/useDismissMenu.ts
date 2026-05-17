import { useEffect } from 'react';

export function useDismissMenu(isOpen: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const dismiss = () => onDismiss();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('[data-action-menu-surface="true"], [data-action-menu-trigger="true"]')) return;
      onDismiss();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('wheel', dismiss, { capture: true, passive: true });
    window.addEventListener('touchmove', dismiss, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('wheel', dismiss, true);
      window.removeEventListener('touchmove', dismiss, true);
    };
  }, [isOpen, onDismiss]);
}
