import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/*
 * Reusable hero slider. Renders one named slider (a group of slides).
 * Self-contained: fetches its own slides and renders nothing when empty,
 * so it's safe to mount into a page-editor placeholder.
 *
 * Props:
 *   sliderId  — id or slug of the named slider to render (required)
 */
const Slider = ({ sliderId }) => {
  const navigate = useNavigate();
  const [slides,  setSlides]  = useState([]);
  const [config,  setConfig]  = useState({ autoplay: true, interval: 6000, height: '' });
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!sliderId) { setSlides([]); return; }
    axios.get(`/api/slides/public/${sliderId}`)
      .then(({ data }) => {
        setSlides(Array.isArray(data.slides) ? data.slides : []);
        if (data.slider) setConfig({
          autoplay: data.slider.autoplay !== false,
          interval: data.slider.interval || 6000,
          height:   data.slider.height || '',
        });
      })
      .catch(() => setSlides([]));
  }, [sliderId]);

  const go = useCallback((i) => {
    const n = slides.length;
    if (n === 0) return;
    setCurrent(((i % n) + n) % n);   // wrap around in both directions
  }, [slides.length]);

  const next = useCallback(() => setCurrent(c => (c + 1) % (slides.length || 1)), [slides.length]);
  const prev = () => go(current - 1);

  /* Auto-advance */
  useEffect(() => {
    if (!config.autoplay || slides.length <= 1) return;
    timer.current = setInterval(next, config.interval);
    return () => clearInterval(timer.current);
  }, [config.autoplay, config.interval, next, slides.length]);

  const restartTimer = () => {
    if (!config.autoplay || slides.length <= 1) return;
    clearInterval(timer.current);
    timer.current = setInterval(next, config.interval);
  };

  if (slides.length === 0) return null;

  const height = config.height || 'clamp(360px, 60vh, 600px)';

  const handleButton = (slide) => {
    const url = slide.buttonUrl;
    if (!url) return;
    const isExternal = /^https?:\/\//i.test(url) || slide.buttonTarget === '_blank';
    if (isExternal) {
      window.open(url, slide.buttonTarget === '_blank' ? '_blank' : '_self');
    } else {
      navigate(url);
    }
  };

  return (
    <section style={{ ...s.wrap, height }} aria-roledescription="carousel">
      {slides.map((slide, i) => (
        <div
          key={slide._id}
          style={{
            ...s.slide,
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
            backgroundImage: slide.image ? `url("${slide.image}")` : 'none',
            backgroundColor: slide.image ? undefined : '#0f172a',
          }}
          aria-hidden={i !== current}
        >
          <div style={s.overlay} />
          <div style={s.content}>
            {slide.heading && <h2 style={s.heading}>{slide.heading}</h2>}
            {slide.subtext && <p style={s.subtext}>{slide.subtext}</p>}
            {slide.buttonLabel && slide.buttonUrl && (
              <button className="fx-btn" style={s.cta} onClick={() => handleButton(slide)}>
                {slide.buttonLabel}
              </button>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button style={{ ...s.arrow, left: '16px' }} onClick={() => { prev(); restartTimer(); }} aria-label="Previous slide">
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <button style={{ ...s.arrow, right: '16px' }} onClick={() => { next(); restartTimer(); }} aria-label="Next slide">
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
          <div style={s.dots}>
            {slides.map((_, i) => (
              <button key={i} style={{ ...s.dot, ...(i === current ? s.dotActive : {}) }} onClick={() => { go(i); restartTimer(); }} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

const s = {
  wrap: { position: 'relative', width: '100%', overflow: 'hidden', background: '#0f172a', fontFamily: "'Poppins', sans-serif" },
  slide: { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.8s ease' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.55) 100%)' },
  content: { position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', maxWidth: '760px', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  heading: { fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: '800', lineHeight: 1.15, margin: 0, textShadow: '0 2px 16px rgba(0,0,0,0.4)' },
  subtext: { fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)', fontWeight: '400', lineHeight: 1.6, margin: 0, opacity: 0.95, textShadow: '0 1px 8px rgba(0,0,0,0.4)' },
  cta: { marginTop: '0.5rem', padding: '0.8rem 1.8rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", boxShadow: '0 8px 24px rgba(79,70,229,0.4)', transition: 'filter 0.2s ease' },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' },
  dots: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: '8px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', padding: 0, background: 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  dotActive: { background: '#fff', width: '28px', borderRadius: '5px' },
};

export default Slider;
