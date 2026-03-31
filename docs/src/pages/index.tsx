import {type ReactNode, useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HeroSection() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          Powered by OXC (Rust)
        </div>
        <h1 className={styles.heroTitle}>
          API docs at<br />native speed
        </h1>
        <p className={styles.heroSubtitle}>
          Blazing-fast TypeScript/JavaScript API doc generator powered by OXC parser.
          JSDoc extraction, coverage checks, and doc testing in one tool.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.heroButtonPrimary} to="/docs/intro">
            Get Started
          </Link>
          <Link
            className={styles.heroButtonSecondary}
            href="https://github.com/jiji-hoon96/oxdoc">
            GitHub
          </Link>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={`${styles.terminalDot} ${styles.terminalDotRed}`} />
            <span className={`${styles.terminalDot} ${styles.terminalDotYellow}`} />
            <span className={`${styles.terminalDot} ${styles.terminalDotGreen}`} />
          </div>
          <div className={styles.terminalBody}>
            <div>
              <span className={styles.terminalPrompt}>$ </span>
              <span className={styles.terminalCommand}>npx @jiji-hoon96/oxdoc coverage ./src --threshold 80</span>
            </div>
            <br />
            <div className={styles.terminalOutput}>
              {'  '}Documentation Coverage Report
            </div>
            <div className={styles.terminalOutput}>
              {'  '}Total symbols: {'    '}
              <span className={styles.terminalHighlight}>42</span>
            </div>
            <div className={styles.terminalOutput}>
              {'  '}Documented: {'      '}
              <span className={styles.terminalHighlight}>35</span>{'  '}(83.3%)
            </div>
            <br />
            <div>
              {'  '}
              <span className={styles.terminalSuccess}>{'✓'}</span>
              {' Coverage 83.3% meets threshold 80%'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const FEATURES: Array<{icon: string; title: string; description: string}> = [
  {
    icon: '⚡',
    title: 'OXC Native Parsing',
    description: '10-50x faster parsing via Rust NAPI bindings. Processes 5,000 files in under 1 second.',
  },
  {
    icon: '📊',
    title: 'Doc Coverage',
    description: 'Measures JSDoc coverage of exported symbols. Fail CI builds when coverage drops below threshold.',
  },
  {
    icon: '🧪',
    title: 'Doc Test',
    description: 'Executes @example code blocks to automatically verify that documentation stays in sync with code.',
  },
  {
    icon: '🤖',
    title: 'llms.txt Output',
    description: 'Auto-generates AI/LLM-optimized docs. Helps Copilot, Claude, and others understand your library accurately.',
  },
  {
    icon: '🔌',
    title: 'Plugin System',
    description: 'Extensible with 3 hooks: Transform, Output, and Analyzer. Add custom output formats and analysis rules.',
  },
  {
    icon: '👁',
    title: 'Watch Mode',
    description: 'Detects file changes and auto-regenerates docs. Preview documentation in real-time during development.',
  },
];

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.featuresTitle}>Everything in one tool</h2>
        <p className={styles.featuresSubtitle}>
          Generate docs, check coverage, and test examples — fast
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface BenchmarkItem {
  label: string;
  oxdoc: string;
  typedoc: string;
  oxdocWidth: string;
  typedocWidth: string;
  multiplier: string;
}

const REAL_WORLD_BENCHMARKS: BenchmarkItem[] = [
  {
    label: 'HTML Generation',
    oxdoc: '0.27s',
    typedoc: '2.36s',
    oxdocWidth: '11%',
    typedocWidth: '100%',
    multiplier: '8.7x faster',
  },
  {
    label: 'JSON Generation',
    oxdoc: '0.25s',
    typedoc: '1.46s',
    oxdocWidth: '17%',
    typedocWidth: '100%',
    multiplier: '5.8x faster',
  },
  {
    label: 'Memory Usage',
    oxdoc: '117MB',
    typedoc: '445MB',
    oxdocWidth: '26%',
    typedocWidth: '100%',
    multiplier: '3.8x less',
  },
];

