const { description } = require("../../package");

module.exports = {
  title: "揭秘V8内存神秘面纱",

  description: description,

  base: "/v8-memory-mechanism/",

  head: [
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" }
    ]
  ],

  themeConfig: {
    // repo: "DLGDark/v8-memory-mechanism",
    editLinks: false,
    docsDir: "docs",
    editLinkText: "",
    lastUpdated: false,
    sidebarDepth: 2, // 最大的深度为 2，它将同时提取 h2 和 h3 标题。即不仅显示h1,h2级，还会显示包含h3级组成的侧边栏
    // displayAllHeaders: true, // 设置为 true 来显示所有页面的标题链接
    nav: [
      {
        text: "正文",
        link: "/start/"
      },
      {
        text: "拓展阅读",
        link: "/furtherReading/"
      },
      {
        text: "关于",
        link: "/about/"
      }
    ],
    sidebar: {
      "/start/": [
        {
          title: "正文",
          children: [
            "",
            "MemoryLimit",
            "ObjectAllocation",
            "GarbageCollection",
            "ViewGarbageCollectionLog"
          ]
        }
      ],
      "/furtherReading/": [
        {
          title: "拓展阅读",
          children: [
            "",
          ]
        }
      ],
      "/about/": [
        {
          title: "关于",
          children: [
            ""
          ]
        }
      ]
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: ["@vuepress/plugin-back-to-top", "@vuepress/plugin-medium-zoom"]
};
