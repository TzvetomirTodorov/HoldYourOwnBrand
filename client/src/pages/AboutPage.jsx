import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// ABOUT PAGE - HYOW BRAND STORY
// Tells the journey from Harlem streets to California dreams
// The meaning behind "Hold Your Own" - empowerment, resilience, authenticity
// ============================================================================

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background elements */}
      <div style={styles.backgroundPattern}>
        <BackgroundSVG />
      </div>

      {/* ================================================================== */}
      {/* HERO SECTION - Opening Statement                                  */}
      {/* ================================================================== */}
      <section style={styles.heroSection}>
        <div style={styles.heroBackground}>
          <HeroBackgroundSVG />
        </div>
        <div style={styles.heroContent}>
          <span style={styles.heroLabel}>OUR STORY</span>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroLine1}>FROM HARLEM</span>
            <span style={styles.heroLine2}>TO THE WORLD</span>
          </h1>
          <p style={styles.heroTagline}>
            A journey of resilience. A legacy of self-belief.<br />
            This is what it means to Hold Your Own.
          </p>
          <div style={styles.scrollPrompt}>
            <div style={styles.scrollIcon}>
              <ScrollIcon />
            </div>
            <span style={styles.scrollText}>Discover Our Journey</span>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE BEGINNING - Harlem Roots                                      */}
      {/* ================================================================== */}
      <section 
        id="beginning" 
        ref={addToRefs}
        style={{
          ...styles.storySection,
          opacity: visibleSections.has('beginning') ? 1 : 0,
          transform: visibleSections.has('beginning') ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <span style={styles.chapterNumber}>01</span>
            <h2 style={styles.sectionTitle}>THE BEGINNING</h2>
            <div style={styles.sectionDivider}></div>
          </div>
          
          <div style={styles.storyContent}>
            <div style={styles.storyImageWrapper}>
              <HarlemSVG />
            </div>
            <div style={styles.storyText}>
              <h3 style={styles.storySubtitle}>Harlem, New York</h3>
              <p style={styles.paragraph}>
                In the heart of Harlem, where dreams are forged in the crucible of city streets 
                and ambition echoes through every corner, HYOW was born. Not in a boardroom. 
                Not from market research. But from the raw, unfiltered experiences of growing up 
                in one of America's most storied neighborhoods.
              </p>
              <p style={styles.paragraph}>
                The streets taught us lessons no classroom ever could—about resilience when 
                the odds are stacked against you, about standing tall when the world tries to 
                make you small, about finding beauty and strength in struggle. These weren't 
                just life lessons. They became the foundation of everything we create.
              </p>
              <blockquote style={styles.blockquote}>
                "Every piece we design carries the spirit of those Harlem streets—the hustle, 
                the heart, the unshakeable belief that you can be anything you dare to become."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE MEANING - What "Hold Your Own" Represents                     */}
      {/* ================================================================== */}
      <section 
        id="meaning" 
        ref={addToRefs}
        style={{
          ...styles.storySection,
          ...styles.altBackground,
          opacity: visibleSections.has('meaning') ? 1 : 0,
          transform: visibleSections.has('meaning') ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <span style={styles.chapterNumber}>02</span>
            <h2 style={styles.sectionTitle}>THE MEANING</h2>
            <div style={styles.sectionDivider}></div>
          </div>
          
          <div style={styles.meaningContainer}>
            <h3 style={styles.meaningTitle}>HOLD YOUR OWN</h3>
            <p style={styles.meaningDefinition}>
              /hōld yôr ōn/ <span style={styles.definitionType}>phrase</span>
            </p>
            
            <div style={styles.meaningGrid}>
              <div style={styles.meaningCard}>
                <div style={styles.meaningIcon}>
                  <CrownIcon />
                </div>
                <h4 style={styles.meaningCardTitle}>Self-Sovereignty</h4>
                <p style={styles.meaningCardText}>
                  To own your decisions, your path, your identity. No one defines you 
                  but you. Your crown, your rules.
                </p>
              </div>
              
              <div style={styles.meaningCard}>
                <div style={styles.meaningIcon}>
                  <ShieldIcon />
                </div>
                <h4 style={styles.meaningCardTitle}>Resilience</h4>
                <p style={styles.meaningCardText}>
                  To stand firm when challenges arise. To bend but never break. 
                  To turn obstacles into stepping stones.
                </p>
              </div>
              
              <div style={styles.meaningCard}>
                <div style={styles.meaningIcon}>
                  <FireIcon />
                </div>
                <h4 style={styles.meaningCardTitle}>Authenticity</h4>
                <p style={styles.meaningCardText}>
                  To be unapologetically yourself. No masks. No pretense. 
                  Just the raw, real you.
                </p>
              </div>
              
              <div style={styles.meaningCard}>
                <div style={styles.meaningIcon}>
                  <StarIcon />
                </div>
                <h4 style={styles.meaningCardTitle}>Legacy</h4>
                <p style={styles.meaningCardText}>
                  To build something that lasts. To leave your mark. 
                  To create a story worth telling.
                </p>
              </div>
            </div>
            
            <p style={styles.meaningClosing}>
              When you Hold Your Own, you're not just wearing clothes. You're wearing 
              a declaration. A statement that says: <em>"I know who I am, I know where 
              I'm going, and nothing can stop me."</em>
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE JOURNEY - From East to West                                   */}
      {/* ================================================================== */}
      <section 
        id="journey" 
        ref={addToRefs}
        style={{
          ...styles.storySection,
          opacity: visibleSections.has('journey') ? 1 : 0,
          transform: visibleSections.has('journey') ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <span style={styles.chapterNumber}>03</span>
            <h2 style={styles.sectionTitle}>THE JOURNEY</h2>
            <div style={styles.sectionDivider}></div>
          </div>
          
          <div style={styles.journeyTimeline}>
            <div style={styles.timelineLine}></div>
            
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>THE SPARK</span>
                <h4 style={styles.timelineTitle}>Harlem Streets</h4>
                <p style={styles.timelineText}>
                  Every journey starts with a single step. Ours started on the blocks of 
                  Harlem, where style wasn't just fashion—it was identity, survival, expression. 
                  We watched how people transformed themselves through what they wore, how a 
                  fresh fit could change how you walked, talked, and moved through the world.
                </p>
              </div>
            </div>
            
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>THE VISION</span>
                <h4 style={styles.timelineTitle}>A Dream Takes Shape</h4>
                <p style={styles.timelineText}>
                  The vision was clear: create something that spoke to the dreamers, the 
                  hustlers, the ones who came from nothing but refused to be defined by it. 
                  Not luxury for luxury's sake, but quality that respects the hustle it 
                  took to afford it.
                </p>
              </div>
            </div>
            
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>THE MOVE</span>
                <h4 style={styles.timelineTitle}>California Dreaming</h4>
                <p style={styles.timelineText}>
                  The move to California wasn't running from something—it was running toward 
                  everything. The West Coast brought new perspectives, new influences, new 
                  energy. But the Harlem DNA never left. It fused with California's laid-back 
                  confidence to create something entirely new.
                </p>
              </div>
            </div>
            
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineYear}>TODAY</span>
                <h4 style={styles.timelineTitle}>Building the Legacy</h4>
                <p style={styles.timelineText}>
                  Today, HYOW stands as a bridge between coasts, cultures, and generations. 
                  Every stitch carries the weight of our journey. Every design tells a story. 
                  And every person who wears our pieces becomes part of something bigger than 
                  fashion—they become part of a movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE CRAFT - Our Approach                                          */}
      {/* ================================================================== */}
      <section 
        id="craft" 
        ref={addToRefs}
        style={{
          ...styles.storySection,
          ...styles.altBackground,
          opacity: visibleSections.has('craft') ? 1 : 0,
          transform: visibleSections.has('craft') ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <span style={styles.chapterNumber}>04</span>
            <h2 style={styles.sectionTitle}>THE CRAFT</h2>
            <div style={styles.sectionDivider}></div>
          </div>
          
          <div style={styles.craftContent}>
            <p style={styles.craftIntro}>
              We don't make clothes. We craft statements. Every piece in our collection 
              goes through a process that honors both the art of fashion and the people 
              who wear it.
            </p>
            
            <div style={styles.craftGrid}>
              <div style={styles.craftItem}>
                <span style={styles.craftNumber}>01</span>
                <h4 style={styles.craftTitle}>Premium Materials</h4>
                <p style={styles.craftText}>
                  We source only the finest fabrics—materials that feel as good as they look, 
                  that hold up to real life, that get better with every wear.
                </p>
              </div>
              
              <div style={styles.craftItem}>
                <span style={styles.craftNumber}>02</span>
                <h4 style={styles.craftTitle}>Intentional Design</h4>
                <p style={styles.craftText}>
                  Every detail is deliberate. From the weight of a zipper to the placement 
                  of a seam, nothing is accidental. Form follows function follows feeling.
                </p>
              </div>
              
              <div style={styles.craftItem}>
                <span style={styles.craftNumber}>03</span>
                <h4 style={styles.craftTitle}>Small Batch Production</h4>
                <p style={styles.craftText}>
                  We produce in limited quantities. Not as a marketing gimmick, but because 
                  quality control matters. Each piece gets the attention it deserves.
                </p>
              </div>
              
              <div style={styles.craftItem}>
                <span style={styles.craftNumber}>04</span>
                <h4 style={styles.craftTitle}>Community Testing</h4>
                <p style={styles.craftText}>
                  Before anything hits our store, it's worn by our community. Real feedback 
                  from real people ensures every piece is ready for the streets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE COMMUNITY - Who We Serve                                      */}
      {/* ================================================================== */}
      <section 
        id="community" 
        ref={addToRefs}
        style={{
          ...styles.storySection,
          opacity: visibleSections.has('community') ? 1 : 0,
          transform: visibleSections.has('community') ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <span style={styles.chapterNumber}>05</span>
            <h2 style={styles.sectionTitle}>THE COMMUNITY</h2>
            <div style={styles.sectionDivider}></div>
          </div>
          
          <div style={styles.communityContent}>
            <h3 style={styles.communityTitle}>This Is For You</h3>
            <p style={styles.communityText}>
              HYOW is for the dreamers who do. The ones who didn't wait for permission 
              to chase what they wanted. The first-generation success stories. The 
              late-night hustlers. The ones who know what it's like to start from the 
              bottom and refuse to stay there.
            </p>
            <p style={styles.communityText}>
              We're not for everyone, and that's intentional. We're for the ones who 
              understand that clothes are more than fabric—they're armor. They're 
              confidence. They're a declaration of intent.
            </p>
            
            <div style={styles.communityValues}>
              <div style={styles.communityValue}>
                <span style={styles.valueNumber}>10K+</span>
                <span style={styles.valueLabel}>Community Members</span>
              </div>
              <div style={styles.communityValue}>
                <span style={styles.valueNumber}>50+</span>
                <span style={styles.valueLabel}>States & Countries</span>
              </div>
              <div style={styles.communityValue}>
                <span style={styles.valueNumber}>100%</span>
                <span style={styles.valueLabel}>Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CALL TO ACTION - Join the Movement                                */}
      {/* ================================================================== */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>READY TO HOLD YOUR OWN?</h2>
          <p style={styles.ctaText}>
            Join the movement. Wear your story. Build your legacy.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/shop" style={styles.ctaPrimary}>
              SHOP THE COLLECTION
              <ArrowIcon />
            </Link>
            <Link to="/contact" style={styles.ctaSecondary}>
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>

      {/* Global styles */}
      <style>{globalStyles}</style>
    </div>
  );
}

// ============================================================================
// SVG ICON COMPONENTS
// ============================================================================

function BackgroundSVG() {
  return (
    <svg viewBox="0 0 1920 1080" style={styles.backgroundSvg} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
      </defs>
      <rect fill="url(#bgGradient)" width="100%" height="100%" />
      <g opacity="0.03">
        {[...Array(20)].map((_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="1080" stroke="#D4AF37" strokeWidth="1" />
        ))}
        {[...Array(12)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="1920" y2={i * 100} stroke="#D4AF37" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}

function HeroBackgroundSVG() {
  return (
    <svg viewBox="0 0 1920 1080" style={styles.heroBackgroundSvg} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="50%" stopColor="#151515" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect fill="url(#heroGrad)" width="100%" height="100%" />
      
      {/* Abstract city skyline silhouette */}
      <g opacity="0.15">
        <rect x="100" y="600" width="60" height="480" fill="#D4AF37" />
        <rect x="180" y="500" width="80" height="580" fill="#D4AF37" />
        <rect x="280" y="650" width="50" height="430" fill="#D4AF37" />
        <rect x="350" y="450" width="100" height="630" fill="#D4AF37" />
        <rect x="470" y="550" width="70" height="530" fill="#D4AF37" />
        
        <rect x="1350" y="520" width="90" height="560" fill="#D4AF37" />
        <rect x="1460" y="600" width="60" height="480" fill="#D4AF37" />
        <rect x="1540" y="480" width="80" height="600" fill="#D4AF37" />
        <rect x="1640" y="580" width="70" height="500" fill="#D4AF37" />
        <rect x="1730" y="650" width="100" height="430" fill="#D4AF37" />
      </g>
      
      {/* Floating geometric elements */}
      <polygon points="960,150 1050,280 960,410 870,280" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.2" className="float-diamond" />
      <circle cx="200" cy="300" r="80" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.15" className="pulse-circle" />
      <circle cx="1700" cy="250" r="60" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.15" className="pulse-circle-delayed" />
    </svg>
  );
}

function HarlemSVG() {
  return (
    <svg viewBox="0 0 400 300" style={styles.storySvg}>
      <defs>
        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      {/* Brownstone buildings silhouette */}
      <rect x="20" y="120" width="70" height="180" fill="url(#buildingGrad)" />
      <rect x="25" y="130" width="15" height="20" fill="#0a0a0a" />
      <rect x="50" y="130" width="15" height="20" fill="#0a0a0a" />
      <rect x="25" y="160" width="15" height="20" fill="#0a0a0a" />
      <rect x="50" y="160" width="15" height="20" fill="#0a0a0a" />
      <rect x="25" y="190" width="15" height="20" fill="#0a0a0a" />
      <rect x="50" y="190" width="15" height="20" fill="#0a0a0a" />
      
      <rect x="100" y="80" width="80" height="220" fill="url(#buildingGrad)" />
      <rect x="110" y="90" width="20" height="30" fill="#0a0a0a" />
      <rect x="145" y="90" width="20" height="30" fill="#0a0a0a" />
      <rect x="110" y="130" width="20" height="30" fill="#0a0a0a" />
      <rect x="145" y="130" width="20" height="30" fill="#0a0a0a" />
      <rect x="110" y="170" width="20" height="30" fill="#0a0a0a" />
      <rect x="145" y="170" width="20" height="30" fill="#0a0a0a" />
      
      <rect x="190" y="100" width="60" height="200" fill="url(#buildingGrad)" />
      <rect x="200" y="110" width="12" height="18" fill="#0a0a0a" />
      <rect x="225" y="110" width="12" height="18" fill="#0a0a0a" />
      <rect x="200" y="140" width="12" height="18" fill="#0a0a0a" />
      <rect x="225" y="140" width="12" height="18" fill="#0a0a0a" />
      
      <rect x="260" y="60" width="90" height="240" fill="url(#buildingGrad)" />
      <rect x="275" y="75" width="18" height="25" fill="#0a0a0a" />
      <rect x="310" y="75" width="18" height="25" fill="#0a0a0a" />
      <rect x="275" y="115" width="18" height="25" fill="#0a0a0a" />
      <rect x="310" y="115" width="18" height="25" fill="#0a0a0a" />
      
      {/* Street level */}
      <rect x="0" y="300" width="400" height="5" fill="#D4AF37" opacity="0.3" />
      
      {/* Stars */}
      <circle cx="50" cy="30" r="2" fill="#D4AF37" opacity="0.6" />
      <circle cx="150" cy="20" r="1.5" fill="#D4AF37" opacity="0.5" />
      <circle cx="250" cy="35" r="2" fill="#D4AF37" opacity="0.7" />
      <circle cx="350" cy="25" r="1.5" fill="#D4AF37" opacity="0.4" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 40" style={{ width: '24px', height: '40px' }}>
      <rect x="1" y="1" width="22" height="38" rx="11" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#D4AF37" className="scroll-dot" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px' }}>
      <path d="M10 38 L10 22 L18 28 L25 15 L32 28 L40 22 L40 38 Z" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="25" cy="22" r="3" fill="#D4AF37" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px' }}>
      <path d="M25 5 L42 12 L42 25 C42 35 34 43 25 46 C16 43 8 35 8 25 L8 12 Z" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <polyline points="18 26 23 31 34 20" fill="none" stroke="#D4AF37" strokeWidth="2" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px' }}>
      <path d="M25 5 C32 14 38 20 38 30 C38 38 32 44 25 44 C18 44 12 38 12 30 C12 20 18 14 25 5 Z" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <path d="M25 22 C22 25 19 28 19 33 C19 36 22 39 25 39 C28 39 31 36 31 33 C31 28 28 25 25 22 Z" fill="#D4AF37" opacity="0.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 50 50" style={{ width: '50px', height: '50px' }}>
      <polygon points="25,5 30,20 46,20 33,30 38,45 25,35 12,45 17,30 4,20 20,20" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginLeft: '10px' }} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ============================================================================
// GLOBAL STYLES
// ============================================================================

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

  @keyframes floatDiamond {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    50% { transform: rotate(5deg) translateY(-15px); }
  }

  @keyframes pulseCircle {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.1); opacity: 0.25; }
  }

  @keyframes scrollDot {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(15px); opacity: 0.3; }
  }

  .float-diamond {
    animation: floatDiamond 8s ease-in-out infinite;
    transform-origin: center;
  }

  .pulse-circle {
    animation: pulseCircle 4s ease-in-out infinite;
  }

  .pulse-circle-delayed {
    animation: pulseCircle 4s ease-in-out infinite 2s;
  }

  .scroll-dot {
    animation: scrollDot 2s ease-in-out infinite;
  }
`;

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: "'Barlow', sans-serif",
    position: 'relative',
  },

  backgroundPattern: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },

  backgroundSvg: {
    width: '100%',
    height: '100%',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  heroBackgroundSvg: {
    width: '100%',
    height: '100%',
  },

  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '0 20px',
    maxWidth: '900px',
  },

  heroLabel: {
    display: 'inline-block',
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '0.3em',
    color: '#D4AF37',
    padding: '8px 20px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    marginBottom: '30px',
  },

  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(3rem, 10vw, 7rem)',
    fontWeight: 400,
    letterSpacing: '0.05em',
    lineHeight: 0.95,
    margin: 0,
  },

  heroLine1: {
    display: 'block',
    color: '#ffffff',
  },

  heroLine2: {
    display: 'block',
    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  heroTagline: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 300,
    letterSpacing: '0.05em',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '30px',
    lineHeight: 1.6,
  },

  scrollPrompt: {
    marginTop: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },

  scrollIcon: {
    opacity: 0.6,
  },

  scrollText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    color: 'rgba(212, 175, 55, 0.6)',
    textTransform: 'uppercase',
  },

  // Story Sections
  storySection: {
    position: 'relative',
    zIndex: 1,
    padding: '120px 20px',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
  },

  altBackground: {
    background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.5) 0%, rgba(10, 10, 10, 0.5) 100%)',
  },

  sectionContent: {
    maxWidth: '1100px',
    margin: '0 auto',
  },

  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },

  chapterNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1rem',
    letterSpacing: '0.3em',
    color: '#D4AF37',
    opacity: 0.6,
  },

  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: '10px 0 0 0',
  },

  sectionDivider: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
    margin: '25px auto 0',
  },

  // Story Content (Beginning section)
  storyContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '60px',
    alignItems: 'center',
  },

  storyImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },

  storySvg: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
  },

  storyText: {},

  storySubtitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#D4AF37',
    margin: '0 0 25px 0',
  },

  paragraph: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '20px',
  },

  blockquote: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.2rem',
    fontStyle: 'italic',
    lineHeight: 1.7,
    color: 'rgba(212, 175, 55, 0.9)',
    borderLeft: '3px solid #D4AF37',
    paddingLeft: '25px',
    margin: '30px 0 0 0',
  },

  // Meaning Section
  meaningContainer: {
    textAlign: 'center',
  },

  meaningTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 400,
    letterSpacing: '0.1em',
    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 10px 0',
  },

  meaningDefinition: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '50px',
  },

  definitionType: {
    fontStyle: 'italic',
    color: 'rgba(212, 175, 55, 0.6)',
  },

  meaningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    marginBottom: '50px',
  },

  meaningCard: {
    padding: '35px 25px',
    background: 'rgba(20, 20, 20, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    borderRadius: '4px',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },

  meaningIcon: {
    marginBottom: '20px',
  },

  meaningCardTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#D4AF37',
    margin: '0 0 15px 0',
  },

  meaningCardText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 300,
    lineHeight: 1.7,
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },

  meaningClosing: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '700px',
    margin: '0 auto',
  },

  // Journey Timeline
  journeyTimeline: {
    position: 'relative',
    paddingLeft: '60px',
  },

  timelineLine: {
    position: 'absolute',
    left: '15px',
    top: '10px',
    bottom: '10px',
    width: '2px',
    background: 'linear-gradient(180deg, #D4AF37, rgba(212, 175, 55, 0.1))',
  },

  timelineItem: {
    position: 'relative',
    marginBottom: '50px',
  },

  timelineDot: {
    position: 'absolute',
    left: '-52px',
    top: '5px',
    width: '14px',
    height: '14px',
    background: '#D4AF37',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
  },

  timelineContent: {
    paddingLeft: '20px',
  },

  timelineYear: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.2em',
    color: '#D4AF37',
    display: 'block',
    marginBottom: '8px',
  },

  timelineTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#ffffff',
    margin: '0 0 15px 0',
  },

  timelineText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
  },

  // Craft Section
  craftContent: {},

  craftIntro: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.15rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 50px',
  },

  craftGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },

  craftItem: {
    padding: '30px',
    background: 'rgba(10, 10, 10, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.08)',
    borderRadius: '4px',
  },

  craftNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '2rem',
    color: 'rgba(212, 175, 55, 0.3)',
    display: 'block',
    marginBottom: '15px',
  },

  craftTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#ffffff',
    margin: '0 0 12px 0',
  },

  craftText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 300,
    lineHeight: 1.7,
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },

  // Community Section
  communityContent: {
    textAlign: 'center',
  },

  communityTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '2rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: '#D4AF37',
    margin: '0 0 30px 0',
  },

  communityText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '700px',
    margin: '0 auto 25px',
  },

  communityValues: {
    display: 'flex',
    justifyContent: 'center',
    gap: '60px',
    marginTop: '50px',
    flexWrap: 'wrap',
  },

  communityValue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  valueNumber: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '3rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#D4AF37',
  },

  valueLabel: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '5px',
  },

  // CTA Section
  ctaSection: {
    position: 'relative',
    zIndex: 1,
    padding: '100px 20px',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, transparent 50%, rgba(212, 175, 55, 0.08) 100%)',
  },

  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
  },

  ctaTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: '0 0 20px 0',
  },

  ctaText: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '40px',
  },

  ctaButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
    color: '#0a0a0a',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },

  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 36px',
    background: 'transparent',
    color: '#D4AF37',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textDecoration: 'none',
    border: '1px solid #D4AF37',
    transition: 'all 0.3s ease',
  },
};
