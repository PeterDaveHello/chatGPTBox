import baidu from './baidu'
import bilibili from './bilibili'
import youtube from './youtube'
import github from './github'
import gitlab from './gitlab'
import zhihu from './zhihu'
import reddit from './reddit'
import quora from './quora'
import stackoverflow from './stackoverflow'
import juejin from './juejin'
import weixin from './weixin'
import followin from './followin'
import duckduckgo from './duckduckgo'
import brave from './brave'

/**
 * @typedef {object} SiteConfigAction
 * @property {function} init
 */
/**
 * @typedef {object} SiteConfig
 * @property {string[]|function} inputQuery - for search box
 * @property {string[]} sidebarContainerQuery - prepend child to
 * @property {string[]} appendContainerQuery - if sidebarContainer not exists, append child to
 * @property {string[]} resultsContainerQuery - prepend child to if insertAtTop is true
 * @property {SiteConfigAction} action
 */
/**
 * @type {Object.<string,SiteConfig>}
 */
export const config = {
  Google: {
    inputQuery: ["input[name='q']", "textarea[name='q']"],
    sidebarContainerQuery: ['#rhs'],
    appendContainerQuery: ['#rcnt'],
    resultsContainerQuery: ['#rso'],
  },
  Bing: {
    inputQuery: ["[name='q']"],
    sidebarContainerQuery: ['#b_context'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#b_results'],
  },
  Yahoo: {
    inputQuery: ["input[name='p']"],
    sidebarContainerQuery: ['#right', '.Contents__inner.Contents__inner--sub'],
    appendContainerQuery: ['#cols', '#contents__wrap'],
    resultsContainerQuery: [
      '#main-algo',
      '.searchCenterMiddle',
      '.Contents__inner.Contents__inner--main',
      '#contentsInner',
    ],
  },
  DuckDuckGo: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: ['.js-react-sidebar', '.react-results--sidebar'],
    appendContainerQuery: ['#links_wrapper'],
    resultsContainerQuery: ['.react-results--main'],
    action: {
      init: duckduckgo.init,
    },
  },
  Startpage: {
    inputQuery: ["input[name='query']"],
    sidebarContainerQuery: ['.layout-web__sidebar.layout-web__sidebar--web'],
    appendContainerQuery: ['.layout-web__body.layout-web__body--desktop'],
    resultsContainerQuery: ['.mainline-results'],
  },
  Baidu: {
    inputQuery: ["input[id='kw']"],
    sidebarContainerQuery: ['#content_right'],
    appendContainerQuery: ['#container'],
    resultsContainerQuery: ['#content_left', '#results'],
    action: {
      init: baidu.init,
    },
  },
  Kagi: {
    inputQuery: ["textarea[name='q']"],
    sidebarContainerQuery: ['.right-content-box'],
    appendContainerQuery: ['#_0_app_content'],
    resultsContainerQuery: ['#main', '#app'],
  },
  Yandex: {
    inputQuery: ["input[name='text']"],
    sidebarContainerQuery: ['#search-result-aside'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#search-result'],
  },
  Naver: {
    inputQuery: ["input[name='query']"],
    sidebarContainerQuery: ['#sub_pack'],
    appendContainerQuery: ['#content'],
    resultsContainerQuery: ['#main_pack', '#ct'],
  },
  Brave: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: ['.sidebar'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#results'],
    action: {
      init: brave.init,
    },
  },
  Searx: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: ['#sidebar_results', '#sidebar'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#urls', '#main_results', '#results'],
  },
  Ecosia: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: ['.sidebar.web__sidebar'],
    appendContainerQuery: ['#main'],
    resultsContainerQuery: ['.mainline'],
  },
  Neeva: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: ['.result-group-layout__stickyContainer-iDIO8'],
    appendContainerQuery: ['.search-index__searchHeaderContainer-2JD6q'],
    resultsContainerQuery: ['.result-group-layout__component-1jzTe', '#search'],
  },
  Presearch: {
    inputQuery: ["input[name='q']"],
    sidebarContainerQuery: [
      'div.w-full.\\32 lg\\:flex.\\32 lg\\:flex-row-reverse.\\32 lg\\:justify-end > div.flex.flex-col > div.z-1',
    ],
    appendContainerQuery: [],
    resultsContainerQuery: ['div.text-gray-300.relative.z-1'],
  },
  Bilibili: {
    inputQuery: bilibili.inputQuery,
    sidebarContainerQuery: ['#danmukuBox'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#danmukuBox'],
    action: {
      init: bilibili.init,
    },
  },
  YouTube: {
    inputQuery: youtube.inputQuery,
    sidebarContainerQuery: [
      '#secondary:not([style*="display: none"]):not(.ytd-two-column-browse-results-renderer)',
    ],
    appendContainerQuery: [],
    resultsContainerQuery: [
      '#secondary:not([style*="display: none"]):not(.ytd-two-column-browse-results-renderer)',
    ],
    action: {
      init: youtube.init,
    },
  },
  GitHub: {
    inputQuery: github.inputQuery,
    sidebarContainerQuery: ['#diff', '.commit', '.Layout-main'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#diff', '.commit', '.Layout-main'],
    action: {
      init: github.init,
    },
  },
  GitLab: {
    inputQuery: gitlab.inputQuery,
    sidebarContainerQuery: ['.info-well', '.js-commit-box-info'],
    appendContainerQuery: [],
    resultsContainerQuery: ['.info-well', '.js-commit-box-info'],
  },
  Zhihu: {
    inputQuery: zhihu.inputQuery,
    sidebarContainerQuery: ['.Question-sideColumn', '.Post-Header', '.Question-main'],
    appendContainerQuery: [],
    resultsContainerQuery: ['.Question-sideColumn', '.Post-Header', '.Question-main'],
  },
  Reddit: {
    inputQuery: reddit.inputQuery,
    sidebarContainerQuery: ['aside > div'],
    appendContainerQuery: [],
    resultsContainerQuery: ['aside > div'],
  },
  Quora: {
    inputQuery: quora.inputQuery,
    sidebarContainerQuery: ['.q-box.PageContentsLayout___StyledBox-d2uxks-0'],
    appendContainerQuery: [],
    resultsContainerQuery: ['.q-box.PageContentsLayout___StyledBox-d2uxks-0'],
  },
  StackOverflow: {
    inputQuery: stackoverflow.inputQuery,
    sidebarContainerQuery: ['#sidebar'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#sidebar'],
  },
  Juejin: {
    inputQuery: juejin.inputQuery,
    sidebarContainerQuery: ['div.sidebar'],
    appendContainerQuery: [],
    resultsContainerQuery: ['div.main-area.article-area > article > div.article-content'],
  },
  Weixin: {
    inputQuery: weixin.inputQuery,
    sidebarContainerQuery: ['.qr_code_pc', '#js_content'],
    appendContainerQuery: [],
    resultsContainerQuery: ['#js_content'],
  },
  Followin: {
    inputQuery: followin.inputQuery,
    sidebarContainerQuery: [],
    appendContainerQuery: [],
    resultsContainerQuery: ['#article-content', '#thead-gallery'],
  },
}