const SCALE_BENCHMARKS: BenchmarkItem[] = [
  {
    label: 'Parse Time',
    oxdoc: '0.9s',
    typedoc: '~60s+',
    oxdocWidth: '2%',
    typedocWidth: '100%',
    multiplier: '66x faster',
  },
  {
    label: 'Memory Usage',
    oxdoc: '22MB',
    typedoc: '~2GB+',
    oxdocWidth: '1%',
    typedocWidth: '100%',
    multiplier: '90x less',
  },
];

function BenchmarkBar({item, animate}: {item: BenchmarkItem; animate: boolean}) {
  return (
    <div className={styles.benchmarkRow}>
      <div className={styles.benchmarkLabel}>{item.label}</div>
      <div className={styles.benchmarkBars}>
        <div className={styles.benchmarkBarGroup}>
          <span className={styles.benchmarkBarName}>oxdoc</span>
          <div className={styles.benchmarkBar}>
            <div
              className={`${styles.benchmarkBarFill} ${styles.benchmarkBarOxdoc} ${animate ? styles.benchmarkAnimate : ''}`}
              style={{'--bar-width': item.oxdocWidth} as React.CSSProperties}>
              {item.oxdoc}
            </div>
          </div>
        </div>
        <div className={styles.benchmarkBarGroup}>
          <span className={styles.benchmarkBarName}>TypeDoc</span>
          <div className={styles.benchmarkBar}>
            <div
              className={`${styles.benchmarkBarFill} ${styles.benchmarkBarTypedoc} ${animate ? styles.benchmarkAnimate : ''}`}
              style={{'--bar-width': item.typedocWidth} as React.CSSProperties}>
              {item.typedoc}
            </div>
          </div>
        </div>
        <div className={styles.benchmarkMultiplier}>{item.multiplier}</div>
      </div>
    </div>
  );
}

function BenchmarkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState<'real' | 'scale'>('real');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      {threshold: 0.2},
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Reset animation on tab change
  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const benchmarks = activeTab === 'real' ? REAL_WORLD_BENCHMARKS : SCALE_BENCHMARKS;

  return (
    <section className={styles.benchmark} ref={sectionRef}>
      <div className="container">
        <h2 className={styles.benchmarkTitle}>Benchmarks</h2>
        <p className={styles.benchmarkSubtitle}>
          Real performance comparisons against TypeDoc
        </p>

        <div className={styles.benchmarkTabs}>
          <button
            className={`${styles.benchmarkTab} ${activeTab === 'real' ? styles.benchmarkTabActive : ''}`}
            onClick={() => setActiveTab('real')}>
            es-toolkit (603 files)
          </button>
          <button
            className={`${styles.benchmarkTab} ${activeTab === 'scale' ? styles.benchmarkTabActive : ''}`}
            onClick={() => setActiveTab('scale')}>
            Large Scale (5,000 files)
          </button>
        </div>

        <div className={styles.benchmarkTable}>
          {benchmarks.map((item, idx) => (
            <BenchmarkBar key={`${activeTab}-${idx}`} item={item} animate={animate} />
          ))}
        </div>

        <p className={styles.benchmarkFootnote}>
          {activeTab === 'real'
            ? 'Measured on es-toolkit (603 source files). Run your own benchmarks with: pnpm bench'
            : 'Measured with 5,000 generated files / 15,000 symbols'}
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <h2 className={styles.ctaTitle}>Ready to generate docs at native speed?</h2>
        <div className={styles.ctaCode}>
          <code>npx @jiji-hoon96/oxdoc generate ./src --format html</code>
        </div>
        <Link className={styles.heroButtonPrimary} to="/docs/guides/getting-started">
          Read the docs
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Native-speed API Documentation"
      description="Blazing-fast TypeScript/JavaScript API documentation generator powered by OXC parser">
      <HeroSection />
      <FeaturesSection />
      <BenchmarkSection />
      <CTASection />
    </Layout>
  );
}
