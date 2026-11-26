import { useEffect, useRef, useState } from "react";

// Small animation helpers shared by the Welcome and About pages.
// Styles for .rv / .intro-caret live in pages/Welcome.css.

export const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Types a word, holds it, deletes it, moves to the next one.
export function useTypewriter(words, { type = 85, erase = 40, hold = 1500, gap = 300 } = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(() => (reducedMotion() ? words[0] : ""));
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const word = words[index % words.length];
    let delay;
    let step;
    if (!erasing && text === word) {
      delay = hold;
      step = () => setErasing(true);
    } else if (erasing && text === "") {
      delay = gap;
      step = () => {
        setErasing(false);
        setIndex((i) => i + 1);
      };
    } else {
      delay = erasing ? erase : type + Math.random() * 60; // a little human jitter
      step = () => setText(erasing ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }
    const t = setTimeout(step, delay);
    return () => clearTimeout(t);
  }, [text, erasing, index, words, type, erase, hold, gap]);

  return text;
}

// Types a line once when it scrolls into view.
export function TypeOnce({ text, speed = 38, className = "" }) {
  const ref = useRef();
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));
  const [start, setStart] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStart(true), io.disconnect()), { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!start || shown >= text.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [start, shown, text, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, shown)}</span>
      <span aria-hidden="true" className={`intro-caret ${shown >= text.length ? "done" : ""}`} />
    </span>
  );
}

export function useInView(options = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}

export function Reveal({ as: Tag = "div", delay = 0, from = "up", className = "", children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`rv rv-${from} ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Counts up to `to` once visible; re-runs if `to` changes (e.g. products finish loading).
export function CountUp({ to, suffix = "", duration = 1400 }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) return setN(to);
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); // ease-out cubic
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <b ref={ref}>{n.toLocaleString("en-IN")}{suffix}</b>;
}
