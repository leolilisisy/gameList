(function () {
  const STORAGE_KEY = "site-language";

  const translations = {
    zh: {
      common: {
        toggleTheme: "切换主题",
        scrollToTop: "回到顶部",
        scrollToBottom: "滚动到底部",
        switchToChinese: "切换为中文",
        switchToEnglish: "切换为英文",
      },
      index: {
        title: "游戏展厅 | Web & Mobile Arcade",
        metaDescription: "统一展示原生 HTML/CSS/JS 小游戏与移动 H5 游戏的双语游戏门户。",
        mainNavigation: "主导航",
        logoHome: "统一游戏展厅首页",
        brandTitle: "游戏展厅",
        brandSubtitle: "Web & Mobile Arcade Portal",
        browseGames: "浏览游戏",
        login: "登录",
        heroEyebrow: "统一入口 · 双语展示 · 广告友好",
        heroTitle: "把两个小游戏仓库整合成一个真正可展示、可运营的游戏网站。",
        heroLead: "现在这个入口会统一展示原生 HTML/JS 小游戏和 Cocos Creator 移动 H5 游戏，并预留广告位、推荐位、专题区和移动端布局。",
        exploreCatalog: "进入游戏目录",
        browseFeatured: "查看精选专区",
        totalGames: "游戏总数",
        sourcesConnected: "已接入来源",
        mobileReady: "移动端优先内容",
        curatedEyebrow: "精选专题",
        curatedTitle: "本周推荐与高展示位内容",
        sponsoredTag: "站点焦点",
        adLabel: "广告位",
        adHeadline: "桌面横幅广告 / 活动合作 / 游戏联运入口",
        adCopy: "这里可以接入 Google AdSense、联盟广告、游戏下载推广、联运专题或品牌合作 Banner。",
        adCta: "查看展示位",
        unifiedSourceTitle: "统一内容源",
        unifiedSourceLead: "同一个入口展示原生小游戏和移动 H5 构建包",
        unifiedSourceBody: "现在首页不再区分两个项目的入口页面，而是统一为一个内容目录、同一套视觉系统和筛选逻辑。",
        localizationTitle: "中文优先",
        localizationLead: "站点层支持中英切换，适合展示、投放和继续扩展",
        localizationBody: "首页、入口说明、专题、广告位、来源标签和按钮文案都纳入了国际化能力，后续可以继续扩展到单个游戏页面。",
        monetizationTitle: "广告与运营预留",
        monetizationLead: "为横幅广告、原生广告、联运推荐和活动位预留结构",
        monetizationBody: "既能像游戏展示站一样阅读和试玩，也能逐步接入广告平台和商业合作内容。",
        gameFilters: "游戏筛选",
        searchGames: "搜索游戏",
        searchPlaceholder: "搜索游戏、标签、来源或玩法",
        gamesSuffix: "款游戏",
        featuredSuffix: "个精选位",
        filterAll: "全部",
        filterFeatured: "精选",
        filterMiniSource: "原生 JS",
        filterMobileSource: "移动 H5",
        filterArcade: "街机",
        filterPuzzle: "益智",
        filterMobileFriendly: "移动优先",
        catalogEyebrow: "统一目录",
        catalogTitle: "统一游戏展示入口",
        catalogBadge: "支持广告位与推荐位",
        catalogLead: "下方卡片会统一展示两个仓库里的游戏来源、平台信息、简介、标签和跳转入口。",
        emptyTitle: "暂时没有匹配结果",
        emptyBody: "可以清空搜索词，或切换到其他来源和分类筛选。",
        resetFilters: "重置筛选",
        proBadgesLabel: "游玩徽章",
        proBadgesTitle: "你的高手徽章",
        noBadges: "还没有形成高频游玩记录，开始试玩后这里会出现你的常玩游戏。",
        playsCount: "游玩 {count} 次",
        sourceBreakdownEyebrow: "来源分析",
        sourceBreakdownTitle: "内容来源与接入结构",
        sourceMini: "原生 HTML/CSS/JS 游戏",
        sourceMiniBody: "更适合阅读源码、继续维护和做页面级汉化。",
        sourceMobile: "移动 H5 / Cocos Creator 发布包",
        sourceMobileBody: "更适合统一展示、触屏访问和后续商业化承载。",
        adZoneEyebrow: "商业化",
        adZoneTitle: "侧边广告位",
        sidebarAdTitle: "300x250 展示广告",
        sidebarAdBody: "适合放置 AdSense、自有推广位、联运专题卡片或活动入口。",
        nativeAdTitle: "原生推荐广告",
        nativeAdBody: "可替换为“猜你喜欢”“热门下载”“专题推荐”等原生内容流广告。",
        mobileHighlightsEyebrow: "移动优先",
        mobileHighlightsTitle: "移动 H5 推荐",
        footerLead: "适合做游戏展示、专题推荐和广告承载的统一 Web 门户。",
        footerLink: "去 GitHub 参与贡献",
        playNow: "立即游玩",
        openInNewTab: "新标签打开",
        seeMoreGames: "查看更多",
        inlineAdTitle: "内容流广告位",
        inlineAdBody: "这里可以替换为原生广告、下载推广卡片或平台活动推荐。",
        categoryArcade: "街机",
        categoryPuzzle: "益智",
        categoryAction: "动作",
        categoryStrategy: "策略",
        categoryCasual: "休闲",
        categoryMusic: "音乐",
        categoryEducational: "教育",
        categoryBoard: "棋盘",
        platformBrowser: "浏览器",
        platformMobile: "移动端",
        platformCross: "双端",
      },
      login: {
        title: "Gamehub 登录",
        heading: "登录",
        subtitle: "欢迎回来！😊",
        email: "邮箱",
        password: "密码",
        rememberMe: "记住我",
        forgotPassword: "忘记密码？",
        signIn: "登录",
        noAccount: "还没有账号？",
        register: "注册",
        fillAll: "请填写所有字段。",
        invalidCredentials: "邮箱或密码不正确。",
      },
      register: {
        title: "Gamehub 注册",
        heading: "注册",
        subtitle: "欢迎加入！👋",
        username: "用户名",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        rememberMe: "记住我",
        submit: "注册",
        hasAccount: "已经有账号了？",
        login: "登录",
        fillAll: "请填写所有字段。",
        emailExists: "该邮箱已经注册过了。",
        signupSuccess: "注册成功！你现在已经登录。",
      },
      game2048: {
        title: "2048",
        score: "分数",
        newGame: "重新开始",
        boardLabel: "2048 游戏棋盘",
        instructions: "使用方向键或滑动来移动方块。合并数字，冲击 2048。",
        win: "你赢了！",
        gameOver: "游戏结束",
      },
      gameSnake: {
        title: "贪吃蛇",
        score: "分数",
        gameLabel: "贪吃蛇游戏画布",
        gameOver: "游戏结束！得分：{score}",
      },
      gamePong: {
        title: "乒乓对战",
        hint: "使用 W/S 控制左侧球拍，右侧可用上下键，或开启电脑对战模式。",
        boardLabel: "乒乓对战游戏区域",
        restart: "重新开始",
        playVsCpu: "与电脑对战（右侧球拍）",
        leftHint: "左侧 W / S",
        rightHint: "右侧 ↑ / ↓",
      },
      gameMemory: {
        title: "记忆翻牌",
        boardLabel: "记忆翻牌游戏棋盘",
        hint: "翻开卡片，找出所有相同的表情配对。",
        win: "你赢了！🎉",
      },
      gameReaction: {
        title: "反应速度测试",
        intro: "当区域变成绿色时尽快点击。抢跑会增加 250 毫秒惩罚。",
        startRound: "开始一轮",
        current: "当前：{value}",
        best: "最佳：{value}",
        placeholder: "点击开始按钮准备",
        waitGreen: "等待变绿...",
        tapNow: "快点！点击！",
        falseStart: "抢跑！+250 毫秒惩罚（总计：{value}）",
        reactionResult: "你的反应：{value}",
        recentTimes: "最近成绩",
        paused: "窗口失去焦点，游戏已暂停。",
        notAvailable: "--",
      },
      gameBrick: {
        title: "打砖块",
        score: "分数",
        lives: "生命",
        start: "开始游戏",
        playAgain: "再玩一次",
        ready: "点击开始体验！",
        win: "你赢了！🎉 最终得分：{score}",
        gameOver: "游戏结束！😭 最终得分：{score}",
      },
      gameSpace: {
        title: "太空射击",
        score: "分数",
        controls: "移动：← → 或 A/D ｜ 射击：空格",
        restart: "重新开始",
        gameOver: "游戏结束",
        restartHint: "点击“重新开始”再次挑战",
        canvasLabel: "太空射击游戏区域",
      },
      gameSpot: {
        title: "找不同",
        findAll: "找出全部",
        differences: "处不同",
        found: "已找到",
        timeLeft: "剩余时间",
        restart: "重新开始",
        originalAlt: "原图",
        diffAlt: "修改后的图片",
        timesUp: "时间到！你找到了 {found} / {total} 处不同。",
        success: "太棒了！你找到了全部不同之处！",
      },
      gameWhack: {
        title: "打地鼠",
        intro: "地鼠一出现就立刻点击。你只有 30 秒时间！",
        time: "时间",
        score: "分数",
        start: "开始游戏",
        boardLabel: "打地鼠游戏棋盘",
        hole: "洞口 {index}",
        startPrompt: "开始吧，尽可能多地打中地鼠。",
        niceHit: "漂亮的一击！",
        finished: "时间到！最终得分：{score}。",
        paused: "窗口失去焦点，游戏已暂停。",
      },
      game15Puzzle: {
        title: "15 拼图",
        shuffle: "打乱",
        autoSolve: "自动求解",
        boardLabel: "15 拼图棋盘",
        hint: "点击或轻触与空格相邻的方块进行移动，把 1 到 15 按顺序排好。",
        solved: "已完成！",
      },
      gameMath: {
        title: "数学挑战",
        score: "分数",
        timeLeft: "剩余时间",
        ready: "点击“开始游戏”开始答题！",
        answerPlaceholder: "输入你的答案",
        start: "开始游戏",
        submit: "提交答案",
        restart: "重新开始",
        solvePrompt: "请计算：{num1} {op} {num2}",
        correct: "✅ 回答正确！",
        wrong: "❌ 回答错误！正确答案是 {answer}",
        finished: "⏰ 时间到！你的最终得分是 {score}",
      },
      gameRunner: {
        title: "无尽跑酷",
        score: "分数",
        highScore: "最高分",
        restart: "重新开始",
        hint: "空格或上方向键跳跃，下方向键滑铲。",
      },
      gameBubble: {
        title: "泡泡射手",
        score: "分数",
        next: "下一个",
        level: "关卡",
        instructions: "点击或触摸瞄准并发射泡泡。连成 3 个或更多同色泡泡即可消除！",
        gameOver: "游戏结束",
        finalScore: "最终得分：{score}",
        restart: "重新开始",
        levelComplete: "本关完成！",
        nextLevel: "下一关",
      },
      gameTic: {
        title: "井字棋",
        restart: "重新开始",
        turn: "{player} 回合",
        win: "{player} 获胜！🎉",
        draw: "平局！",
      },
      gameFlappy: {
        title: "像素飞鸟",
        containerLabel: "Flappy Bird 游戏容器",
        startRestart: "开始 / 重开",
        pause: "暂停",
        resume: "继续",
        controls: "按空格、回车或点击屏幕让小鸟振翅。按 P 键暂停或继续。",
        score: "分数：{score}",
        footer: "为 Mini JS Games Hub 制作",
        startHint: "点击或按空格开始",
        gameOver: "游戏结束",
      },
      gameMines: {
        title: "扫雷",
        rows: "行数",
        cols: "列数",
        mines: "地雷数",
        start: "开始游戏",
        restart: "重新开始",
        win: "🎉 你赢了！",
        gameOver: "💥 游戏结束！",
      },
      gameSudoku: {
        title: "数独",
      },
      gameHangman: {
        title: "猜单词",
        subtitle: "在吊死小人之前猜出单词！",
        lives: "生命",
        guessed: "已猜过",
        newGame: "新游戏",
        giveUp: "放弃",
        helpTitle: "玩法说明",
        help1: "点击字母，或直接按键盘上的字母键进行猜测。",
        help2: "你一共有 6 次错误机会。",
        help3: "在生命耗尽之前猜出所有字母即可获胜。",
        back: "← 返回游戏中心",
        guessedNone: "—",
        win: "你赢了！🎉",
        lose: "你输了，答案是“{answer}”。",
        gaveUp: "已放弃，本题答案是“{answer}”。",
      },
      gameQuiz: {
        title: "选择题闯关",
        questionCount: "第 {current} / {total} 题",
        score: "分数：{score}",
        loading: "题目加载中...",
        next: "下一题 →",
        completed: "🎯 答题完成！",
        finalScore: "最终得分：{score} / {total}",
        playAgain: "再来一局 🔁",
      },
      gameCatch: {
        title: "接住小球",
        score: "分数",
        start: "开始游戏",
        playing: "游戏进行中...",
        gameOver: "游戏结束！你的最终得分是 {score}。",
      },
      gameMaze: {
        title: "迷宫冒险",
        hint: "使用方向键移动，找到绿色出口！",
        newMaze: "新迷宫",
        win: "你到达出口了！🎉",
      },
      gameColorGuess: {
        title: "颜色猜猜乐",
        targetColor: "目标颜色",
        easy: "简单 (3)",
        hard: "困难 (6)",
        newColors: "🎯 换一组颜色",
        score: "分数",
        timeLeft: "剩余时间",
        playAgain: "🔁 再玩一次",
        correct: "✅ 猜对了！",
        tryAgain: "❌ 再试一次！",
        timeout: "⏰ 时间到！最终得分：{score}",
      },
      gameConnect: {
        title: "四子连珠",
        player1Turn: "玩家 1 回合（红色）",
        player2Turn: "玩家 2 回合（黄色）",
        newGame: "新游戏",
        columnFull: "这一列已经满了！",
        win: "玩家 {player} 获胜！🎉",
        draw: "平局！🤝",
      },
    },
    en: {
      common: {
        toggleTheme: "Toggle theme",
        scrollToTop: "Scroll to top",
        scrollToBottom: "Scroll to bottom",
        switchToChinese: "Switch to Chinese",
        switchToEnglish: "Switch to English",
      },
      index: {
        title: "Game Showcase | Web & Mobile Arcade",
        metaDescription: "A bilingual portal that unifies raw HTML/JS games and mobile H5 releases in one showcase.",
        mainNavigation: "Main navigation",
        logoHome: "Unified game showcase home",
        brandTitle: "Game Showcase",
        brandSubtitle: "Web & Mobile Arcade Portal",
        browseGames: "Browse Games",
        login: "Login",
        heroEyebrow: "Unified portal · bilingual content · ad ready",
        heroTitle: "Turn two mini-game repositories into one showcase-ready, operations-friendly website.",
        heroLead: "This homepage now combines raw HTML/JS games and Cocos Creator mobile H5 builds, with space for ad units, featured content, editorial zones, and responsive layouts.",
        exploreCatalog: "Open Catalog",
        browseFeatured: "Browse Featured",
        totalGames: "Total Games",
        sourcesConnected: "Connected Sources",
        mobileReady: "Mobile-first Titles",
        curatedEyebrow: "Curated",
        curatedTitle: "Featured picks and high-visibility slots",
        sponsoredTag: "Site Spotlight",
        adLabel: "Ad Slot",
        adHeadline: "Desktop banner ads / campaign partnerships / distribution entries",
        adCopy: "This area is ready for Google AdSense, affiliate ads, game promotions, distribution campaigns, or branded banners.",
        adCta: "View Slots",
        unifiedSourceTitle: "Unified Sources",
        unifiedSourceLead: "One portal for raw browser games and mobile H5 builds",
        unifiedSourceBody: "The homepage no longer splits these projects into separate entrances. Everything is now rendered through one catalog, one visual system, and one set of filters.",
        localizationTitle: "Chinese-first",
        localizationLead: "Site-level bilingual support for showcasing, promotion, and future expansion",
        localizationBody: "Homepage copy, ad zones, source labels, sections, and controls are now internationalized and can be extended to individual game pages next.",
        monetizationTitle: "Monetization Ready",
        monetizationLead: "Prepared for banner ads, native content ads, distribution recommendations, and campaigns",
        monetizationBody: "The portal can work as both a readable game showcase and a monetizable content surface.",
        gameFilters: "Game filters",
        searchGames: "Search games",
        searchPlaceholder: "Search by game, tag, source, or play style",
        gamesSuffix: "games",
        featuredSuffix: "featured slots",
        filterAll: "All",
        filterFeatured: "Featured",
        filterMiniSource: "Raw JS",
        filterMobileSource: "Mobile H5",
        filterArcade: "Arcade",
        filterPuzzle: "Puzzle",
        filterMobileFriendly: "Mobile First",
        catalogEyebrow: "Unified Catalog",
        catalogTitle: "Single game entrance",
        catalogBadge: "Built for ads and editorial slots",
        catalogLead: "Cards below now present both repositories through a shared structure: source, platform, summary, tags, and launch actions.",
        emptyTitle: "No matching results",
        emptyBody: "Clear the search term or switch to another source or category filter.",
        resetFilters: "Reset Filters",
        proBadgesLabel: "Play badges",
        proBadgesTitle: "Your Player Badges",
        noBadges: "No high-frequency play history yet. Start opening games and this area will populate automatically.",
        playsCount: "{count} plays",
        sourceBreakdownEyebrow: "Source Breakdown",
        sourceBreakdownTitle: "Content sources and structure",
        sourceMini: "Raw HTML/CSS/JS games",
        sourceMiniBody: "Best for reading source code, extending features, and deeper localization work.",
        sourceMobile: "Mobile H5 / Cocos Creator builds",
        sourceMobileBody: "Best for unified showcasing, touch-first access, and monetization surfaces.",
        adZoneEyebrow: "Monetization",
        adZoneTitle: "Sidebar Ad Zone",
        sidebarAdTitle: "300x250 Display Ad",
        sidebarAdBody: "Suitable for AdSense, house promotions, distribution campaigns, or event cards.",
        nativeAdTitle: "Native Recommendation Ad",
        nativeAdBody: "Can be swapped with related games, hot downloads, campaign cards, or sponsored recommendations.",
        mobileHighlightsEyebrow: "Mobile First",
        mobileHighlightsTitle: "Mobile H5 Highlights",
        footerLead: "A unified web portal designed for game showcasing, editorial collections, and ad inventory.",
        footerLink: "Contribute on GitHub",
        playNow: "Play Now",
        openInNewTab: "Open in New Tab",
        seeMoreGames: "See More",
        inlineAdTitle: "In-feed Ad Slot",
        inlineAdBody: "Replace this with native ads, download promotions, editorial campaigns, or platform recommendations.",
        categoryArcade: "Arcade",
        categoryPuzzle: "Puzzle",
        categoryAction: "Action",
        categoryStrategy: "Strategy",
        categoryCasual: "Casual",
        categoryMusic: "Music",
        categoryEducational: "Educational",
        categoryBoard: "Board",
        platformBrowser: "Browser",
        platformMobile: "Mobile",
        platformCross: "Cross-platform",
      },
      login: {
        title: "Gamehub login",
        heading: "Login",
        subtitle: "Welcome Back! 😊",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot Password?",
        signIn: "SIGN IN",
        noAccount: "Don't have an account?",
        register: "Register",
        fillAll: "Please fill all fields.",
        invalidCredentials: "Invalid email or password.",
      },
      register: {
        title: "Gamehub register",
        heading: "Register",
        subtitle: "Welcome! 👋",
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        rememberMe: "Remember me",
        submit: "REGISTER",
        hasAccount: "Already have an account?",
        login: "Login",
        fillAll: "Please fill all fields.",
        emailExists: "Email already registered.",
        signupSuccess: "Signup successful! You are now logged in.",
      },
      game2048: {
        title: "2048",
        score: "Score",
        newGame: "New Game",
        boardLabel: "2048 game board",
        instructions: "Use arrow keys or swipe to move tiles. Merge tiles to reach 2048.",
        win: "You win!",
        gameOver: "Game over",
      },
      gameSnake: {
        title: "Snake Game",
        score: "Score",
        gameLabel: "Snake game canvas",
        gameOver: "Game Over! Score: {score}",
      },
      gamePong: {
        title: "Pong",
        hint: "Use W/S on the left, Up/Down on the right, or play against CPU.",
        boardLabel: "Pong game board",
        restart: "Restart",
        playVsCpu: "Play vs CPU",
        leftHint: "Left W / S",
        rightHint: "Right ↑ / ↓",
      },
      gameMemory: {
        title: "Memory Game",
        boardLabel: "Memory game board",
        hint: "Flip cards and match all emoji pairs.",
        win: "You Win! 🎉",
      },
      gameReaction: {
        title: "Reaction Timer",
        intro: "Test how fast you can respond when the screen flashes green. False starts add a 250 ms penalty.",
        startRound: "Start Round",
        current: "Current: {value}",
        best: "Best: {value}",
        placeholder: "Tap start to begin",
        waitGreen: "Wait for green...",
        tapNow: "Tap! Tap! Tap!",
        falseStart: "False start! +250 ms penalty (Total: {value})",
        reactionResult: "Your reaction: {value}",
        recentTimes: "Recent Times",
        paused: "Paused because the window lost focus.",
        notAvailable: "--",
      },
      gameBrick: {
        title: "Brick Breaker",
        score: "Score",
        lives: "Lives",
        start: "Start Game",
        playAgain: "Play Again",
        ready: "Press Start to Play!",
        win: "YOU WIN! Final Score: {score}",
        gameOver: "GAME OVER! Final Score: {score}",
      },
      gameSpace: {
        title: "Space Shooter",
        score: "Score",
        controls: "Move: ← → or A/D | Shoot: Space",
        restart: "Restart",
        gameOver: "Game Over",
        restartHint: "Press Restart to play again",
        canvasLabel: "Space shooter game area",
      },
      gameSpot: {
        title: "Spot the Difference",
        findAll: "Find all",
        differences: "differences",
        found: "found",
        timeLeft: "Time Left",
        restart: "Restart",
        originalAlt: "Original image",
        diffAlt: "Differences image",
        timesUp: "Time's up! You found {found} out of {total} differences.",
        success: "Congratulations! You found all differences!",
      },
      gameWhack: {
        title: "Whack-a-Mole",
        intro: "Hit the mole as soon as it pops up. You have 30 seconds!",
        time: "Time",
        score: "Score",
        start: "Start Game",
        boardLabel: "Whack-a-mole game board",
        hole: "Hole {index}",
        startPrompt: "Go! Whack as many moles as you can.",
        niceHit: "Nice hit!",
        finished: "Time's up! Final score: {score}.",
        paused: "Game paused because the window lost focus.",
      },
      game15Puzzle: {
        title: "15 Puzzle",
        shuffle: "Shuffle",
        autoSolve: "Auto Solve",
        boardLabel: "15 puzzle board",
        hint: "Click or tap a tile adjacent to the empty space to slide. Arrange tiles 1-15 in order.",
        solved: "Solved!",
      },
      gameMath: {
        title: "Math Challenge",
        score: "Score",
        timeLeft: "Time Left",
        ready: "Press \"Start Game\" to begin!",
        answerPlaceholder: "Enter your answer",
        start: "Start Game",
        submit: "Submit Answer",
        restart: "Restart",
        solvePrompt: "Solve: {num1} {op} {num2}",
        correct: "✅ Correct!",
        wrong: "❌ Wrong! The answer was {answer}",
        finished: "⏰ Time's up! Your final score is {score}",
      },
      gameRunner: {
        title: "Endless Runner",
        score: "Score",
        highScore: "High Score",
        restart: "Restart",
        hint: "Press Space or Arrow Up to jump, Arrow Down to slide.",
      },
      gameBubble: {
        title: "Bubble Shooter",
        score: "Score",
        next: "Next",
        level: "Level",
        instructions: "Click or touch to aim and shoot bubbles. Match 3 or more of the same color to pop them!",
        gameOver: "Game Over",
        finalScore: "Final Score: {score}",
        restart: "Restart",
        levelComplete: "Level Complete!",
        nextLevel: "Next Level",
      },
      gameTic: {
        title: "Tic Tac Toe",
        restart: "Restart",
        turn: "{player}'s turn",
        win: "{player} Wins! 🎉",
        draw: "It's a Draw!",
      },
      gameFlappy: {
        title: "Flappy Bird",
        containerLabel: "Flappy Bird game container",
        startRestart: "Start / Restart",
        pause: "Pause",
        resume: "Resume",
        controls: "Press Space, Enter, or click to flap. Press P to pause or resume.",
        score: "Score: {score}",
        footer: "Made for Mini JS Games Hub",
        startHint: "Click or press Space to start",
        gameOver: "Game Over",
      },
      gameMines: {
        title: "Minesweeper",
        rows: "Rows",
        cols: "Cols",
        mines: "Mines",
        start: "Start Game",
        restart: "Restart",
        win: "🎉 You Win!",
        gameOver: "💥 Game Over!",
      },
      gameSudoku: {
        title: "Sudoku",
      },
      gameHangman: {
        title: "Hangman",
        subtitle: "Guess the word before the man is hanged!",
        lives: "Lives",
        guessed: "Guessed",
        newGame: "New Game",
        giveUp: "Give Up",
        helpTitle: "How to play",
        help1: "Click letters or press keyboard keys to guess.",
        help2: "You have 6 wrong guesses.",
        help3: "Win by guessing all letters before running out of lives.",
        back: "← Back to Games Hub",
        guessedNone: "—",
        win: "You Win! 🎉",
        lose: "You lost — the word was \"{answer}\".",
        gaveUp: "Given up — the word was \"{answer}\".",
      },
      gameQuiz: {
        title: "Quiz Game (MCQ)",
        questionCount: "Question {current} of {total}",
        score: "Score: {score}",
        loading: "Loading question...",
        next: "Next →",
        completed: "🎯 Quiz Completed!",
        finalScore: "Your Final Score: {score} / {total}",
        playAgain: "Play Again 🔁",
      },
      gameCatch: {
        title: "Catch the Ball",
        score: "Score",
        start: "Start Game",
        playing: "Playing...",
        gameOver: "Game Over! Your final score is {score}.",
      },
      gameMaze: {
        title: "Maze Runner",
        hint: "Use Arrow Keys to move. Find the green exit!",
        newMaze: "New Maze",
        win: "You reached the exit! 🎉",
      },
      gameColorGuess: {
        title: "Color Guessing Game",
        targetColor: "Target Color",
        easy: "Easy (3)",
        hard: "Hard (6)",
        newColors: "🎯 New Colors",
        score: "Score",
        timeLeft: "Time Left",
        playAgain: "🔁 Play Again",
        correct: "✅ Correct!",
        tryAgain: "❌ Try Again!",
        timeout: "⏰ Time's Up! Final Score: {score}",
      },
      gameConnect: {
        title: "Connect Four",
        player1Turn: "Player 1's Turn (Red)",
        player2Turn: "Player 2's Turn (Yellow)",
        newGame: "New Game",
        columnFull: "Column is full!",
        win: "Player {player} Wins! 🎉",
        draw: "It's a Draw! 🤝",
      },
    },
  };

  function getDefaultLocale() {
    return "zh";
  }

  function readStoredLocale() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && translations[stored] ? stored : getDefaultLocale();
    } catch (error) {
      return getDefaultLocale();
    }
  }

  function writeStoredLocale(locale) {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      return;
    }
  }

  function getMessage(locale, key) {
    return key.split(".").reduce((value, part) => value?.[part], translations[locale]);
  }

  function interpolate(message, params = {}) {
    return String(message).replace(/\{(\w+)\}/g, (_, token) =>
      Object.prototype.hasOwnProperty.call(params, token) ? params[token] : `{${token}}`
    );
  }

  function getLocale() {
    return readStoredLocale();
  }

  function t(key, params = {}, locale = getLocale()) {
    const message = getMessage(locale, key) ?? getMessage("en", key) ?? key;
    return interpolate(message, params);
  }

  function updateLanguageToggle() {
    const locale = getLocale();
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.textContent = locale === "en" ? "EN" : "中文";
      button.setAttribute(
        "aria-label",
        locale === "en" ? t("common.switchToChinese") : t("common.switchToEnglish")
      );
      button.title = locale === "en" ? t("common.switchToChinese") : t("common.switchToEnglish");
    });
  }

  function applyTranslations() {
    const locale = getLocale();
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n, {}, locale);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((node) => {
      node.innerHTML = t(node.dataset.i18nHtml, {}, locale);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder, {}, locale));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel, {}, locale));
    });

    document.querySelectorAll("[data-i18n-content]").forEach((node) => {
      node.setAttribute("content", t(node.dataset.i18nContent, {}, locale));
    });

    updateLanguageToggle();
  }

  function setLocale(nextLocale) {
    const locale = translations[nextLocale] ? nextLocale : getDefaultLocale();
    writeStoredLocale(locale);
    applyTranslations();
    window.dispatchEvent(
      new CustomEvent("site-language-change", {
        detail: { locale },
      })
    );
  }

  function toggleLocale() {
    setLocale(getLocale() === "en" ? "zh" : "en");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();

    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.addEventListener("click", toggleLocale);
    });
  });

  window.SiteI18n = {
    getLocale,
    setLocale,
    toggleLocale,
    applyTranslations,
    t,
  };
})();
