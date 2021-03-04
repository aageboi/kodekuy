const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: '{k</>dekuy}',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['script', { src: 'https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js' }],
    ['script', { src: 'https://www.gstatic.com/firebasejs/8.2.9/firebase-auth.js' }],
    ['script', { src: 'https://www.gstatic.com/firebasejs/8.2.9/firebase-analytics.js' }],
    ['script', { src: 'https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.js' }],
    ['link', { href: 'https://www.gstatic.com/firebasejs/ui/4.6.1/firebase-ui-auth.css', type: 'text/css', rel: 'stylesheet' }],
    ['script', {}, `
    var firebaseConfig = {
      apiKey: "AIzaSyALfsHBqaD-UfuAQrDwDCOEZKgavOuk9DU",
      authDomain: "kodekuy.firebaseapp.com",
      projectId: "kodekuy",
      storageBucket: "kodekuy.appspot.com",
      messagingSenderId: "1056770028005",
      appId: "1:1056770028005:web:cbb0a9d8a3f770c5973f0c",
      measurementId: "G-T7Z53MESXF"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.disableAutoSignIn();
    `]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
        // items: [
        //   {
        //     text: 'A',
        //     link: '/'
        //   }
        // ]
      },
      {
        text: 'Config',
        link: '/config/'
      },
      {
        text: 'VuePress',
        link: '/vuepress/'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '',
            'using-vue',
          ]
        }
      ],
      '/source/': [
        {
          title: 'Source',
          collapsable: false,
          children: [
            ''
          ]
        }
      ]
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    // '@vuepress/nprogress'
  ]
}
