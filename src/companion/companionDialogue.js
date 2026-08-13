export const companionIntroDialogue = {
  lines: [
    '你好，我是绿毛同事。',
    '这里是诺米的个人作品集，下面放着她这段时间做的一些游戏。',
    '我平时负责教程、提示，还有在项目快炸的时候被拖来救场。',
    '看项目的时候有哪里想多知道一点，就戳我。我可以补充说明，也可以带你去别的项目。',
    '如果我挡到你看文本了，把我拎起来往边上挪挪就好。',
  ],
  showProjectNavigation: false,
  autoAdvance: true,
};

export const companionDialogue = {
  hero: {
    first: [
      '想看哪个？我带路。',
    ],
    later: [
      ['想看哪个？我带路。'],
      ['不知道先看哪个的话，可以戳我。'],
      ['项目都在下面，我负责补充一点内部资料。'],
      ['又回来了？'],
      ['不知道看哪个的话，先看牛顿那个。毕竟我在那里工伤最多。'],
    ],
    showProjectNavigation: true,
  },
  newton: {
    first: [
      '这个最开始真的没这么大。',
      '主策说：‘就做个苹果到终点的小游戏。’后来有了规则卡、牛顿拳、聊天教程、回放、编辑器、UGC，还有我。',
      '我至今不知道‘简单’这个词在她那里是什么意思。',
    ],
    later: [
      ['顺带一提，我原本主要负责教程和卡关救场。后来玩家每天上线先来戳我……所以现在我也不知道谁才是核心玩法。'],
      ['你现在看到的是成品。开发现场不建议看。'],
    ],
  },
  anchor: {
    first: [
      '这个项目很像主策第一次发现：“原来不用把数据藏在游戏后面，数据自己就能当游戏。”',
      'Anchor、Redirect、Route 本来只是网页里的结构，最后全被她拖出来当机关用了。',
    ],
    later: [
      [
        '既然关卡和标准解都能写成数据，Agent 就可以直接读。',
        '提示系统不是人工一条条配的，是我们真的让模型看懂了玩家现在走到哪。',
      ],
      ['Data is the game。她后来是真的信了。'],
    ],
  },
  crimson: {
    first: [
      '很多后来被叫做‘视觉设计’的东西，最开始只是因为引擎做不到。',
      '没有想要的效果？那就拿矩形硬拼。拼着拼着，风格出来了。',
    ],
    later: [
      ['Echo 那个洞也没什么高级 Shader。全屏背景、镂空区域、一堆白色矩形。'],
      ['主策最擅长的不是“会不会”，是：这个表示方式不行，那换一个。'],
      ['原本是在绕限制，后来反而成了美术风格。'],
    ],
  },
  realmwalker: {
    first: [
      '这是考古现场。',
      '现在其他项目里那些角色动画、UI 转场、状态机、可视化编辑器……很多东西第一次冒头都在这里。',
      '当时她只是觉得：‘这个每次手调也太麻烦了。’然后开始造工具。',
    ],
    later: [
      ['它不是这里最完整的项目。但要问后面那堆东西到底从哪长出来的——嗯，病根在这。'],
      ['早期项目，建议以考古心态观看。'],
    ],
  },
  about: {
    first: ['我是项目里的同事，顺便兼职网站导航。'],
    later: [
      ['我只是负责补充一点幕后资料。'],
      ['页面上写的是结果，我这里偶尔讲讲过程。'],
      ['想多知道一点的话，再戳一下。'],
      ['主策负责想，剩下的……算了，你懂。'],
    ],
  },
};

export function getCompanionDialogue(context, visitCount, random = Math.random) {
  const dialogue = companionDialogue[context] || companionDialogue.about;

  if (visitCount === 0) {
    return {
      lines: dialogue.first,
      showProjectNavigation: dialogue.showProjectNavigation === true,
    };
  }

  const variants = dialogue.later?.length ? dialogue.later : [dialogue.first];
  const index = Math.min(variants.length - 1, Math.floor(random() * variants.length));

  return {
    lines: variants[index],
    showProjectNavigation: dialogue.showProjectNavigation === true,
  };
}
