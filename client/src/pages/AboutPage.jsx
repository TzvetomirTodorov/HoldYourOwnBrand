/**
 * AboutPage.jsx — Hold Your Own Brand
 *
 * Complete redesign that eliminates broken image placeholders and empty
 * grid sections. Uses CSS-only visuals (gradients, patterns, borders)
 * so the page looks polished even without uploaded images.
 *
 * Sections:
 *   1. Hero — Brand statement with textured background
 *   2. Origin Story — The "why" behind HYOW
 *   3. Stats — Community numbers (animated on scroll)
 *   4. Values — Three brand pillars
 *   5. Timeline — Brand milestones
 *   6. CTA — Call to action
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   Animated counter — counts up when visible
   ───────────────────────────────────────────── */
const AnimatedStat = ({ end, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={ref} style={styles.statItem}>
      <span style={styles.statNumber}>
        {count}{suffix}
      </span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main About Page
   ───────────────────────────────────────────── */
const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.page}>

      {/* ── HERO ────────────────────────────── */}
      <section style={styles.hero}>
        {/* Decorative grain overlay */}
        <div style={styles.heroOverlay} />
        <div style={{
          ...styles.heroContent,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <span style={styles.heroPre}>EST. 2024</span>
          <h1 style={styles.heroTitle}>
            FROM THE CONCRETE<br />
            <span style={styles.heroAccent}>TO THE CULTURE</span>
          </h1>
          <p style={styles.heroSub}>
            Hold Your Own isn't just a brand — it's a declaration. Born in the streets,
            built for the ones who refuse to be defined by where they came from.
          </p>
        </div>

        {/* Decorative side accent */}
        <div style={styles.heroSideAccent} />
      </section>

      {/* ── ORIGIN STORY ───────────────────── */}
      <section style={styles.storySection}>
        <div style={styles.storyGrid}>
          {/* Left: decorative element instead of broken image */}
          <div style={styles.storyVisual}>
            <div style={styles.storyVisualInner}>
              <span style={styles.storyVisualText}>HYOW</span>
              <div style={styles.storyVisualLine} />
              <span style={styles.storyVisualYear}>2024</span>
            </div>
          </div>

          {/* Right: brand story */}
          <div style={styles.storyText}>
            <span style={styles.sectionTag}>OUR STORY</span>
            <h2 style={styles.sectionTitle}>Built Different.<br />On Purpose.</h2>
            <p style={styles.bodyText}>
              Hold Your Own was created for the ones who move with intention.
              Every stitch, every thread, every design carries a message: you don't
              need permission to be great. You just need the will to hold your own.
            </p>
            <p style={styles.bodyText}>
              We started with a simple idea — streetwear that speaks louder than logos.
              Pieces that tell your story before you say a word. From limited drops to
              community-first events, everything we do is rooted in authenticity.
            </p>
            <p style={styles.bodyText}>
              This isn't fast fashion. This is your armor. Designed to last,
              built to make a statement.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────── */}
      <section style={styles.statsSection}>
        <div style={styles.statsDivider} />
        <div style={styles.statsGrid}>
          <AnimatedStat end={10} suffix="K+" label="Community Members" />
          <AnimatedStat end={50} suffix="+" label="States & Countries" />
          <AnimatedStat end={100} suffix="%" label="Authentic" />
          <AnimatedStat end={24} suffix="/7" label="Hustle Mentality" />
        </div>
        <div style={styles.statsDivider} />
      </section>

      {/* ── VALUES ─────────────────────────── */}
      <section style={styles.valuesSection}>
        <span style={styles.sectionTag}>WHAT WE STAND FOR</span>
        <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '60px' }}>
          Three Pillars. One Movement.
        </h2>

        <div style={styles.valuesGrid}>
          {[
            {
              num: '01',
              title: 'AUTHENTICITY',
              desc: 'No gimmicks, no shortcuts. Every piece we make carries real intent. We don\'t follow trends — we set the tone.',
              icon: '◆',
            },
            {
              num: '02',
              title: 'COMMUNITY',
              desc: 'HYOW is bigger than clothing. It\'s a collective of creators, dreamers, and hustlers who lift each other up.',
              icon: '◆',
            },
            {
              num: '03',
              title: 'RESILIENCE',
              desc: 'Holding your own means standing tall when the world pushes back. Our designs are a reminder: you\'re built for this.',
              icon: '◆',
            },
          ].map((value, i) => (
            <div key={i} style={styles.valueCard}>
              <div style={styles.valueHeader}>
                <span style={styles.valueNum}>{value.num}</span>
                <span style={styles.valueIcon}>{value.icon}</span>
              </div>
              <h3 style={styles.valueTitle}>{value.title}</h3>
              <p style={styles.valueDesc}>{value.desc}</p>
              <div style={styles.valueUnderline} />
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE / MILESTONES ──────────── */}
      <section style={styles.timelineSection}>
        <span style={styles.sectionTag}>THE JOURNEY</span>
        <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '60px' }}>
          From Vision to Movement
        </h2>

        <div style={styles.timeline}>
          {[
            { year: '2024', title: 'The Beginning', desc: 'Hold Your Own launches with a debut capsule collection. The message spreads.' },
            { year: '2024', title: 'Community Forms', desc: '10,000+ community members join the movement. First ambassador program launches.' },
            { year: '2025', title: 'Expanding Reach', desc: 'International orders hit 50+ countries. Limited drops sell out in minutes.' },
            { year: '2025', title: 'What\'s Next', desc: 'New collaborations, exclusive drops, and community events. The best is still ahead.' },
          ].map((item, i) => (
            <div key={i} style={{
              ...styles.timelineItem,
              flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
            }}>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>{item.year}</span>
                <h3 style={styles.timelineTitle}>{item.title}</h3>
                <p style={styles.timelineDesc}>{item.desc}</p>
              </div>
              <div style={styles.timelineDot}>
                <div style={styles.timelineDotInner} />
              </div>
              <div style={{ flex: 1 }} />
            </div>
          ))}
          {/* Vertical line */}
          <div style={styles.timelineLine} />
        </div>
      </section>

      {/* ── CTA ────────────────────────────── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>READY TO HOLD YOUR OWN?</h2>
          <p style={styles.ctaSub}>
            Join the movement. Wear your story. Build your legacy.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/products" style={styles.ctaPrimary}>
              SHOP THE COLLECTION →
            </Link>
            <Link to="/contact" style={styles.ctaSecondary}>
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles — inline for single-file portability
   Uses the HYOW dark + gold palette
   ───────────────────────────────────────────── */
const gold = '#C8A84E';
const goldDim = 'rgba(200, 168, 78, 0.15)';
const dark = '#0A0A0A';
const darkCard = '#111111';
const darkBorder = '#1a1a1a';
const textPrimary = '#FFFFFF';
const textSecondary = 'rgba(255, 255, 255, 0.6)';
const textMuted = 'rgba(255, 255, 255, 0.4)';

const styles = {
  /* Page container */
  page: {
    backgroundColor: dark,
    color: textPrimary,
    minHeight: '100vh',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    overflowX: 'hidden',
  },

  /* ── HERO ── */
  hero: {
    position: 'relative',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 24px 80px',
    background: `
      radial-gradient(ellipse at 20% 50%, rgba(200, 168, 78, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(200, 168, 78, 0.05) 0%, transparent 50%),
      linear-gradient(180deg, ${dark} 0%, #0d0d0d 100%)
    `,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: '800px',
  },
  heroPre: {
    display: 'inline-block',
    fontSize: '13px',
    letterSpacing: '4px',
    color: gold,
    marginBottom: '24px',
    fontWeight: 500,
    padding: '8px 20px',
    border: `1px solid ${gold}`,
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 7vw, 5rem)',
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    margin: '24px 0',
    textTransform: 'uppercase',
  },
  heroAccent: {
    color: gold,
    display: 'block',
  },
  heroSub: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    lineHeight: 1.7,
    color: textSecondary,
    maxWidth: '580px',
    margin: '0 auto',
    fontWeight: 300,
  },
  heroSideAccent: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1px',
    height: '200px',
    background: `linear-gradient(transparent, ${gold}, transparent)`,
    opacity: 0.3,
  },

  /* ── STORY ── */
  storySection: {
    padding: '100px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '80px',
    alignItems: 'center',
  },
  storyVisual: {
    aspectRatio: '3 / 4',
    background: `linear-gradient(135deg, ${darkCard} 0%, #1a1a1a 100%)`,
    border: `1px solid ${darkBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  storyVisualInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  storyVisualText: {
    fontSize: '4rem',
    fontWeight: 900,
    letterSpacing: '0.15em',
    color: 'rgba(200, 168, 78, 0.12)',
    userSelect: 'none',
  },
  storyVisualLine: {
    width: '60px',
    height: '1px',
    background: gold,
    opacity: 0.4,
  },
  storyVisualYear: {
    fontSize: '14px',
    letterSpacing: '3px',
    color: textMuted,
  },
  storyText: {
    padding: '20px 0',
  },
  sectionTag: {
    display: 'inline-block',
    fontSize: '12px',
    letterSpacing: '3px',
    color: gold,
    marginBottom: '20px',
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: '32px',
    letterSpacing: '-0.01em',
  },
  bodyText: {
    fontSize: '1.05rem',
    lineHeight: 1.8,
    color: textSecondary,
    marginBottom: '20px',
    fontWeight: 300,
  },

  /* ── STATS ── */
  statsSection: {
    padding: '60px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  statsDivider: {
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${darkBorder}, transparent)`,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
    padding: '60px 0',
    textAlign: 'center',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statNumber: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 700,
    color: gold,
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '13px',
    letterSpacing: '2px',
    color: textMuted,
    textTransform: 'uppercase',
    fontWeight: 400,
  },

  /* ── VALUES ── */
  valuesSection: {
    padding: '100px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  valueCard: {
    background: darkCard,
    border: `1px solid ${darkBorder}`,
    padding: '40px 32px',
    position: 'relative',
    transition: 'border-color 0.3s ease, transform 0.3s ease',
  },
  valueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  valueNum: {
    fontSize: '14px',
    color: gold,
    letterSpacing: '2px',
    fontWeight: 600,
  },
  valueIcon: {
    color: gold,
    fontSize: '10px',
    opacity: 0.5,
  },
  valueTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  valueDesc: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: textSecondary,
    fontWeight: 300,
  },
  valueUnderline: {
    marginTop: '28px',
    height: '2px',
    width: '40px',
    background: gold,
    opacity: 0.4,
  },

  /* ── TIMELINE ── */
  timelineSection: {
    padding: '100px 24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  timeline: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  timelineContent: {
    flex: 1,
    padding: '24px',
    background: darkCard,
    border: `1px solid ${darkBorder}`,
  },
  timelineYear: {
    fontSize: '13px',
    letterSpacing: '3px',
    color: gold,
    fontWeight: 600,
  },
  timelineTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: '8px 0 12px',
    letterSpacing: '0.02em',
  },
  timelineDesc: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: textSecondary,
    fontWeight: 300,
  },
  timelineDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: `2px solid ${gold}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 2,
    background: dark,
  },
  timelineDotInner: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: gold,
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: '0',
    bottom: '0',
    width: '1px',
    background: `linear-gradient(180deg, transparent, ${darkBorder}, transparent)`,
    transform: 'translateX(-50%)',
    zIndex: 1,
  },

  /* ── CTA ── */
  ctaSection: {
    padding: '120px 24px',
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(200, 168, 78, 0.06) 0%, transparent 60%),
      ${dark}
    `,
    textAlign: 'center',
  },
  ctaInner: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 800,
    letterSpacing: '0.04em',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  ctaSub: {
    fontSize: '1.1rem',
    color: textSecondary,
    marginBottom: '40px',
    fontWeight: 300,
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 36px',
    background: gold,
    color: '#000',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '2px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 36px',
    background: 'transparent',
    color: textPrimary,
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '2px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
};

