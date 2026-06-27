export const portfolioData = {
  profile: {
    displayName: '诺米styxia',
    role: 'AI-assisted Game Creator',
    subtitle: 'TapTap Maker Developer / Visual Editor Builder / Game UI Creator',
    level: 'Lv.1 Creator',
    note: '在还不熟悉世界的规则时，我先试着把自己的世界搭起来。',
    tags: ['TapTap Maker', 'Vibe Coding', 'Figma', '画世界', 'Cursor', 'Codex'],
    intro: [
      '我通过一个持续迭代的 TapTap Maker 项目，探索 AI 协作游戏开发。',
      '我关注游戏编辑器、关卡工具链和内容生产流程。',
    ],
  },
  heroActions: [
    { label: '开始探索', href: '#project' },
    { label: 'Demo', href: '#tapmaker-demo' },
    { label: 'Visual Editor', href: '#tools-editor' },
    { label: 'Art Gallery', href: '#gallery' },
    { label: 'AI Workflow', href: '#tools-ai' },
    { label: '联系我', href: '#contact' },
  ],
  mainProject: {
    title: '幻界行者·序章',
    summary: [
      '《幻界行者·序章》最初来自聚光灯 Game Jam 后期的一个小尝试：把自己的二次元形象做进游戏里。',
      '这个想法没能赶在 Jam 期间完成，却在后来继续生长，逐渐成为一个基于 TapTap Maker 开发的 2D 横版二次元平台跳跃 Demo。',
      '为了更高效地制作关卡、调试机制并配合 AI 修改配置，我也围绕它搭建了一套可视化编辑器与 AI 协作流程。',
    ],
    demo: {
      title: '关卡实机演示',
      linkLabel: '试玩序章',
      href: 'https://maker.taptap.cn/shares/nwvov6',
      subtitle: 'A TapTap Maker Platformer Demo',
      summary: '2D 横版平台跳跃 Demo，以角色移动、关卡探索与场景氛围为核心，展示《幻界行者·序章》的早期可玩版本。',
      facts: [
        { label: '类型', value: '2D Platformer' },
        { label: '平台', value: 'TapTap Maker' },
        { label: '版本', value: 'Prologue Demo' },
        { label: '内容', value: '关卡 / 角色 / 美术场景 / 基础机制' },
      ],
    },
    editor: {
      title: '可视化关卡编辑器',
      subtitle: 'Visual Level Editor',
      linkLabel: '打开编辑器试玩',
      href: 'https://maker.taptap.cn/shares/2xciak',
      postHref: 'https://www.taptap.cn/moment/819633959469057257',
      postLabel: '查看完整展示帖',
      summary:
        '为了更快地制作《幻界行者·序章》的关卡与机关，我在项目内搭建了一个可视化关卡编辑器。它用于编辑关卡物件、属性参数、节点逻辑与预览效果，让关卡制作从手动改配置逐渐变成可视化操作流程。',
      videoTitle: '关卡工程拆解',
      videoSummary:
        '展示《幻界行者·序章》中交互机关背后的编辑器工程：从关卡对象、属性配置到 NodeCanvas 节点逻辑，再到预览中的实际效果。',
      features: [
        '关卡对象',
        '属性配置',
        'NodeCanvas',
        '机关逻辑',
        '实时预览',
        'AI Sync',
      ],
    },
    workflow: [
      'AI Sync',
      'Event -> Intent -> Patch',
      'Diff / Snapshot / Backup',
      'Agent-assisted config editing',
    ],
    skill: {
      title: 'Editor Architecture Skill',
      href: '#',
      summary:
        '这是对编辑器架构、迁移实验和避坑经验的整理，更适合作为设计参考，而不是一键复制的工具。',
    },
  },
  gallery: {
    categories: [
      {
        label: '动态效果',
        value: 'motion',
        note: '界面太安静？那就让它动起来。视频、序列帧、Spine 风格动画、NanoVG 实时重绘，都是让画面开始呼吸的办法。',
      },
      {
        label: '游戏界面',
        value: 'game-ui',
        note: '每个场景都像是这个小世界里的一段故事。现在是这样，未来也会继续长出新的页面和新的旅程。',
      },
      {
        label: '人物素材',
        value: 'character',
        note: '这个角色既是游戏里的主角，也是我自己的投影。角色设计：十年前的诺米，现在的诺米，未来的诺米！',
      },
      {
        label: '手绘作品',
        value: 'hand-drawn-ui',
        note: '和游戏创作一样，美术创作也常常只是从一个很小的想法开始。即使 AI 小伙伴们不在，也不妨碍我亲手把想法变成现实。',
      },
    ],
  },
  process: [
    {
      title: '素材准备',
      detail: '场景、角色、UI 等美术素材先被整理出来，成为这个小世界最早的视觉基础。',
    },
    {
      title: '可视化编辑器',
      detail: '编辑器把我和 AI 的关卡修改汇到同一条数据路径里，对象、属性和节点图都能留下可追踪的操作痕迹。',
    },
    {
      title: 'AI 协作流程',
      detail: '通过日志通道与增量协议，Agent 可以读取编辑器改动、同步配置，并归档 Diff 与 Snapshot 方便后续回溯。',
    },
    {
      title: '社区分享',
      detail: '经过迁移与复用实验后，这套经验被整理成架构说明、同步协议和 Skill，并应几位创作者的需求在社区分享上传。',
    },
  ],
  contact: {
    email: '2379721464@qq.com',
    github: 'https://github.com/NormiStyxia',
    tapmakerHome: 'https://www.taptap.cn/user/776318709',
    bilibiliHome: 'https://space.bilibili.com/1472218776?spm_id_from=333.1387.0.0',
    gameDemo: 'https://maker.taptap.cn/shares/nwvov6',
    visualEditor: 'https://maker.taptap.cn/shares/2xciak',
  },
};
