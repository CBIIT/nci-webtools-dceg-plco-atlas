import { useEffect } from 'react';

/**
 * Ensures that a statically or non-positioned parent node has relative positioning
 * @param {*} ref - React ref (or any object with .current property that is a DOM node)
 */
export function useNonStaticParent(ref, resetParent) {
    useEffect(() => {
        const parent = ref.current ? ref.current.parentNode : null;
        if (parent) {
            const { position } = window.getComputedStyle(parent);
            if (!position || position === 'static') {
                parent.style.position = 'relative';

                // reset parent position when unmounting
                if (resetParent)
                    return () => {if (parent) parent.style.position = position};
            }
        }
    });
}

/**
 * Ensures that a node is absolutely positioned within the center of its parent, taking
 * into account its dimensions
 * @param {*} ref - React ref (or any object with .current property that is a DOM node)
 */
export function useAbsoluteCenteredPositioning(ref) {
    useEffect(() => {
        if (!ref.current) return;
        const node = ref.current;

        // apply positioning and display styles first
        node.style.position = 'absolute';
        node.style.disply = 'inline-block';
        node.style.left = '50%';
        node.style.top = '50%';
        node.style.textAlign = 'center';
        node.style.visibility = 'hidden';

        // calculate marginLeft and marginTop based on the node's dimensions
        const {offsetWidth, offsetHeight} = ref.current;
        node.style.marginLeft = `-${offsetWidth / 2}px`;
        node.style.marginTop = `-${offsetHeight / 2}px`;
        node.style.visibility = 'visible';
    })
}
