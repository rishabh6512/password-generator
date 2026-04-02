module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                glass: 'rgba(255,255,255,0.06)',
                'glass-border': 'rgba(255,255,255,0.12)',
                accent1: '#7c5cff',
                accent2: '#4bc0ff'
            },
            animation: {
                "gradient-move": "gradientMove 1s linear infinite",
            },
            keyframes: {
                gradientMove: {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
            }
        }
    },
    plugins: []
};  