/* ─────────────────────────────────────────────
   Responsive styles via CSS-in-JS media query
   injected once on mount
   ───────────────────────────────────────────── */
const responsiveCSS = `
  @media (max-width: 768px) {
    /* Stack the story grid on mobile */
    .hyow-about-story-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }
    /* Stack stats to 2x2 */
    .hyow-about-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 32px !important;
    }
    /* Stack values */
    .hyow-about-values-grid {
      grid-template-columns: 1fr !important;
    }
    /* Timeline: always left-aligned on mobile */
    .hyow-about-timeline-item {
      flex-direction: row !important;
    }
    /* Hide the decorative visual on small screens */
    .hyow-about-story-visual {
      display: none !important;
    }
  }
`;

/* Inject responsive styles once */
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('hyow-about-responsive');
  if (!existingStyle) {
    const styleEl = document.createElement('style');
    styleEl.id = 'hyow-about-responsive';
    styleEl.textContent = responsiveCSS;
    document.head.appendChild(styleEl);
  }
}

/* ─────────────────────────────────────────────
   Wrapper that applies CSS class names for
   responsive overrides (className won't work
   on inline-styled divs without this pattern)
   ───────────────────────────────────────────── */
const AboutPageWrapper = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.page}>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={{
          ...styles.heroContent,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <span style={styles.heroPre}>EST. 2024</span>
          <h1 style={styles.heroTitle}>
            FROM THE CONCRETE<br />
            <span style={styles.heroAccent}>TO THE CULTURE</span>
          </h1>
          <p style={styles.heroSub}>
            Hold Your Own isn't just a brand — it's a declaration. Born in the streets,
            built for the ones who refuse to be defined by where they came from.
          </p>
        </div>
        <div style={styles.heroSideAccent} />
      </section>

      {/* ── ORIGIN STORY ── */}
      <section style={styles.storySection}>
        <div className="hyow-about-story-grid" style={styles.storyGrid}>
          <div className="hyow-about-story-visual" style={styles.storyVisual}>
            <div style={styles.storyVisualInner}>
              <span style={styles.storyVisualText}>HYOW</span>
              <div style={styles.storyVisualLine} />
              <span style={styles.storyVisualYear}>2024</span>
            </div>
          </div>
          <div style={styles.storyText}>
            <span style={styles.sectionTag}>OUR STORY</span>
            <h2 style={styles.sectionTitle}>Built Different.<br />On Purpose.</h2>
            <p style={styles.bodyText}>
              Hold Your Own was created for the ones who move with intention.
              Every stitch, every thread, every design carries a message: you don't
              need permission to be great. You just need the will to hold your own.
            </p>
            <p style={styles.bodyText}>
              We started with a simple idea — streetwear that speaks louder than logos.
              Pieces that tell your story before you say a word. From limited drops to
              community-first events, everything we do is rooted in authenticity.
            </p>
            <p style={styles.bodyText}>
              This isn't fast fashion. This is your armor. Designed to last,
              built to make a statement.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsDivider} />
        <div className="hyow-about-stats-grid" style={styles.statsGrid}>
          <AnimatedStat end={10} suffix="K+" label="Community Members" />
          <AnimatedStat end={50} suffix="+" label="States & Countries" />
          <AnimatedStat end={100} suffix="%" label="Authentic" />
          <AnimatedStat end={24} suffix="/7" label="Hustle Mentality" />
        </div>
        <div style={styles.statsDivider} />
      </section>

      {/* ── VALUES ── */}
      <section style={styles.valuesSection}>
        <div style={{ textAlign: 'center' }}>
          <span style={styles.sectionTag}>WHAT WE STAND FOR</span>
          <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '60px' }}>
            Three Pillars. One Movement.
          </h2>
        </div>
        <div className="hyow-about-values-grid" style={styles.valuesGrid}>
          {[
            {
              num: '01',
              title: 'AUTHENTICITY',
              desc: 'No gimmicks, no shortcuts. Every piece we make carries real intent. We don\'t follow trends — we set the tone.',
            },
            {
              num: '02',
              title: 'COMMUNITY',
              desc: 'HYOW is bigger than clothing. It\'s a collective of creators, dreamers, and hustlers who lift each other up.',
            },
            {
              num: '03',
              title: 'RESILIENCE',
              desc: 'Holding your own means standing tall when the world pushes back. Our designs are a reminder: you\'re built for this.',
            },
          ].map((value, i) => (
            <div key={i} style={styles.valueCard}>
              <div style={styles.valueHeader}>
                <span style={styles.valueNum}>{value.num}</span>
                <span style={styles.valueIcon}>◆</span>
              </div>
              <h3 style={styles.valueTitle}>{value.title}</h3>
              <p style={styles.valueDesc}>{value.desc}</p>
              <div style={styles.valueUnderline} />
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={styles.timelineSection}>
        <div style={{ textAlign: 'center' }}>
          <span style={styles.sectionTag}>THE JOURNEY</span>
          <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: '60px' }}>
            From Vision to Movement
          </h2>
        </div>
        <div style={styles.timeline}>
          {[
            { year: '2024', title: 'The Beginning', desc: 'Hold Your Own launches with a debut capsule collection. The message spreads.' },
            { year: '2024', title: 'Community Forms', desc: '10,000+ community members join the movement. First ambassador program launches.' },
            { year: '2025', title: 'Expanding Reach', desc: 'International orders hit 50+ countries. Limited drops sell out in minutes.' },
            { year: '2025', title: 'What\'s Next', desc: 'New collaborations, exclusive drops, and community events. The best is still ahead.' },
          ].map((item, i) => (
            <div key={i} className="hyow-about-timeline-item" style={{
              ...styles.timelineItem,
              flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
            }}>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>{item.year}</span>
                <h3 style={styles.timelineTitle}>{item.title}</h3>
                <p style={styles.timelineDesc}>{item.desc}</p>
              </div>
              <div style={styles.timelineDot}>
                <div style={styles.timelineDotInner} />
              </div>
              <div style={{ flex: 1 }} />
            </div>
          ))}
          <div style={styles.timelineLine} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>READY TO HOLD YOUR OWN?</h2>
          <p style={styles.ctaSub}>
            Join the movement. Wear your story. Build your legacy.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/products" style={styles.ctaPrimary}>
              SHOP THE COLLECTION →
            </Link>
            <Link to="/contact" style={styles.ctaSecondary}>
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPageWrapper;
