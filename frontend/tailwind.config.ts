import type { Config } from 'tailwindcss';

/**
 * Design system próprio do sistema de chamados.
 *
 * Paleta: "signal" é a cor de marca (azul-petróleo profundo, remete a
 * consoles operacionais de TI, não ao roxo/azul genérico de SaaS).
 * "ink" é a escala neutra, com leve viés azulado em vez de cinza puro.
 * As cores semânticas de status/prioridade usam tons próprios, não os
 * defaults do Tailwind (blue-500, red-500, etc).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6f8',
          100: '#e6eaee',
          200: '#ccd4dc',
          300: '#a6b3c0',
          400: '#78899b',
          500: '#576a7d',
          600: '#435265',
          700: '#374252',
          800: '#2b3340',
          900: '#1b212a',
          950: '#101419',
        },
        signal: {
          50: '#eefbfa',
          100: '#d3f4f1',
          200: '#a8e8e3',
          300: '#71d5cf',
          400: '#3fb8b3',
          500: '#249a97',
          600: '#187b7c',
          700: '#166366',
          800: '#164f52',
          900: '#154245',
          950: '#08282b',
        },
        status: {
          aberto: '#c2620a',
          'aberto-bg': '#fdf1e2',
          andamento: '#1d5fbf',
          'andamento-bg': '#e7f0fd',
          resolvido: '#1a8a5f',
          'resolvido-bg': '#e4f6ee',
          fechado: '#5b6472',
          'fechado-bg': '#eef0f3',
        },
        priority: {
          baixa: '#4f7a3f',
          media: '#1d5fbf',
          alta: '#c2620a',
          critica: '#c22a2a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.0625rem', { lineHeight: '1.6rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.9rem', { lineHeight: '2.3rem' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 20 25 / 0.05), 0 1px 3px 0 rgb(16 20 25 / 0.06)',
        popover: '0 8px 24px -4px rgb(16 20 25 / 0.15)',
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
