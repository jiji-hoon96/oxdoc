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

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
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
          href: 'https://github.com/jiji-hoon96/oxdoc',
          label: 'GitHub',
          position: 'right',
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
            {label: 'CI Integration', to: '/docs/guides/ci-integration'},
          ],
        },
        {
          title: 'Resources',
          items: [
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
