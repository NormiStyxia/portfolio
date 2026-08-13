const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

/**
 * @typedef {Object} Media
 * @property {'image' | 'video' | 'diagram'} type
 * @property {string=} src
 * @property {string=} poster
 * @property {string} alt
 * @property {string=} caption
 * @property {number} width
 * @property {number} height
 * @property {string} aspectRatio
 * @property {'eager' | 'lazy' | 'interaction'} load
 * @property {string=} placeholder
 * @property {'newton' | 'anchor' | 'crimson' | 'archive'=} tone
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} index
 * @property {string} title
 * @property {string=} englishTitle
 * @property {string} year
 * @property {string} duration
 * @property {string[]} role
 * @property {string=} platform
 * @property {string=} engine
 * @property {string=} context
 * @property {string=} metaDuration
 * @property {{role?: string, duration?: string, engine?: string, context?: string}=} metaLabels
 * @property {string} summary
 * @property {string} coreIdea
 * @property {string[]} contributions
 * @property {string} accent
 * @property {Media} heroMedia
 * @property {{caseStudy?: string, demo?: string, tapTap?: string, tapTapLabel?: string}} links
 */

/** @type {Project[]} */
export const projects = [
  {
    id: 'newton-ignore',
    index: '01',
    title: '不经典力学',
    englishTitle: 'NEWTONignore',
    year: '2026',
    duration: '21 天',
    role: ['游戏设计', '关卡设计', '视觉设计'],
    platform: 'TapTap Maker',
    engine: 'UrhoX',
    context: '制造新星Game Jam第二期',
    summary: '最开始只是贴合主题“牛顿看了想打人”，想做个靠反物理规则把苹果送到终点的小游戏，顺便把自己一直在做的学院世界观塞进来一点。后来越做越觉得，“违反物理”本身不难，难的是怎么让玩家知道自己到底把世界改成了什么样，也让他们真的认识我设计的这些角色。于是卡牌、牛顿拳、聊天记录式教学、路径回放，还有那个天天被玩家戳来戳去、卡关时还能被拖来救场的绿毛同事，就这么一点点做出来了。',
    coreIdea: '修改重力、弹性与冲量，让“失控”成为一套可解释的规则。',
    contributions: ['核心规则与关卡', '教学与防卡关', '视觉、UI 与编辑器'],
    accent: '#7B583A',
    heroMedia: {
      type: 'video',
      src: assetUrl('assets/portfolio/videos/newtonignore-home.mp4'),
      poster: assetUrl('assets/portfolio/videos/newtonignore-home.jpg'),
      alt: '不经典力学 NEWTONignore 实际玩法演示视频',
      caption: '实际玩法 / NEWTONignore',
      width: 1280,
      height: 568,
      aspectRatio: '160 / 71',
      load: 'eager',
      tone: 'newton',
    },
    links: {
      tapTap: 'https://tap.cn/l8ZeRf9vP',
    },
  },
  {
    id: 'anchor-maze',
    index: '02',
    title: 'Anchor Maze',
    year: '2026',
    duration: '48 小时',
    role: ['游戏设计', '系统设计', 'AI-native 工作流'],
    platform: 'CIGA Game Jam',
    context: '2026CIGA Game Jam',
    summary: '题目《Anchor》出来以后，我没有往物理意义上的“船锚”去想，反而正好想到了 HTML 里的锚点。于是参照网页的源码和页面，把解谜做成了两个世界之间的状态对齐，Anchor、Redirect、Route 这些原本属于网页的数据也被直接拿来做关卡。做到后面才发现，既然关卡本身就是一份能被完整描述的数据，那 LLM 也可以直接读它、写它，甚至帮玩家解。这个项目也是我第一次很明确地意识到：可以让 Agent 直接理解关卡和标准解，再生成下一步解法指引实装进游戏，而不是人工一条条配置教程。数据结构本身，也可以成为玩法。',
    coreIdea: 'Data is the game — 让 LLM 能生成、读取并协助解决关卡。',
    contributions: ['Page / Code 双层玩法', 'LLM 关卡与标准解', '状态检测与下一步提示'],
    accent: '#315D78',
    heroMedia: {
      type: 'video',
      src: assetUrl('assets/portfolio/videos/anchor-maze-home.mp4'),
      poster: assetUrl('assets/portfolio/videos/anchor-maze-home.jpg'),
      alt: 'Anchor Maze Page 与 Code 双层世界实际玩法演示视频',
      caption: '实际玩法 / Page × Code',
      width: 1280,
      height: 744,
      aspectRatio: '160 / 93',
      load: 'interaction',
      tone: 'anchor',
    },
    links: {
      tapTap: 'https://tap.cn/ltMnNlQk4',
    },
  },
  {
    id: 'crimson-leap',
    index: '03',
    title: '绯红之跃',
    englishTitle: 'Crimson Leap',
    year: '2026',
    duration: '21 Days',
    role: ['游戏设计', '视觉设计', '程序化视觉'],
    platform: 'TapTap Maker',
    engine: 'UrhoX',
    context: 'TapTap Maker Game Jam',
    metaLabels: {
      role: '职责',
      duration: '周期',
      engine: '引擎',
      context: '项目背景',
    },
    metaDuration: '21 天',
    summary: '这次的主题是“跳跃”，我做了一个可以留下 Echo，再和它换位的机制。关卡做着做着，角色和 Echo 之间的位置关系也慢慢变成了几何谜题。美术反而是后来被工具逼出来的：当时引擎能做的渲染效果很有限，Echo 的实现也不是靠 Mask，而是用一张全屏背景、一个镂空区域，再加上背景里大量白色矩形去拼。后来我干脆继续沿着这套做法往下走，比如通关时让画面里的白色矩形全部崩解、移动，再重新组合成下一关。最后这些原本只是为了绕开限制的办法，反而慢慢变成了游戏最明显的视觉风格。',
    coreIdea: 'Echo 机制 × 几何变换 × 程序化视觉。',
    contributions: ['Echo 放置与换位', '几何平台谜题', '红黑白程序化视觉'],
    accent: '#963C3C',
    heroMedia: {
      type: 'video',
      src: assetUrl('assets/portfolio/videos/crimson-leap-home.mp4'),
      poster: assetUrl('assets/portfolio/videos/crimson-leap-home.jpg'),
      alt: '绯红之跃 Echo 机制与平台解谜实际玩法演示视频',
      caption: '实际玩法 / Echo × Geometry',
      width: 1280,
      height: 698,
      aspectRatio: '640 / 349',
      load: 'interaction',
      tone: 'crimson',
    },
    links: {
      tapTap: 'https://tap.cn/lwhdGdb0o',
    },
  },
  {
    id: 'realm-walker-prologue',
    index: '04',
    title: '幻界行者·序章',
    englishTitle: 'Archive / Origin',
    year: '2026',
    duration: 'Early Exploration',
    metaDuration: '早期探索',
    role: ['UI', '动效', '角色视觉', '编辑器探索'],
    platform: 'TapTap Maker',
    engine: 'TapTap Maker / UrhoX',
    context: 'TapTap Maker',
    metaLabels: {
      role: '职责',
      duration: '阶段',
      engine: '引擎',
      context: '项目背景',
    },
    summary: '这是我最早的尝试，把一个二次元游戏从角色、界面一路做到动画和工具的项目。最开始只是想让角色页、任务页和场景切换看起来更像一个完整游戏，于是开始试类 Spine 动画、序列帧状态切换和各种 UI 转场。后来又觉得很多东西每次手调太麻烦，干脆开始做自己的可视化编辑器。现在回头看，它本身没有后面的几个项目完整，但后来一直在用的动画状态、编辑器和 AI 辅助工作流，很多都是从这里第一次冒出来的。',
    coreIdea: '很多后来一直在用的做法，都是在这个项目里第一次试出来的。',
    contributions: ['角色与界面动效', '序列帧状态探索', '早期可视化编辑器'],
    accent: '#4A6698',
    heroMedia: {
      type: 'video',
      src: assetUrl('assets/portfolio/videos/realm-walker-home.mp4'),
      poster: assetUrl('assets/portfolio/videos/realm-walker-home.jpg'),
      alt: '幻界行者·序章早期角色、界面与动画实际演示视频',
      caption: '早期项目影像 / Archive',
      width: 1280,
      height: 720,
      aspectRatio: '16 / 9',
      load: 'interaction',
      tone: 'archive',
    },
    links: {
      tapTap: 'https://maker.taptap.cn/shares/nwvov6',
      tapTapLabel: 'TapTap试玩',
    },
  },
];

export const tools = [
  {
    index: '01',
    title: 'Runtime Visual Editor',
    detail: 'Node / Trigger / Executor',
    usedIn: '幻界行者 → NEWTONignore',
  },
  {
    index: '02',
    title: 'Event → Intent → Patch',
    detail: '增量 Agent 工作流',
    usedIn: '跨项目',
  },
  {
    index: '03',
    title: 'Level Data Schema',
    detail: 'LLM 可读的关卡数据结构',
    usedIn: 'Anchor Maze / NEWTONignore',
  },
  {
    index: '04',
    title: 'Standard Solution / Replay',
    detail: '基于状态的提示与防卡关',
    usedIn: 'Anchor Maze / NEWTONignore',
  },
  {
    index: '05',
    title: 'UGC / Cloud Draft',
    detail: '创作基础设施',
    usedIn: 'NEWTONignore',
  },
];
