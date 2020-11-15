module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      gridTemplateRows: {
        10: 'repeat(10, minmax(0, 1fr))',
        // Complex site-specific row configuration
        layout: '200px minmax(900px, 1fr) 100px',
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/ui')],
};
