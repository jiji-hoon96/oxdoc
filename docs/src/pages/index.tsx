import type {ReactNode} from 'react';
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
          OXC 파서 기반 초고속 TypeScript/JavaScript API 문서 생성기.
          JSDoc 추출, 커버리지 체크, Doc Test를 하나의 도구로.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.heroButtonPrimary} to="/docs/intro">
            시작하기
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
              <span className={styles.terminalCommand}>npx oxdoc coverage ./src --threshold 80</span>
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
    title: 'OXC 네이티브 파싱',
    description: 'Rust NAPI 바인딩 기반 OXC 파서로 10-50x 빠른 파싱. 5,000파일을 1초 이내에 처리합니다.',
  },
  {
    icon: '📊',
    title: '문서 커버리지',
    description: 'export된 심볼의 JSDoc 문서화 비율을 측정. CI에서 threshold 미달 시 빌드 실패로 품질을 보장합니다.',
  },
  {
    icon: '🧪',
    title: 'Doc Test',
    description: '@example 블록의 코드를 실제로 실행하여 문서와 코드의 동기화를 자동 검증합니다.',
  },
  {
    icon: '🤖',
    title: 'llms.txt 출력',
    description: 'AI/LLM 최적화 문서 형식을 자동 생성. Copilot, Claude 등이 라이브러리를 정확하게 이해합니다.',
  },
  {
    icon: '🔌',
    title: '플러그인 시스템',
    description: 'Transform, Output, Analyzer 3가지 훅으로 확장 가능. 커스텀 출력 포맷과 분석 규칙을 추가하세요.',
  },
  {
    icon: '👁',
    title: 'Watch 모드',
    description: '파일 변경을 감지하여 문서를 자동 재생성. 개발 중 실시간으로 문서를 확인할 수 있습니다.',
  },
];

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.featuresTitle}>모든 것을 하나의 도구로</h2>
        <p className={styles.featuresSubtitle}>
          문서 생성, 커버리지 체크, 테스트를 빠르고 간편하게
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

function BenchmarkSection() {
  return (
    <section className={styles.benchmark}>
      <div className="container">
        <h2 className={styles.benchmarkTitle}>벤치마크</h2>
        <p className={styles.benchmarkSubtitle}>
          5,000 파일 / 15,000 심볼 기준
        </p>
        <div className={styles.benchmarkTable}>
          <div className={styles.benchmarkRow}>
            <div className={styles.benchmarkLabel}>oxdoc</div>
            <div className={styles.benchmarkBar}>
              <div
                className={`${styles.benchmarkBarFill} ${styles.benchmarkBarOxdoc}`}
                style={{width: '8%'}}>
                0.9s
              </div>
            </div>
          </div>
          <div className={styles.benchmarkRow}>
            <div className={styles.benchmarkLabel}>TypeDoc</div>
            <div className={styles.benchmarkBar}>
              <div
                className={`${styles.benchmarkBarFill} ${styles.benchmarkBarTypedoc}`}
                style={{width: '90%'}}>
                ~60s+
              </div>
            </div>
          </div>
          <div className={styles.benchmarkRow}>
            <div className={styles.benchmarkLabel}>Memory</div>
            <div className={styles.benchmarkBar}>
              <div
                className={`${styles.benchmarkBarFill} ${styles.benchmarkBarOxdoc}`}
                style={{width: '10%'}}>
                22MB
              </div>
              <span style={{color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem'}}>
                vs TypeDoc ~2GB+
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Native-speed API Documentation"
      description="OXC 파서 기반 초고속 TypeScript/JavaScript API 문서 생성기">
      <HeroSection />
      <FeaturesSection />
      <BenchmarkSection />
    </Layout>
  );
}
