import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'oxdoc',
  tagline: 'Native-speed TypeScript/JavaScript API Documentation Generator',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://oxdoc.vercel.app',
  baseUrl: '/',

  organizationName: 'jiji-hoon96',
  projectName: 'oxdoc',

  onBrokenLinks: 'throw',

  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/jiji-hoon96/oxdoc/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/jiji-hoon96/oxdoc/tree/main/docs/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'beta',
      content: 'oxdoc is in active development. <a href="https://github.com/jiji-hoon96/oxdoc" target="_blank" rel="noopener noreferrer">Star us on GitHub</a>!',
      isCloseable: true,
    },
    navbar: {
      title: 'oxdoc',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/jiji-hoon96/oxdoc',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Getting Started', to: '/docs/guides/getting-started'},
            {label: 'CLI Reference', to: '/docs/guides/cli-reference'},
            {label: 'Configuration', to: '/docs/guides/configuration'},
            {label: 'Output Formats', to: '/docs/guides/output-formats'},
            {label: 'Plugin API', to: '/docs/guides/plugin-api'},
            {label: 'CI Integration', to: '/docs/guides/ci-integration'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Benchmarks', to: '/docs/guides/benchmarks'},
            {label: 'Blog', to: '/blog'},
            {label: 'Architecture Decisions', to: '/docs/adr/oxc-parser'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/jiji-hoon96/oxdoc'},
            {label: 'Issues', href: 'https://github.com/jiji-hoon96/oxdoc/issues'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} oxdoc — Native-speed API documentation generator`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
