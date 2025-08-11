import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f14',
        panel: '#0f1620',
        primary: '#4cc9f0',
        accent: '#f72585',
        muted: '#a2b2c3',
      },
    },
  },
  plugins: [],
};

export default config;


