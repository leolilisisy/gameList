(function () {
  const STORAGE_KEY = "site-language";

  const translations = {
    en: {
      common: {
        toggleTheme: "Toggle theme",
        scrollToTop: "Scroll to top",
        scrollToBottom: "Scroll to bottom",
        switchToChinese: "Switch to Chinese",
        switchToEnglish: "Switch to English",
      },
      index: {
        title: "Mini JS Games Hub 🎮",
        metaDescription:
          "Mini JS Games Hub — Play, learn, and create JavaScript mini-games directly in your browser.",
        mainNavigation: "Main navigation",
        logoHome: "Mini JavaScript Games Hub Home",
        contribute: "Contribute",
        browseGames: "Browse Games",
        login: "Login",
        heroEyebrow: "Open-source arcade for the web",
        heroTitle: "Play. Learn. Ship your next mini-game.",
        heroLead:
          "Explore hand-crafted JavaScript games, peek under the hood, and add your own creations — all right in your browser.",
        viewOnGithub: "View on GitHub",
        heroNote:
          'Click "Play now" to open a game in this tab, or "Open in new tab →" to keep this hub open.',
        totalGames: "Total Games",
        andCounting: "and counting",
        latestLaunch: "Latest Launch",
        stack: "Stack",
        liveLeaderboard: "Live Leaderboard",
        gamesReady: "games ready to play",
        instantLoad: "⚡ Instant Load",
        noBuildTools: "📦 No Build Tools",
        browserReady: "🌐 Browser Ready",
        proBadgesLabel: "Your Pro Player Badges",
        proBadgesTitle: "Your Pro Player Badges ⭐",
        noBadges: "No badges earned yet. Play more games!",
        gameFilters: "Game filters",
        searchGames: "Search games",
        searchPlaceholder: "Search games or tags",
        gamesSuffix: "games",
        latestShort: "Latest:",
        footerLead: "Made with love by the community —",
        footerLink: "Contribute on GitHub",
        playNow: "Play now",
        openInNewTab: "Open in new tab →",
        seeMoreGames: "See More Games",
        playsCount: "{count} plays",
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
        subtitle: "Namaste!! 👋",
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
        hint:
          "Use W/S (left) and Up/Down (right) or play vs CPU with Left player only.",
        boardLabel: "Pong game board",
        restart: "Restart",
        playVsCpu: "Play vs CPU (right paddle)",
        leftHint: "Left W / S",
        rightHint: "Right ↑ / ↓",
      },
      gameMemory: {
        title: "Memory Game",
        boardLabel: "Memory game board",
        hint: "Flip cards and match all emoji pairs.",
        win: "You Win! 🎉",
      },
    },
    zh: {
      common: {
        toggleTheme: "切换主题",
        scrollToTop: "回到顶部",
        scrollToBottom: "滚动到底部",
        switchToChinese: "切换为中文",
        switchToEnglish: "Switch to English",
      },
      index: {
        title: "迷你 JS 游戏中心 🎮",
        metaDescription:
          "迷你 JS 游戏中心：在浏览器里直接游玩、学习和创建 JavaScript 小游戏。",
        mainNavigation: "主导航",
        logoHome: "迷你 JavaScript 游戏中心首页",
        contribute: "参与贡献",
        browseGames: "浏览游戏",
        login: "登录",
        heroEyebrow: "面向网页的开源小游戏乐园",
        heroTitle: "开玩，开学，开做你的下一个小游戏。",
        heroLead:
          "探索社区制作的 JavaScript 小游戏，看看它们的实现方式，也把你的作品直接带进这个浏览器游乐场。",
        viewOnGithub: "在 GitHub 查看",
        heroNote:
          "点击“立即游玩”会在当前标签页打开游戏，点击“新标签页打开 →”则会保留这个主页。",
        totalGames: "游戏总数",
        andCounting: "持续增加中",
        latestLaunch: "最新上线",
        stack: "技术栈",
        liveLeaderboard: "实时榜单",
        gamesReady: "款游戏可立即体验",
        instantLoad: "⚡ 即点即玩",
        noBuildTools: "📦 无需构建工具",
        browserReady: "🌐 浏览器即开即用",
        proBadgesLabel: "你的高手徽章",
        proBadgesTitle: "你的高手徽章 ⭐",
        noBadges: "暂时还没有获得徽章，多玩几次试试吧！",
        gameFilters: "游戏筛选",
        searchGames: "搜索游戏",
        searchPlaceholder: "搜索游戏或标签",
        gamesSuffix: "款游戏",
        latestShort: "最新：",
        footerLead: "由社区共同打造，带着热爱而来 —",
        footerLink: "去 GitHub 参与贡献",
        playNow: "立即游玩",
        openInNewTab: "新标签页打开 →",
        seeMoreGames: "查看更多游戏",
        playsCount: "游玩 {count} 次",
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
    },
  };

  function getDefaultLocale() {
    return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
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
      button.textContent = locale === "en" ? "中文" : "EN";
      button.setAttribute(
        "aria-label",
        locale === "en" ? t("common.switchToChinese") : t("common.switchToEnglish")
      );
      button.title =
        locale === "en" ? t("common.switchToChinese") : t("common.switchToEnglish");
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
