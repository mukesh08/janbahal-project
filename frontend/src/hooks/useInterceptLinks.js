import { useEffect } from 'react';

/*
 * Intercept <a> clicks inside the element referenced by `ref` and route same-site
 * links through React Router (`navigate`) instead of triggering a full reload.
 * External, anchor and mailto links are left untouched. `deps` controls when the
 * listener is re-attached (e.g. after the inner HTML changes).
 */
export const useInterceptLinks = (ref, navigate, deps = []) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto')) return;
      e.preventDefault();
      navigate(href);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
