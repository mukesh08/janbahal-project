import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Slider from './Slider';
import { stripBody } from '../lib/stripBody';

/*
 * Renders a GrapesJS page's HTML and mounts live <Slider> components into any
 * `[data-slider]` placeholders the page editor produced.
 *
 * The HTML is injected imperatively (not via dangerouslySetInnerHTML) so React
 * never reconciles that subtree — otherwise React would re-apply the innerHTML on
 * re-render and wipe the portal-mounted sliders. Portals (not a separate root) keep
 * the sliders inside the app's Router context so their links work.
 */
const RenderedPage = ({ html, style }) => {
  const ref = useRef(null);
  const [mounts, setMounts] = useState([]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = stripBody(html);
    const nodes = Array.from(el.querySelectorAll('[data-slider]'));
    nodes.forEach(n => { n.innerHTML = ''; });   // remove the editor placeholder
    setMounts(nodes.map(n => ({ node: n, id: n.getAttribute('data-slider') })));
  }, [html]);

  return (
    <>
      <div ref={ref} style={style} />
      {mounts.map((m, i) =>
        m.id ? createPortal(<Slider sliderId={m.id} />, m.node, `slider-mount-${i}`) : null
      )}
    </>
  );
};

export default RenderedPage;
