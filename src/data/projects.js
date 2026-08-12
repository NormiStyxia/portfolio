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
 * @property {string} summary
 * @property {string} coreIdea
 * @property {string[]} contributions
 * @property {string} accent
 * @property {Media} heroMedia
 * @property {{caseStudy?: string, demo?: string, tapTap?: string}} links
 */

/** @type {Project[]} */
export const projects = [
  {
    id: 'newton-ignore',
    index: '01',
    title: '不经典力学',
    englishTitle: 'NEWTONignore',
    year: '2026',
    duration: '21 Days',
    role: ['Game Design', 'Level Design', 'Visual', 'Tooling'],
    platform: 'TapTap Maker',
    summary: '用可组合的物理规则，把一次发射变成能够阅读、推演与修正的解谜过程。',
    coreIdea: '修改重力、弹性与冲量，让“失控”成为一套可解释的规则。',
    contributions: ['核心规则与关卡', '教学与防卡关', '视觉、UI 与编辑器'],
    accent: '#7B583A',
    heroMedia: {
      type: 'diagram',
      alt: 'NEWTONignore 16:9 首页主媒体开发占位',
      caption: 'Flagship hero media / 16:9',
      width: 1600,
      height: 900,
      aspectRatio: '16 / 9',
      load: 'eager',
      placeholder: 'NEWTONignore / 16:9',
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
    duration: '48 Hours',
    role: ['Game Design', 'System Design', 'AI-native Workflow'],
    platform: 'CIGA Game Jam',
    summary: 'Page 与 Code 是同一座迷宫：链接、锚点和路由数据就是玩家直接操作的世界。',
    coreIdea: 'Data is the game — 让 LLM 能生成、读取并协助解决关卡。',
    contributions: ['Page / Code 双层玩法', 'LLM 关卡与标准解', '状态检测与下一步提示'],
    accent: '#315D78',
    heroMedia: {
      type: 'diagram',
      alt: 'Anchor Maze 首页媒体开发占位',
      caption: 'Page × Code / project media',
      width: 1400,
      height: 900,
      aspectRatio: '14 / 9',
      load: 'lazy',
      placeholder: 'ANCHOR MAZE / PAGE × CODE',
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
    role: ['Game Design', 'Visual Design', 'Programmatic Visual'],
    platform: 'TapTap Maker',
    summary: '放置 Echo、换位与同步，把角色过去的位置变成解谜中的几何支点。',
    coreIdea: 'Echo 机制 × 几何变换 × 程序化视觉。',
    contributions: ['Echo 放置与换位', '几何平台谜题', '红黑白程序化视觉'],
    accent: '#963C3C',
    heroMedia: {
      type: 'diagram',
      alt: '绯红之跃首页媒体开发占位',
      caption: 'Echo × Geometry / project media',
      width: 1280,
      height: 820,
      aspectRatio: '64 / 41',
      load: 'lazy',
      placeholder: 'CRIMSON LEAP / ECHO × GEOMETRY',
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
    role: ['UI & Motion', 'Character Visual', 'Editor Origin'],
    platform: 'TapTap Maker',
    summary: '动画、UI 与可视化编辑器探索的起点；它解释后续工具链从哪里生长出来。',
    coreIdea: '能力发展的源头，而不是与前三个项目争夺旗舰位置。',
    contributions: ['角色与界面动效', '序列帧状态探索', '早期可视化编辑器'],
    accent: '#4A6698',
    heroMedia: {
      type: 'image',
      src: assetUrl('assets/portfolio/game-main.png'),
      alt: '幻界行者·序章紫藤庭院游戏主界面',
      caption: 'Early project archive · retained V1 asset',
      width: 1920,
      height: 1080,
      aspectRatio: '16 / 9',
      load: 'lazy',
      tone: 'archive',
    },
    links: {},
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
