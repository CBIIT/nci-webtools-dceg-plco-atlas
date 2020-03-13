import { useEffect } from 'react';

/**
 * Ensures that a statically or non-positioned parent node has relative positioning
 * @param {*} ref - React ref (or any object with .current property that is a DOM node)
 */
export function useNonStaticParent(ref) {
    useEffect(() => {
        const parent = ref.current ? ref.current.parentNode : null;
        if (parent) {
            const { position } = window.getComputedStyle(parent);
            if (!position || position === 'static') {
                parent.style.position = 'relative';
                // reset parent position when unmounting
                return () => {if (parent) parent.style.position = position};
            }
        }
    });
}