import { useEffect } from 'react';

/*
 * Inject a <style id={id}> tag holding `css` into <head>, keeping it in sync as
 * `css` changes and removing it on unmount. Reuses an existing tag with the same
 * id if present. No-op while `css` is empty.
 */
export const useInjectCSS = (css, id) => {
  useEffect(() => {
    if (!css) return;
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerHTML = css;
    return () => { document.getElementById(id)?.remove(); };
  }, [css, id]);
};
