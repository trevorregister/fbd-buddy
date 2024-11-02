export default defineNuxtPlugin(() => {
      window.MathJax = {
            loader: {
                  load: ['[tex]/ams']
            },
            tex: {
                  inlineMath: [['$', '$'], ['\\(', '\\)']],
                  displayMath: [['$$', '$$'], ['\\[', '\\]']],
                  processEscapes: true,
                  packages: { '[+]': ['ams'] },
                  macros: {
                        vec: ['\\boldsymbol{#1}', 1]
                  }
            },
            svg: {
                  fontCache: 'global',
                  scale: 1.2
            },
            startup: {
                  ready: () => {
                        console.log("MathJax is ready");
                        MathJax.startup.defaultReady();
                        document.dispatchEvent(new Event('mathjax-ready'));
                  }
            }
      };

      // Load MathJax
      if (process.client && !document.getElementById('mathjax-script')) {
            const script = document.createElement('script');
            script.id = 'mathjax-script';
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
            script.async = true;
            document.head.appendChild(script);
      }
}); 