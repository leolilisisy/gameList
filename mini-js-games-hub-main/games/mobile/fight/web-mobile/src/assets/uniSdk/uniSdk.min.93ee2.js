(function (root) {
  var exports = undefined,
      module = undefined,
      require = undefined;
  var define = undefined;
  var self = root,
      window = root,
      global = root,
      globalThis = root;
  (function () {
    var uniSdk;
    !function (t) {
      t.BrowersUtils = class {
        static reload() {
          window.location.reload();
        }

        static redirect(t) {
          location.href = t;
        }

        static isWechat() {
          var t = navigator.userAgent.toString();
          return null != t.match(/MicroMessenger/i) && "MicroMessenger" == t.match(/MicroMessenger/i).toString();
        }

        static isAndroid() {
          var t = navigator.userAgent.toString();
          return -1 < t.indexOf("Android") || -1 < t.indexOf("Linux");
        }

        static GetRequest(t) {
          t = new RegExp("(^|&)" + t + "=([^&]*)(&|$)"), t = window.location.search.slice(1).match(t);
          return t && 2 < t.length ? decodeURI(t[2]) : null;
        }

      };
    }(uniSdk = uniSdk || {}), function (i) {
      class t {
        static doPost(t, e, o, a) {
          new i.HttpClient().send(t, e, o, a, "POST");
        }

        static doGet(t, e, o) {
          new i.HttpClient().send(t, null, e, o, "GET");
        }

        static setLocalStorage(t, e) {
          1 == i.Global.engineType ? window.egret.localStorage.setItem(t, e) : 2 == i.Global.engineType && window.cc.sys.localStorage.setItem(t, e);
        }

        static getLocalStorage(e, o) {
          let a = "";
          if (1 == i.Global.engineType) a = (a = window.egret.localStorage.getItem(e)) || o;else if (2 == i.Global.engineType) {
            let t = window.cc.sys.localStorage.getItem(e);
            "NaN" !== (t = "string" != typeof t ? null : t) && "" !== t || (t = null), a = null === t ? o : t;
          }
          return "" == a ? o : a;
        }

        static clearLocalStorage(t) {
          1 == i.Global.engineType ? window.egret.localStorage.removeItem(t) : 2 == i.Global.engineType && window.cc.sys.localStorage.removeItem(t);
        }

        static reportAldOpenId(t) {
          null == i.Global.aldKey || i.Global.aldKey.length <= 0 || t && t.length && 0 < t.length && window[i.Global.platformName] && window[i.Global.platformName].aldSendOpenid && window[i.Global.platformName].aldSendOpenid(t);
        }

        static reportAldEvent(t, e) {
          null == e && (e = {}), window[i.Global.platformName] && window[i.Global.platformName].aldSendEvent && window[i.Global.platformName].aldSendEvent(t, e);
        }

        static reportAldStageStart(t, e) {
          console.error("reportAldStageStart接口已废除， 请使用 uniSdk.gameLevelStarted 接口");
        }

        static reportAldStageEnd(t, e) {
          console.error("reportAldStageEnd接口已废除， 请使用 uniSdk.gameLevelEnded 接口");
        }

        static reportAldStageFail(t, e) {
          console.error("reportAldStageFail接口已废除， 请使用 uniSdk.gameLevelEnded 接口");
        }

        static reportAldStageAward(t, e, o) {
          console.error("reportAldStageAward接口已废除， 请使用 uniSdk.gameLevelAward 接口");
        }

        static reportAldStageTools(t, e, o, a) {
          console.error("reportAldStageTools接口已废除， 请使用 uniSdk.gameLevelTools 接口");
        }

        static reportEvent(t) {
          i.AdPlat.instance.reportEvent(t);
        }

        static pause() {}

        static resume() {}

        static get isWxgame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.WXGAME : 2 == i.Global.engineType ? "WECHAT_GAME" == window.cc.sys.platform : void 0 !== window.wx && void 0 === window.tt;
        }

        static get isQQGame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.QQGAME : void 0 !== window.qq;
        }

        static get isVivogame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.VIVOGAME : 2 == i.Global.engineType ? "VIVO_MINI_GAME" == window.cc.sys.platform : void 0 !== window.qg && -1 < window.qg.getProvider().toLowerCase().indexOf("vivo");
        }

        static get isOppogame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.OPPOGAME : 2 == i.Global.engineType ? "OPPO_MINI_GAME" == window.cc.sys.platform : void 0 !== window.qg && -1 < window.qg.getProvider().toLowerCase().indexOf("oppo");
        }

        static get isTTGame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.TTGAME : 2 == i.Global.engineType ? "BYTEDANCE_MINI_GAME" == window.cc.sys.platform : void 0 !== window.tt;
        }

        static get isFastGame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.FASTGAME : 2 == i.Global.engineType ? "HUAWEI_QUICK_GAME" == window.cc.sys.platform : void 0 !== window.hbs;
        }

        static get isXiaoMiGame() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.QGAME : 2 == i.Global.engineType ? "XIAOMI_QUICK_GAME" == window.cc.sys.platform : void 0 !== window.qg;
        }

        static get isH5() {
          return 1 == i.Global.engineType ? window.egret.Capabilities.runtimeType == window.egret.RuntimeType.WEB : 2 == i.Global.engineType && ("MOBILE_BROWSER" == window.cc.sys.platform || "DESKTOP_BROWSER" == window.cc.sys.platform || "WIN32" == window.cc.sys.platform || "MACOS" == window.cc.sys.platform || "UNKNOWN" == window.cc.sys.platform) || !(t.isWxgame || t.isVivogame || t.isOppogame || t.isQQGame || t.isFastGame || t.isTTGame || t.isXiaoMiGame);
        }

      }

      t.engineType = 2, t.adItemDataList = [], t.gameConfig = null, t.curGameLevel = -1, t.lastEventName = "", t.API_URL = "", i.Global = t;
    }(uniSdk = uniSdk || {}), function (t) {
      class e {}

      e.SDK_INIT_COMPLETED = "SDK_INIT_COMPLETED", t.Cmd = e;

      class n {
        static addListener(t, e, o, a) {
          if (1 == n.messageDispatching || null == t || null == e) return null;
          var i = n.maps[t];
          null == i && (i = new Array(), n.maps[t] = i);

          for (var l = 0; l < i.length; l++) {
            var s = i[l];
            if (s.listener == e && s.target == o) return null;
          }

          return i.push({
            target: o,
            listener: e,
            isRemove: a = void 0 === a ? !1 : a
          }), e;
        }

        static removeListener(t, e, o) {
          if (1 != n.messageDispatching && null != t && null != e) {
            var a = n.maps[t];

            if (null != a) {
              for (var i = 0; i < a.length; i++) {
                var l = a[i];

                if (l.listener == e && l.target == o) {
                  a.splice(i, 1);
                  break;
                }
              }

              a.length <= 0 && delete n.maps[t];
            }
          }
        }

        static clear() {
          1 != n.messageDispatching && (n.maps = []);
        }

        static dispatch(t, e) {
          let o = !1;
          var a = n.maps[t];

          if (null != a) {
            n.messageDispatching = !0;

            for (var i = new Array(), l = 0; l < a.length; l++) {
              var s = a[l];
              s.listener.call(s.target, e), s.isRemove || i.push(s), o = !0;
            }

            n.messageDispatching = !1, delete n.maps[t], 0 < i.length && (n.maps[t] = i);
          }

          return o;
        }

      }

      n.maps = [], n.messageDispatching = !1, t.MessageProxy = n;
    }(uniSdk = uniSdk || {}), function (e) {
      e.createBoxAd = function () {
        (e.Global.isVivogame || e.Global.isOppogame || e.Global.isXiaoMiGame) && window.platform.createBoxAd();
      }, e.destroyBoxAd = function () {
        (e.Global.isVivogame || e.Global.isXiaoMiGame) && window.platform.destroyBoxAd();
      }, e.showFloatAd = function () {
        e.Global.isXiaoMiGame && window.platform.showFloatAd();
      }, e.hideFloatAd = function () {
        e.Global.isXiaoMiGame && window.platform.hideFloatAd();
      }, e.showNativeAdvertisement = function (t, e) {
        window.platform && window.platform.showNativeAdvertisement(null, t, e);
      }, e.setOwnerNameLabel = function (t) {
        e.Global.isVivogame || e.Global.isOppogame ? t.string = "游戏著作权人: __COPY_RIGHT_TEXT_" : t.string = "";
      }, e.setPrivacyAgreementLabel = function (t) {
        e.Global.isVivogame ? t.string = "      __USER_AGENT_NAME__尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更有个性化的服务，__USER_AGENT_NAME__会按照本隐私权政策的规定使用和披露您的个人信息。但__USER_AGENT_NAME__将以高度的勤勉、审慎义务对待这些信息。除本隐私权政策另有规定外，在未征得您事先许可的情况下，__USER_AGENT_NAME__不会将这些信息对外披露或向第三方提供。__USER_AGENT_NAME__会不时更新本隐私权政策。您在同意__USER_AGENT_NAME__使用协议之时，即视为您已经同意本隐私权政策全部内容。本隐私权政策属于__USER_AGENT_NAME__服务使用协议不可分割的一部分。 \n1.适用范围 \na）在您使用本游戏网络服务，本游戏自动接收并记录您的手机上的信息，包括但不限于您使用的语言、访问日期和时间、软硬件特征信息等数据。 \n2.信息使用为服务用户的目的 \n__USER_AGENT_NAME__可能通过使用您的个人信息，向您提供您感兴趣的信息，包括但不限于向您发出产品和服务信息，或者与__USER_AGENT_NAME__合作伙伴共享信息以便他们向您发送有关其产品和服务的信息（后者需要您的事先同意）。 \n3.信息披露 \n__USER_AGENT_NAME__将依据您的个人意愿或法律的规定全部或部分的披露您的个人信息  \n(a) 本游戏不会将您的信息披露给不受信任的第三方； \n(b) 根据法律的有关规定，或者行政或司法机构的要求，向第三方或者行政、司法机构披露； \n(c) 如您出现违反中国有关法律、法规或者本游戏服务协议或相关规则的情况，需要向第三方披露； \n(d) 如您是适格的知识产权投诉人并已提起投诉，应被投诉人要求，向被投诉人披露，以便双方处理可能的权利纠纷； \n4.联系我们 如果您对本隐私政策有任何疑问，请通过2711205782@qq.com于我们联系。 \n\n__USER_AGENT_NAME__\n2022年10月1日" : (e.Global.isOppogame || e.Global.isXiaoMiGame) && (t.string = "      我们尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更有个性化的服务，我们会按照本隐私权政策的规定使用和披露您的个人信息。但我们将以高度的勤勉、审慎义务对待这些信息。除本隐私权政策另有规定外，在未征得您事先许可的情况下，我们不会将这些信息对外披露或向第三方提供。我们会不时更新本隐私权政策。您在同意我们使用协议之时，即视为您已经同意本隐私权政策全部内容。本隐私权政策属于我们服务使用协议不可分割的一部分。 \n1.适用范围 \na）在您使用本游戏网络服务，本游戏自动接收并记录您的手机上的信息，包括但不限于您使用的语言、访问日期和时间、软硬件特征信息等数据。 \n2.信息使用为服务用户的目的 \n我们可能通过使用您的个人信息，向您提供您感兴趣的信息，包括但不限于向您发出产品和服务信息，或者与我们合作伙伴共享信息以便他们向您发送有关其产品和服务的信息（后者需要您的事先同意）。 \n3.信息披露 \n我们将依据您的个人意愿或法律的规定全部或部分的披露您的个人信息  \n(a) 本游戏不会将您的信息披露给不受信任的第三方； \n(b) 根据法律的有关规定，或者行政或司法机构的要求，向第三方或者行政、司法机构披露； \n(c) 如您出现违反中国有关法律、法规或者本游戏服务协议或相关规则的情况，需要向第三方披露； \n4.联系我们 如果您对本隐私政策有任何疑问，请通过3628946269@qq.com与我们联系。 \n\n生效日期：2022年10月1日\n");
      };
    }(uniSdk = uniSdk || {}), function (r) {
      r.startupTimestamp = 0, r.ttLastVideoCreateTimestamp = 0, r.init = function (t, e, o) {
        r.startupTimestamp = Date.now(), console.log("uniSdk init", t), window.cc ? r.Global.engineType = 2 : window.egret ? r.Global.engineType = 1 : window.laya && (r.Global.engineType = 3), t && (!t.app_key || t.app_key.length <= 0 ? console.log("") : "l" == t.app_key[0] && "s" == t.app_key[1] ? r.Global.appKey = t.app_key : console.log("")), r.Global.screenWidth = 720, r.Global.screenHeight = 1280, r.Global.platformName = "h5", r.Global.channel = "h5", r.Global.isTTGame ? (r.Global.platformName = "tt", r.Global.channel = "tt") : r.Global.isWxgame ? (r.Global.platformName = "wx", r.Global.channel = "wx") : r.Global.isOppogame ? (r.Global.platformName = "qg", r.Global.channel = "oppo", window.platform = new r.OppoPlatform(), t = null) : r.Global.isQQGame ? (r.Global.platformName = "qq", r.Global.channel = "qq") : r.Global.isVivogame ? (r.Global.platformName = "qg", r.Global.channel = "vivo", window.platform = new r.VivoPlatform(), t = null) : r.Global.isFastGame ? (r.Global.platformName = "hbs", r.Global.channel = "huawei") : r.Global.isXiaoMiGame && (r.Global.platformName = "qg", r.Global.channel = "xiaomi", window.platform = new r.XiaoMiPlatform(), window.platform.init(), t = null), console.log("channel", r.Global.channel), console.log("platformName", r.Global.platformName), null == t && (r.Global.appKey = null);

        try {
          r.AdPlat.instance.init(t);
        } catch (t) {
          console.error("uniSdk.init 初始化异常", t);
        }

        r.Global.appKey ? (r.Global.userInfo = new r.UserInfo(), r.Global.userInfo.avatarUrl = "", r.Global.userInfo.nickName = "", r.Global.userInfo.level = 0, r.Global.userInfo.gameLevel = 0, r.Global.userInfo.money = 0, r.Global.userInfo.score = 0, (t = r.Global.getLocalStorage(r.Global.appKey + "_openid", "")) && 0 < t.length && (r.Global.userInfo.openid = t), (t = r.Global.getLocalStorage(r.Global.appKey + "_usernickname", "")) && 0 < t.length && (r.Global.userInfo.nickName = t), (t = r.Global.getLocalStorage(r.Global.appKey + "_useravatar", "")) && 0 < t.length && (r.Global.userInfo.avatarUrl = t), r.login(e, o)) : e && e.call(o, r.Global.userInfo);
      }, r.login = function (e, o) {
        var i, t;
        !r.Global.appKey || r.Global.appKey.length <= 0 || !r.Global.channel || r.Global.channel.length <= 0 || null == r.Global.userInfo || null == r.Global.userInfo ? e && e.call(o, r.Global.userInfo) : r.Global.userInfo.openid && 0 < r.Global.userInfo.openid.length ? (r.AdPlat.instance.setLoginCallback(e, o), r.AdPlat.instance.login("", r.Global.userInfo.openid, "")) : r.Global.isWxgame ? (r.AdPlat.instance.setLoginCallback(e, o), window[r.Global.platformName].login({
          success(t) {
            t.code ? r.AdPlat.instance.login(t.code, "", "") : (console.log("登录失败！" + t.errMsg), r.reportEvent("登陆失败"), r.AdPlat.instance.setLoginCallback(null, null), e && e.call(o, r.Global.userInfo));
          },

          fail() {
            console.warn("login fail"), r.reportEvent("登陆失败"), r.AdPlat.instance.setLoginCallback(null, null), e && e.call(o, r.Global.userInfo);
          }

        })) : r.Global.isTTGame ? (r.AdPlat.instance.setLoginCallback(e, o), window[r.Global.platformName].login({
          success(t) {
            console.log("登陆信息", t), t.code ? r.AdPlat.instance.login(t.code, "", t.anonymousCode) : (console.log("登录失败！" + t.errMsg), r.reportEvent("登陆失败"), r.AdPlat.instance.setLoginCallback(null, null), e && e.call(o, r.Global.userInfo));
          },

          fail() {
            console.warn("login fail"), r.reportEvent("登陆失败"), r.AdPlat.instance.setLoginCallback(null, null), e && e.call(o, r.Global.userInfo);
          }

        })) : r.Global.isH5 ? (t = Math.random().toString(36).slice(-6) + r.Global.appKey, i = [], t.split("").forEach((t, e, o) => {
          var a = Math.round(Math.random() * i.length);
          i.splice(a, 0, t);
        }), t = "h5" + i.join(""), r.AdPlat.instance.setLoginCallback(e, o), r.AdPlat.instance.login("", t, "")) : e && e.call(o, r.Global.userInfo);
      }, r.userinfo_sec_check = function () {
        !r.Global.isWxgame || null == r.Global.API_URL || r.Global.API_URL.length <= 0 || !r.Global.appKey || r.Global.appKey.length <= 0 || !r.Global.channel || r.Global.channel.length <= 0 || !r.Global.userInfo || !r.Global.userInfo.openid || r.Global.userInfo.openid.length <= 0 || r.authorizeUserInfo(null, t => {
          null != t && (t = r.Global.API_URL + "?service=OpenApi.msg_sec_check&appkey=" + r.Global.appKey + "&channel=" + r.Global.channel + "&content=" + t.nickName + "&openid=" + r.Global.userInfo.openid, r.Global.doGet(t, t => {
            console.log("文本内容安全识别结果", t);
          }));
        });
      }, r.authorizeUserInfo = function (t, o, a) {
        r.Global.isWxgame && window[r.Global.platformName] && window[r.Global.platformName].getUserProfile ? ((null == t || t.length <= 0) && (t = "获取你的头像、昵称"), window[r.Global.platformName].getUserProfile({
          desc: t,
          success: function (t) {
            let e = r.Global.userInfo;
            t && t.userInfo ? ((e = null == e ? new r.UserInfo() : e).nickName = t.userInfo.nickName, e.avatarUrl = t.userInfo.avatarUrl, r.Global.setLocalStorage(r.Global.appKey + "_usernickname", e.nickName), r.Global.setLocalStorage(r.Global.appKey + "_useravatar", e.avatarUrl)) : e = null, o && o.call(a, e);
          },

          fail(t) {
            console.warn("授权失败", t), o && o.call(a, null);
          }

        })) : r.Global.isTTGame && window[r.Global.platformName] && window[r.Global.platformName].getUserInfo ? window[r.Global.platformName].getUserInfo({
          success: function (t) {
            let e = r.Global.userInfo;
            t && t.userInfo ? ((e = null == e ? new r.UserInfo() : e).nickName = t.userInfo.nickName, e.avatarUrl = t.userInfo.avatarUrl, r.Global.setLocalStorage(r.Global.appKey + "_usernickname", e.nickName), r.Global.setLocalStorage(r.Global.appKey + "_useravatar", e.avatarUrl)) : e = null, o && o.call(a, e);
          },

          fail(t) {
            console.warn("授权失败", t), o && o.call(a, null);
          }

        }) : o && o.call(a, null);
      }, r.showToast = function (t) {
        window[r.Global.platformName] && window[r.Global.platformName].showToast ? window[r.Global.platformName].showToast({
          message: t,
          title: t
        }) : window.alert && (console.log("showToast", t), window.alert(t));
      }, r.showPopup = function (t, e, o, a, i, l, s, n) {
        void 0 === l && (l = "提示"), void 0 === s && (s = "确定"), void 0 === n && (n = "取消"), void 0 === i && (i = !1), window[r.Global.platformName] && window[r.Global.platformName].showModal ? window[r.Global.platformName].showModal({
          title: l,
          content: t,
          showCancel: i,
          confirmText: s,
          cancelText: n,

          success(t) {
            t.confirm ? e && e.call(a) : t.cancel && o && o.call(a);
          }

        }) : window[r.Global.platformName] && window[r.Global.platformName].showDialog ? window[r.Global.platformName].showDialog({
          title: l,
          message: t,
          buttons: i ? [{
            text: s
          }, {
            text: n
          }] : [{
            text: s
          }],
          confirmText: s,
          cancelText: n,

          success(t) {
            0 == t.index ? e && e.call(a) : o && o.call(a);
          },

          cancel(t) {
            o && o.call(a);
          }

        }) : window.GX && window.GX.Tips ? window.GX.Tips.showPopup(t, e, o, a, i, l, s, n) : window.alert && (console.log("showPopup", t), window.alert(t));
      }, r.requestRankList = function (t, e, o, a) {
        r.AdPlat.instance.requestRankList(t, e, o, a);
      }, r.reportEvent = function (t) {
        r.AdPlat.instance.reportEvent(t);
      }, r.subscribeMessage = function (e, o, a) {
        !(null == r.Global.API_URL || r.Global.API_URL.length <= 0) && e && !(e.length <= 0) && !(!r.Global.appKey || r.Global.appKey.length <= 0 || !r.Global.channel || r.Global.channel.length <= 0 || "wx" != r.Global.channel) && r.Global.userInfo && r.Global.userInfo.uid && window[r.Global.platformName] && window[r.Global.platformName].requestSubscribeMessage ? window[r.Global.platformName].requestSubscribeMessage({
          tmplIds: [e],

          success(t) {
            console.log("requestSubscribeMessage", t), "requestSubscribeMessage:ok" == t.errMsg && "accept" == t[e] ? (t = r.Global.API_URL + "?service=sdk.subscribeMessage&appkey=" + r.Global.appKey + "&channel=" + r.Global.channel + "&openid=" + r.Global.userInfo.openid + "&tmplId=" + e, r.Global.doGet(t), o && o.call(a, !0)) : o && o.call(a, !1);
          },

          fail(t) {
            console.log("requestSubscribeMessage fail", t), o && o.call(a, !1);
          }

        }) : o && o.call(a, !1);
      }, r.getSystemInfo = function () {
        return r.AdPlat.instance.getSystemInfoSync();
      };
      let n = null;
      r.showGameClubButton = function (e, o, a, i, l) {
        if (r.Global.isWxgame) {
          if (null == n) {
            void 0 === e && (e = 0), void 0 === o && (o = 0), void 0 === a && (a = 40), void 0 === i && (i = 40);
            let t = !1;
            var s = (l = !l || l.length <= 0 ? "dark" : l).split("."),
                s = (2 <= s.length && ("jpg" != (s = s[s.length - 1]) && "png" != s || (t = !0)), r.getSystemInfo()),
                s = (e = e / 720 * s.windowWidth, o = o / 1280 * s.windowHeight, a = a / 720 * s.windowWidth, i = i / 720 * s.windowWidth, {});
            s.style = {
              left: e,
              top: o,
              width: a,
              height: i
            }, s.type = "image", t ? s.image = l : s.icon = l, n = window[r.Global.platformName].createGameClubButton(s);
          }

          n && n.show();
        }
      }, r.hideGameClubButton = function () {
        r.Global.isWxgame && n && n.hide();
      }, r.destoryGameClubButton = function () {
        r.Global.isWxgame && (n && n.destroy(), n = null);
      }, r.vibrateLong = function () {
        window[r.Global.platformName] && window[r.Global.platformName].vibrateLong && window[r.Global.platformName].vibrateLong();
      }, r.vibrateShort = function (t) {
        t = t || 0, window[r.Global.platformName] && window[r.Global.platformName].vibrateShort && (1 == t ? window[r.Global.platformName].vibrateShort({
          type: "medium"
        }) : 2 == t ? window[r.Global.platformName].vibrateShort({
          type: "light"
        }) : window[r.Global.platformName].vibrateShort({
          type: "heavy"
        }));
      }, r.navigateToMiniProgram = function (e, o, a) {
        window[r.Global.platformName] && window[r.Global.platformName].navigateToMiniProgram ? window[r.Global.platformName].navigateToMiniProgram({
          appId: e.appid,
          path: e.path,

          success(t) {
            console.log("跳转成功 ", t), o && o.call(a, !0, e);
          },

          fail(t) {
            console.log("跳转失败 ", t), o && o.call(a, !1, e);
          }

        }) : (console.log("跳转失败 "), o && o.call(a, !1, e), r.showToast("当前渠道不支持导出小游戏：" + e.title));
      }, r.showRewardedVideo = function (t, e, o) {
        r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame ? window.platform && window.platform.showVideoAdvertisement(null, e, o) : r.AdPlat.instance.showRewardedVideo(t, e, o);
      }, r.showInterstitial = function (t, e, o) {
        r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame ? window.platform && window.platform.showInterstitialAdvertisement(e, o) : r.AdPlat.instance.showInterstitial(t, e, o);
      }, r.showBanner = function (t) {
        r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame ? window.platform && window.platform.showBannerAdvertisement() : r.AdPlat.instance.showBanner(t);
      }, r.hideBanner = function () {
        r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame ? window.platform && window.platform.hideBannerAdvertisement() : r.AdPlat.instance.hideBanner();
      }, r.showCustomAd = function (t, e, o, a) {
        t = t || 0, r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame ? window.platform && 0 == t && window.platform.showNativeAdvertisement(null, o, a) : r.AdPlat.instance.showCustomAd(t, e, o, a);
      }, r.hideCustomAd = function (t) {
        r.Global.isVivogame || r.Global.isOppogame || r.Global.isXiaoMiGame || r.AdPlat.instance.hideCustomAd(t);
      }, r.share = function (t, e, o, a) {
        r.AdPlat.instance.share(t, e, o, a);
      }, r.showBoxBannerAd = function (t, e) {
        r.AdPlat.instance.showBoxBannerAd(t, e);
      }, r.hideBoxBannerAd = function () {
        r.AdPlat.instance.hideBoxBannerAd();
      }, r.showBoxPortalAd = function () {
        r.Global.isXiaoMiGame && window.platform && window.platform.showBoxPortalAd();
      }, r.hideBoxPortalAd = function () {
        r.Global.isXiaoMiGame && window.platform && window.platform.hideBoxPortalAd();
      }, r.gameLevelStarted = function (t) {
        if (r.AdPlat.instance.adIdleTime = 0, r.Global.gameConfig && r.Global.gameConfig.startGameForceAd && 0 < r.Global.gameConfig.startGameForceAd.length && r.Global.gameConfig.mistouchNumFromLevel <= t) for (let t = 0; t < r.Global.gameConfig.startGameForceAd.length; t++) {
          var e = r.Global.gameConfig.startGameForceAd[t];
          1 == e ? r.showRewardedVideo(0, t => {}, this) : 2 == e ? r.showInterstitial() : 3 == e && r.showCustomAd(0);
        }
        -1 != r.Global.curGameLevel && (o = "第" + r.Global.curGameLevel.toString() + "关", r.AdPlat.instance.reportGameLevelEndEvent(r.Global.curGameLevel, o, 0));
        var o = "第" + (r.Global.curGameLevel = t).toString() + "关";
        r.AdPlat.instance.reportGameLevelStartEvent(t, o);
      }, r.gameLevelEnded = function (t) {
        let e = !1;
        if (r.AdPlat.instance.adIdleTime = 0, r.Global.gameConfig && r.Global.gameConfig.endGameForceAd && 0 < r.Global.gameConfig.endGameForceAd.length && 0 < r.Global.curGameLevel && r.Global.gameConfig.mistouchNumFromLevel <= r.Global.curGameLevel) for (let t = 0; t < r.Global.gameConfig.endGameForceAd.length; t++) {
          var o = r.Global.gameConfig.endGameForceAd[t];
          1 == o ? (r.showRewardedVideo(0, t => {}, this), e = !0) : 2 == o ? (r.showInterstitial(), e = !0) : 3 == o && (r.showCustomAd(0), e = !0);
        }
        var a;
        -1 != r.Global.curGameLevel && (a = "第" + r.Global.curGameLevel.toString() + "关", r.AdPlat.instance.reportGameLevelEndEvent(r.Global.curGameLevel, a, t ? 1 : 0)), !e && r.Global.gameConfig && 1 == r.Global.gameConfig.endCustom && r.Global.curGameLevel >= r.Global.gameConfig.endLevelCustom && r.showCustomAd(0), r.Global.curGameLevel = -1;
      }, r.gameLevelAward = function (t) {}, r.gameLevelTools = function (t, e) {}, r.getCustomAdStyle = function (t) {
        var e = r.getSystemInfo();
        let o = {
          top: .5 * (e.windowHeight - 400),
          left: .5 * (e.windowWidth - 320),
          fixed: !1,
          width: 320
        };
        return r.Global.isVivogame ? o.left = void 0 : r.Global.isOppogame && (o = null), o;
      }, r.notityBannerResize = function (t, e) {};
    }(uniSdk = uniSdk || {}), function (e) {
      e.UserInfo = class {
        get uid() {
          return this._uid;
        }

        set uid(t) {
          this._uid = t;
        }

        get openid() {
          return this._openid;
        }

        set openid(t) {
          this._openid = t;
        }

        get nickName() {
          return this._nickName;
        }

        set nickName(t) {
          this._nickName = t, this.send("nickname=" + t);
        }

        get avatarUrl() {
          return this._avatarUrl;
        }

        set avatarUrl(t) {
          this._avatarUrl = t, this.send("avatar=" + t);
        }

        get gameLevel() {
          return this._gameLevel;
        }

        set gameLevel(t) {
          this._gameLevel = t, this.send("gameleval=" + t);
        }

        get level() {
          return this._level;
        }

        set level(t) {
          this._level = t, this.send("userleval=" + t);
        }

        get money() {
          return this._money;
        }

        set money(t) {
          this._money = t, this.send("money=" + t);
        }

        get score() {
          return this._score;
        }

        set score(t) {
          this._score = t, this.send("score=" + t);
        }

        send(t) {
          null == e.Global.API_URL || e.Global.API_URL.length <= 0 || !e.Global.appKey || e.Global.appKey.length <= 0 || !e.Global.channel || e.Global.channel.length <= 0 || this._uid && 0 < this._uid && this._openid && 0 < this._openid.length && e.Global.userInfo && e.Global.userInfo._uid == this._uid && (t = e.Global.API_URL + "?service=sdk.updateUserInfo&appkey=" + e.Global.appKey + "&channel=" + e.Global.channel + "&openid=" + this._openid + "&" + t, e.Global.doGet(t));
        }

      };
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdBanner = class {};
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdConfig = class {
        constructor() {
          this.app_key = "", this.adBannerIdList = [], this.adVideoIdList = [], this.adInterstitialId = "", this.adCustomIdList = [], this.adBoxBannerId = "", this.adBoxPortalId = "", this.shareInfoArr = [], this.isExportWxGameAd = !1;
        }

      };
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdCustom = class {};
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdInterstitial = class {};
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdIPData = class {};
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdItemData = class {};
    }(uniSdk = uniSdk || {}), function (a) {
      class t {
        constructor() {
          this.misTouchNum = 0, this.misTouchFromLevel = 0, this.curMisTouchNum = 0;
        }

        static get instance() {
          return null == t._instance && (t._instance = new t()), t._instance;
        }

        init(t, e, o) {
          null == a.Global.gameConfig || (this.misTouchNum = a.Global.gameConfig.mistouchNum, this.misTouchFromLevel = a.Global.gameConfig.mistouchNumFromLevel, console.log("misTouchNum", this.misTouchNum), console.log("misTouchFromLevel", this.misTouchFromLevel), console.log("sceneLevel", t), this.misTouchNum <= 0) || t < this.misTouchFromLevel || (this.curMisTouchNum++, this.curMisTouchNum < this.misTouchNum) ? e && e.call(o, t) : (this.loadingSceneLevel = t, this.loadSceneCallback = e, this.loadSceneObj = o, this.curMisTouchNum = 0);
        }

      }

      a.AdMisTouchManager = t;
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdMisTouchView = class {
        constructor() {}

        init() {}

      };
    }(uniSdk = uniSdk || {}), function (d) {
      class a {
        constructor() {
          this.isInit = !1, this.ipData = null, this.showBannerTimeout = null, this.curBannerIndex = 0, this.showBannerTimestamp = 0, this.autoBannerCallback = null, this.autoBannerCallbackTarget = null, this.wx_isShared = !1, this.wx_sharedCloseTime = 0, this.shareInfoArr = [], this.banners = [], this.customs = [], this.adConfig = null, this.bannerWidth = 0, this.recordState = 0, this.recordDuration = 0, this.startRecordTimestamp = 0, this.stopRecordCallback = null, this.stopRecordCallbackTarget = null, this.boxBannerAd = null, this.boxPortalAd = null, this.bannerShowIntervalTimer = 30, this.advertInfo = null, this.adIdleTime = 0, this.isVideoShowed = !1, this.needForceAd = !0;
        }

        static get instance() {
          return null == a._instance && (a._instance = new a()), a._instance;
        }

        getSystemInfoSync() {
          let t = null;
          var e;
          return t = window[d.Global.platformName] && window[d.Global.platformName].getSystemInfoSync ? window[d.Global.platformName].getSystemInfoSync() : ((e = {}).screenWidth = d.Global.screenWidth, e.screenHeight = d.Global.screenHeight, e.windowWidth = d.Global.screenWidth, e.windowHeight = d.Global.screenHeight, e);
        }

        regisiterCallback() {
          null != window[d.Global.platformName] && (window[d.Global.platformName].onShow && window[d.Global.platformName].onShow(t => {
            d.AdPlat.instance.onShowCallback(t);
          }), window[d.Global.platformName].onHide) && window[d.Global.platformName].onHide(t => {
            d.AdPlat.instance.onHideCallback(t);
          });
        }

        onShowCallback(t) {
          console.log("onShowCallback", t);
          t = new Date().getTime();
          this.wx_isShared && (4e3 <= t - this.wx_sharedCloseTime ? (console.log("分享成功"), this.wx_sharedCloseTime = t, this.shareCallback && this.shareCallback.call(this.shareCallbackTarget, !0)) : (console.log("分享失败"), this.shareCallback && this.shareCallback.call(this.shareCallbackTarget, !1)), this.wx_isShared = !1), d.reportEvent("enterApp");
        }

        onHideCallback(t) {
          d.BrowersUtils.isAndroid() && d.reportEvent("leaveApp");
          t = t && (8 == t.targetAction || 9 == t.targetAction || 10 == t.targetAction) && 50 < t.targetPagePath.length;
          t && this.autoBannerCallback && this.autoBannerCallback.call(this.autoBannerCallbackTarget, t), this.autoBannerCallback = null, this.autoBannerCallbackTarget = null;
        }

        setLoginCallback(t, e) {
          this.loginCallback = t, this.loginCallbackTarget = e;
        }

        login(t, e, o) {
          null == d.Global.API_URL || d.Global.API_URL.length <= 0 || !d.Global.appKey || d.Global.appKey.length <= 0 || !d.Global.channel || d.Global.channel.length <= 0 ? (this.loginCallback && this.loginCallback.call(this.loginCallbackTarget, d.Global.userInfo), this.loginCallback = null, this.loginCallbackTarget = null) : (t = d.Global.API_URL + "?service=sdk.login&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel + "&token=" + t + "&openid=" + e + "&anonymousCode=" + o, d.Global.doGet(t, this.onLoginComplete, this));
        }

        onLoginComplete(t) {
          t && 200 == t.ret && (0 == t.data.errcode && t.data && t.data.userinfo ? (t.data.userinfo.nickname && 0 < t.data.userinfo.nickname.length && (d.Global.userInfo.nickName = t.data.userinfo.nickname), t.data.userinfo.user_avatar && 0 < t.data.userinfo.user_avatar.length && (d.Global.userInfo.avatarUrl = t.data.userinfo.user_avatar), d.Global.userInfo.gameLevel = Number(t.data.userinfo.game_level), d.Global.userInfo.level = Number(t.data.userinfo.user_level), d.Global.userInfo.money = Number(t.data.userinfo.user_money), d.Global.userInfo.score = Number(t.data.userinfo.user_score), d.Global.userInfo.openid = t.data.userinfo.openid, d.Global.userInfo.uid = Number(t.data.userinfo.id), d.Global.reportAldOpenId(d.Global.userInfo.openid), d.Global.setLocalStorage(d.Global.appKey + "_openid", d.Global.userInfo.openid), d.Global.lastEventName = "登陆成功") : t.data.errmsg && (d.Global.lastEventName = "登陆失败", console.error(t.data.errmsg))), this.loginCallback && this.loginCallback.call(this.loginCallbackTarget, d.Global.userInfo), this.loginCallback = null, this.loginCallbackTarget = null;
        }

        requestRankList(t, e, o, a) {
          null == d.Global.API_URL || d.Global.API_URL.length <= 0 || !d.Global.appKey || d.Global.appKey.length <= 0 || !d.Global.channel || d.Global.channel.length <= 0 ? o && o.call(a) : (this.rankCallback = o, this.rankCallbackTarget = a, "gameLevel" == t ? t = "game_level" : "level" == t ? t = "user_level" : "money" == t ? t = "user_money" : "score" == t && (t = "user_score"), o = d.Global.API_URL + "?service=sdk.getRankList&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel + "&keyword=" + t + "&pageSize=" + (e = e || 100), d.Global.doGet(o, this.onResponseRankList, this));
        }

        onResponseRankList(e) {
          var o = [];
          if (e && 200 == e.ret && e.data && 0 == e.data.errcode && e.data.list && 0 < e.data.list.length) for (let t = 0; t < e.data.list.length; t++) {
            var a = e.data.list[t],
                i = new d.UserInfo();
            a.game_level && (i.gameLevel = Number(a.game_level)), a.user_level && (i.level = Number(a.user_level)), a.user_money && (i.money = Number(a.user_money)), a.user_score && (i.score = Number(a.user_score)), a.nickname && 0 < a.nickname.length && (i.nickName = a.nickname), a.user_avatar && 0 < a.user_avatar.length && (i.avatarUrl = a.user_avatar), i.openid = a.openid, i.uid = Number(a.id), o.push(i);
          }
          this.rankCallback && this.rankCallback.call(this.rankCallbackTarget, o), this.rankCallback = null, this.rankCallbackTarget = null;
        }

        reportEvent(t) {
          var e;
          null == d.Global.API_URL || d.Global.API_URL.length <= 0 || !d.Global.appKey || d.Global.appKey.length <= 0 || !d.Global.channel || d.Global.channel.length <= 0 || null == t || t.length <= 0 || d.Global.userInfo && d.Global.userInfo.uid && (e = d.Global.API_URL + "?service=sdk.createEvent&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel + "&uid=" + d.Global.userInfo.uid + "&stageName=" + t + "&lastStageName=" + d.Global.lastEventName, d.Global.doGet(e), "enterApp" != t) && "leaveApp" != t && (d.Global.lastEventName = t);
        }

        reportGameLevelStartEvent(t, e) {
          !d.Global.appKey || d.Global.appKey.length <= 0 || !d.Global.channel || d.Global.channel.length <= 0 || null == e || e.length <= 0 || d.Global.userInfo && d.Global.userInfo.uid && (t = d.Global.API_URL + "?service=sdk.startLevelEvent&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel + "&uid=" + d.Global.userInfo.uid + "&level=" + t + "&stageName=" + e, d.Global.doGet(t), "enterApp" != e) && "leaveApp" != e && (d.Global.lastEventName = e);
        }

        reportGameLevelEndEvent(t, e, o) {
          null == d.Global.API_URL || d.Global.API_URL.length <= 0 || !d.Global.appKey || d.Global.appKey.length <= 0 || !d.Global.channel || d.Global.channel.length <= 0 || null == e || e.length <= 0 || d.Global.userInfo && d.Global.userInfo.uid && (t = d.Global.API_URL + "?service=sdk.endLevelEvent&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel + "&uid=" + d.Global.userInfo.uid + "&level=" + t + "&stageName=" + e + "&isWin=" + o, d.Global.doGet(t), "enterApp" != e) && "leaveApp" != e && (d.Global.lastEventName = e);
        }

        init(t) {
          if (!this.isInit) {
            if (this.isInit = !0, this.systemInfo = this.getSystemInfoSync(), this.initRecord(), this.initShare(), this.regisiterCallback(), this.adConfig = t, window[d.Global.platformName] && window[d.Global.platformName].setKeepScreenOn && window[d.Global.platformName].setKeepScreenOn({
              keepScreenOn: !0
            }), this.shareInfoArr = [], t && t.shareInfoArr && (this.shareInfoArr = t.shareInfoArr), t && t.adBannerIdList) {
              var e = t.adBannerIdList;

              for (let t = 0; t < e.length; t++) {
                var o = e[t];
                0 < o.length && this.createBanner(o);
              }
            }

            if (t && t.adCustomIdList) {
              var a = t.adCustomIdList;

              for (let t = 0; t < a.length; t++) {
                var i = a[t];
                0 < i.length && this.createCustom(i, t);
              }
            }

            var l;
            t && t.adVideoIdList && 0 < t.adVideoIdList.length && this.createRewardedVideo(t.adVideoIdList), t && t.adInterstitialId && 0 < t.adInterstitialId.length && (l = t.adInterstitialId, this.createInterstitial(l)), t && t.isExportWxGameAd && this.requestGameExportData(), t && t.adBoxBannerId && 0 < t.adBoxBannerId.length && (this.boxBannerAdUnitId = t.adBoxBannerId), t && t.adBoxPortalId && 0 < t.adBoxPortalId.length && (this.adBoxPortalUnitId = t.adBoxPortalId), d.Global.appKey && 0 < d.Global.appKey.length ? this.initConfig(this.initConfigComplete, this) : this.initConfigComplete();
          }
        }

        initShare() {
          null != window[d.Global.platformName] && (window[d.Global.platformName].showShareMenu && window[d.Global.platformName].showShareMenu({
            withShareTicket: !0,
            menus: ["shareAppMessage", "shareTimeline"],
            success: null,
            fail: null,
            complete: null
          }), window[d.Global.platformName].onShareAppMessage && window[d.Global.platformName].onShareAppMessage(() => d.AdPlat.instance.buildShareInfo()), window[d.Global.platformName].onShareTimeline) && window[d.Global.platformName].onShareTimeline(() => d.AdPlat.instance.buildShareInfo());
        }

        initRecord() {
          console.warn("----初始化录屏---initRecord-----------"), this.recorderManager || (window[d.Global.platformName] && window[d.Global.platformName].getGameRecorderManager ? this.recorderManager = window[d.Global.platformName].getGameRecorderManager() : this.recorderManager = null, console.warn("initRecord", this.recorderManager));
        }

        getRecordDuration() {
          return this.recordDuration;
        }

        startRecord(o) {
          void 0 === o && (o = 300), null == this.recorderManager && (this.initRecord(), null == this.recorderManager) || 0 == this.recordState && (this.recordState = 1, console.log("startRecord - 开始录屏", this.recordState), 300 < o && (o = 300), this.recordVideoPath = null, this.startRecordTimestamp = 0, this.recordDuration = 0, this.recorderManager.onStart(t => {
            console.log("record onStart", t), d.AdPlat.instance.startRecordTimestamp = new Date().valueOf();
            let e = setTimeout(() => {
              clearTimeout(e), d.AdPlat.instance.stopRecord();
            }, 1e3 * o - 5e3);
          }), this.recorderManager.onError(t => {
            console.log("record onError", t), d.AdPlat.instance.recordState = 0, d.AdPlat.instance.recordDuration = 0, d.AdPlat.instance.startRecordTimestamp = 0, d.AdPlat.instance.recordVideoPath = null;
          }), this.recorderManager.start({
            duration: o
          }));
        }

        stopRecord(t, e) {
          null != this.recorderManager && (0 == this.recordState ? this.startRecordTimestamp <= 0 && (this.stopRecordCallback && this.stopRecordCallback.call(this.stopRecordCallbackTarget, !1), this.stopRecordCallback = null, this.stopRecordCallbackTarget = null) : (this.recordState = 0, this.stopRecordCallback = t, this.stopRecordCallbackTarget = e, console.log("stopRecord - 手工停止录屏", this.recordState), new Date().valueOf(), this.recorderManager.onStop(t => {
            console.log("record onStop", t, t.videoPath), d.AdPlat.instance.recordState = 0, d.AdPlat.instance.recordVideoPath = t.videoPath;
            var e = new Date().valueOf();
            d.AdPlat.instance.recordDuration = e - this.startRecordTimestamp, d.AdPlat.instance.stopRecordCallback && (e = !!(t.videoPath && 0 < t.videoPath.length), d.AdPlat.instance.stopRecordCallback.call(d.AdPlat.instance.stopRecordCallbackTarget, e, d.AdPlat.instance.recordDuration, t.videoPath)), d.AdPlat.instance.stopRecordCallback = null, d.AdPlat.instance.stopRecordCallbackTarget = null;
          }), this.recorderManager.stop()));
        }

        pauseRecord() {
          null != this.recorderManager && (console.log("pauseRecord - 暂停录屏", this.recordState), 1 == this.recordState) && (this.recordState = 2, this.recorderManager.pause());
        }

        resumeRecord() {
          null != this.recorderManager && (console.log("resumeRecord - 继续录屏", this.recordState), 2 == this.recordState) && this.recorderManager.resume();
        }

        share(t, e, o, a) {
          null == window[d.Global.platformName] || null == window[d.Global.platformName].shareAppMessage ? e && e.call(a, !0) : (this.shareCallback = e, this.shareShortCallback = o, this.shareCallbackTarget = a, e = this.buildShareInfo(t), console.log("分享数据：", e), null != e && (d.Global.isWxgame && (this.wx_isShared = !0, this.wx_sharedCloseTime = new Date().getTime()), window[d.Global.platformName].shareAppMessage(e)));
        }

        buildShareInfo(e) {
          void 0 === e && (e = null);
          let o = this,
              a = "",
              i = "";

          if (this.shareInfoArr && 0 < this.shareInfoArr.length && ((l = this.shareInfoArr[0]) && l.title && (a = l.title), l) && l.img && (i = l.img), d.Global.isTTGame) {
            var l = this.recordVideoPath;
            console.warn("videoPath", l);
            let t = "";
            e && -1 != ["article", "video", "token"].indexOf(e.channel) && (t = e.channel);
            var s,
                n = [];

            for (s in e) n.push(s + "=" + e[s]);

            return {
              channel: t,
              title: a,
              imageUrl: i,
              query: n.join("&"),
              extra: {
                videoPath: l,
                videoTopics: [a],
                withVideoId: !0
              },
              success: function (t) {
                console.log("share video success :", t), o.shareVideoId = t.videoId, o.shareCallback && o.shareCallback.call(o.shareCallbackTarget, !0);
              },
              fail: function (t) {
                console.log("share video fail ", t), console.log("index of : ", t.errMsg.indexOf("short")), d.showPopup("分享失败"), d.AdPlat.instance.stopRecordCallback = null, d.AdPlat.instance.stopRecordCallbackTarget = null, d.AdPlat.instance.recordState = 0, o.shareCallback && o.shareCallback.call(o.shareCallbackTarget, !1);
              }
            };
          }

          return d.Global.isWxgame ? (console.log("uniSdk.Global.isWxgame true"), (l = {}).query = e, a && 0 < a.length && (l.title = a), i && 0 < i.length && (l.imageUrl = i), l) : null;
        }

        showRewardedVideo(t, e, o) {
          this.video ? this.isVideoShowed ? console.warn("操作视频广告过于频繁") : (this.isVideoShowed = !0, this.video.show(t, e, o), this.showVideoTimeout = window.setTimeout(() => {
            a.instance.isVideoShowed = !1, a.instance.showVideoTimeout && (window.clearTimeout(a.instance.showVideoTimeout), a.instance.showVideoTimeout = null);
          }, 3e3)) : e && e.call(o, 1);
        }

        showInterstitial(t, e, o) {
          d.Global.gameConfig && 0 == d.Global.gameConfig.interstitialAdStatus || (this.interstitial ? this.interstitial.show(t, e, o) : t ? t.call(o, !1) : e && e.call(o));
        }

        showCustomAd(t, e, o, a) {
          this.customs.length <= (t = t || 0) ? e && e.call(a, !1) : this.customs[t].show(e, o, a);
        }

        hideCustomAd(t) {
          if (null == t) for (let t = 0; t < this.customs.length; t++) this.customs[t].hide();else this.customs.length <= t || this.customs[t].hide();
        }

        setBannerMaxShowTimes(t) {
          this.bannerShowIntervalTimer = t;
        }

        setBannerWidth(t) {
          this.bannerWidth = t;
        }

        availableBanner() {
          for (let t = 0; t < this.banners.length; t++) {
            var e = this.banners[t];
            if (e.isLoaded) return e;
          }

          return null;
        }

        createBanner(e) {
          for (let t = 0; t < this.banners.length; t++) if (this.banners[t].id == e) return null;

          let t = null;
          "wx" == d.Global.channel ? t = new d.WX_AdBanner(e, this.bannerWidth) : "vivo" == d.Global.channel ? t = new d.VIVO_AdBanner(e, this.bannerWidth) : "oppo" == d.Global.channel ? t = new d.OPPO_AdBanner(e, this.bannerWidth) : "tt" == d.Global.channel && (t = new d.TT_AdBanner(e, this.bannerWidth)), t && this.banners.push(t);
        }

        destroyBanners() {
          for (let t = 0; t < this.banners.length; t++) this.banners[t].destroy();

          this.banners.length = 0;
        }

        createCustom(t, e) {
          let o = null;
          "wx" == d.Global.channel ? o = new d.WX_AdCustom(t, e) : "vivo" == d.Global.channel ? o = new d.VIVO_AdCustom(t, e) : "oppo" == d.Global.channel && (o = new d.OPPO_AdCustom(t, e)), o && this.customs.push(o);
        }

        createRewardedVideo(t) {
          "wx" == d.Global.channel ? this.video = new d.WX_AdRewardedVideo(t) : "vivo" == d.Global.channel ? this.video = new d.VIVO_AdRewardedVideo(t) : "oppo" == d.Global.channel ? this.video = new d.OPPO_AdRewardedVideo(t) : "tt" == d.Global.channel && (this.video = new d.TT_AdRewardedVideo(t));
        }

        createInterstitial(t) {
          "wx" == d.Global.channel ? this.interstitial = new d.WX_AdInterstitial(t) : "vivo" == d.Global.channel ? this.interstitial = new d.VIVO_AdInterstitial(t) : "oppo" == d.Global.channel ? this.interstitial = new d.OPPO_AdInterstitial(t) : "tt" == d.Global.channel && (this.interstitial = new d.TT_AdInterstitial(t));
        }

        showBoxBannerAd(t, e) {
          !this.boxBannerAdUnitId || this.boxBannerAdUnitId.length <= 0 || d.Global.isVivogame && window[d.Global.platformName] && window[d.Global.platformName].createBoxBannerAd && (null == this.boxBannerAd && (this.boxBannerAdCloseCallback = t, this.boxBannerAdCallbackTarget = e, this.boxBannerAd = window[d.Global.platformName].createBoxBannerAd({
            posId: this.boxBannerAdUnitId
          }), this.boxBannerAd.onClose(this.onCloseForBoxBannerAd.bind(this))), this.boxBannerAd.show());
        }

        hideBoxBannerAd(t) {
          void 0 === t && (t = !0), d.Global.isVivogame && this.boxBannerAd && (this.boxBannerAd.hide(), t) && (this.boxBannerAd.offClose(this.onCloseForBoxBannerAd), this.boxBannerAd.isDestroyed = !0, this.boxBannerAd.destroy(), this.boxBannerAd = null, this.boxBannerAdCloseCallback = null, this.boxBannerAdCallbackTarget = null);
        }

        onCloseForBoxBannerAd() {
          d.Global.isVivogame && this.boxBannerAd && (this.boxBannerAd.isDestroyed || this.boxBannerAdCloseCallback && this.boxBannerAdCloseCallback.call(this.boxBannerAdCallbackTarget));
        }

        createBoxPortalAd(t, e, o) {
          !this.adBoxPortalUnitId || this.adBoxPortalUnitId.length <= 0 || (d.Global.isVivogame && window[d.Global.platformName] && window[d.Global.platformName].createBoxPortalAd && null == this.boxPortalAd ? (this.boxPortalAd = t && 0 < t ? window[d.Global.platformName].createBoxPortalAd({
            posId: this.adBoxPortalUnitId,
            marginTop: t
          }) : window[d.Global.platformName].createBoxPortalAd({
            posId: this.adBoxPortalUnitId
          }), this.boxPortalAd.show()) : d.Global.isOppogame && window[d.Global.platformName] && window[d.Global.platformName].createGamePortalAd && (null == this.boxPortalAd && (this.boxPortalAdCloseCallback = e, this.boxPortalAdCallbackTarget = o, this.boxPortalAd = window[d.Global.platformName].createGamePortalAd({
            adUnitId: this.adBoxPortalUnitId
          }), this.boxPortalAd.onClose(this.onCloseForBoxPortalAd.bind(this))), this.boxPortalAd.show()));
        }

        destroyBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAd.offClose(this.onCloseForBoxPortalAd), this.boxPortalAd.destroy(), this.boxPortalAd = null);
        }

        onCloseForBoxPortalAd() {
          d.Global.isOppogame && this.boxPortalAd && this.boxPortalAdCloseCallback && this.boxPortalAdCloseCallback.call(this.boxPortalAdCallbackTarget);
        }

        showBanner(t) {
          this.banners.length <= 0 ? console.warn("banner id 列表为空") : (t = (t = void 0 === t ? -1 : t) < 0 || t >= this.banners.length ? -1 : t) < 0 ? (null == this.showBannerTimeout && (this.showBannerTimeout = window.setInterval(() => {
            d.AdPlat.instance.changeShowBanner(-1);
          }, 1e3 * this.bannerShowIntervalTimer)), this.changeShowBanner(-1)) : (this.showBannerTimeout && (window.clearInterval(this.showBannerTimeout), this.showBannerTimeout = null), this.changeShowBanner(t));
        }

        hideBanner() {
          this.showBannerTimeout && (window.clearInterval(this.showBannerTimeout), this.showBannerTimeout = null);

          for (let t = 0; t < this.banners.length; t++) this.banners[t].hide();
        }

        changeShowBanner(e) {
          if (Date.now() - this.showBannerTimestamp < 3e3) console.warn("请勿频繁调用 showBanner");else {
            this.curBannerIndex >= this.banners.length && (this.curBannerIndex = 0), e < 0 && (e = this.curBannerIndex);

            for (let t = 0; t < this.banners.length; t++) {
              var o = this.banners[t];
              e != t && o.hide();
            }

            this.banners[e].show(), ++this.curBannerIndex, this.showBannerTimestamp = Date.now();
          }
        }

        testIpRegion(e) {
          if (console.log("testIpRegion", e), !(null == e || e.length <= 0)) {
            if (null == this.ipData) return !1;

            for (let t = 0; t < e.length; t++) {
              var o = e[t];
              if (-1 != this.ipData.area.search(o)) return console.log("当前IP是屏蔽区"), !1;
            }
          }

          return !0;
        }

        initConfig(e, o) {
          let a = this;
          a.ipData = null, this.requestIP(t => {
            console.log("ipinfo", t), t && t.data && (a.ipData = t.data), a.requestGameConfig(t => {
              console.log(t), d.Global.gameConfig = null, this.advertInfo = null, t && t.data && (this.advertInfo = t.data, d.Global.gameConfig = {}, d.Global.gameConfig.horizontalBanner = this.advertInfo.horizontalBanner, d.Global.gameConfig.videoIconStatus = this.advertInfo.videoIconStatus, d.Global.gameConfig.interstitialAdStatus = this.advertInfo.interstitialAdStatus, d.Global.gameConfig.endCustom = this.advertInfo.endCustom, d.Global.gameConfig.recomdVideo = this.advertInfo.recomdVideo, d.Global.gameConfig.endLevelCustom = this.advertInfo.endLevelCustom, d.Global.gameConfig.endLevelStyle = this.advertInfo.endLevelStyle, d.Global.gameConfig.endNRefresh = this.advertInfo.endNRefresh, d.Global.gameConfig.bannerStatus = this.advertInfo.bannerStatus, d.Global.gameConfig.switchStatus = this.advertInfo.switchStatus, d.Global.gameConfig.buttonRefresh = this.advertInfo.buttonRefresh, d.Global.gameConfig.skillVideoProbability = this.advertInfo.skillVideoProbability, d.Global.gameConfig.independentSwitch = this.advertInfo.independentSwitch, d.Global.gameConfig.mistouchNum = this.advertInfo.mistouchNum, d.Global.gameConfig.mistouchNumFromLevel = this.advertInfo.mistouchNumFromLevel, d.Global.gameConfig.otherClickMislead = this.advertInfo.otherClickMislead, d.Global.gameConfig.propClickMislead = this.advertInfo.propClickMislead, d.Global.gameConfig.resultClickMislead = this.advertInfo.resultClickMislead, d.Global.gameConfig.startGameForceAd = this.advertInfo.startGameForceAd, d.Global.gameConfig.endGameForceAd = this.advertInfo.endGameForceAd, d.Global.gameConfig.gameForceAd = this.advertInfo.gameForceAd), this.advertInfo && a.ipData && (a.testIpRegion(this.advertInfo.disabledRegion) && 0 != this.advertInfo.state || (d.Global.gameConfig.mistouchNum = 0, d.Global.gameConfig.mistouchNumFromLevel = 0, d.Global.gameConfig.otherClickMislead = 0, d.Global.gameConfig.propClickMislead = 0, d.Global.gameConfig.resultClickMislead = 0, d.Global.gameConfig.startGameForceAd = [0], d.Global.gameConfig.endGameForceAd = [0], d.Global.gameConfig.gameForceAd = [0])), console.log("advertInfo", this.advertInfo), e && e.call(o);
            }, a);
          }, this);
        }

        initConfigComplete() {
          console.log("-----SDK已就绪-----"), d.MessageProxy.dispatch(d.Cmd.SDK_INIT_COMPLETED), a.instance.adIdleTime = 0, this.update(), setInterval(() => {
            a.instance.update();
          }, 1e3);
        }

        requestIP(t, e) {
          var o;
          null == d.Global.API_URL || d.Global.API_URL.length <= 0 ? t && t.call(e, null) : (o = d.Global.API_URL + "?service=sdk.getLocation", d.Global.doGet(o, t, e));
        }

        requestGameConfig(t, e) {
          var o;
          d.Global.API_URL && 0 < d.Global.API_URL.length && d.Global.appKey && 0 < d.Global.appKey.length ? (o = d.Global.API_URL + "?service=sdk.getAdvertInfo&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel, d.Global.doGet(o, t, e)) : t && t.call(e, null);
        }

        requestGameExportData() {
          var t;
          d.Global.API_URL && 0 < d.Global.API_URL.length && d.Global.appKey && 0 < d.Global.appKey.length ? (t = d.Global.API_URL + "?service=sdk.getGameExportInfo&appkey=" + d.Global.appKey + "&channel=" + d.Global.channel, d.Global.doGet(t, this.requestGameExportDataComplete, this)) : console.warn("警告：请求游戏导出配置失败，请指定APPKEY");
        }

        requestGameExportDataComplete(e) {
          if (d.Global.adItemDataList = [], e && e.data) {
            for (let t = 0; t < e.data.length; t++) {
              var o = e.data[t];
              d.Global.adItemDataList.push(o);
            }

            this.loadAsset(d.Global.adItemDataList);
          }
        }

        updateValidTimeRange() {
          if (null != d.Global.gameConfig) {
            var a = new Date().getDay();
            let t = this.advertInfo.fixStartTime,
                e = this.advertInfo.fixEndTime;
            0 != a && 6 != a || (t = this.advertInfo.fixStartWeekTime, e = this.advertInfo.fixEndWeekime);
            var a = t.split(":"),
                i = Number(a[0]),
                l = Number(a[1]),
                a = e.split(":"),
                s = Number(a[0]),
                a = Number(a[1]),
                n = new Date(),
                r = n.getHours(),
                n = n.getMinutes();
            let o = i <= r && r <= s && (r != i || r != s || l <= n && n <= a) ? !0 : !1;
            o ? (d.Global.gameConfig.mistouchNum = this.advertInfo.mistouchNum, d.Global.gameConfig.mistouchNumFromLevel = this.advertInfo.mistouchNumFromLevel, d.Global.gameConfig.otherClickMislead = this.advertInfo.otherClickMislead, d.Global.gameConfig.propClickMislead = this.advertInfo.propClickMislead, d.Global.gameConfig.resultClickMislead = this.advertInfo.resultClickMislead, d.Global.gameConfig.startGameForceAd = this.advertInfo.startGameForceAd, d.Global.gameConfig.endGameForceAd = this.advertInfo.endGameForceAd, d.Global.gameConfig.gameForceAd = this.advertInfo.gameForceAd) : (d.Global.gameConfig.independentSwitch = this.advertInfo.independentSwitch, d.Global.gameConfig.mistouchNum = 0, d.Global.gameConfig.mistouchNumFromLevel = 0, d.Global.gameConfig.otherClickMislead = 0, d.Global.gameConfig.propClickMislead = 0, d.Global.gameConfig.resultClickMislead = 0, d.Global.gameConfig.startGameForceAd = [0], d.Global.gameConfig.endGameForceAd = [0], d.Global.gameConfig.gameForceAd = [0]);
          }
        }

        update() {
          this.advertInfo && 0 != this.advertInfo.state && (this.advertInfo.fixTimeSwitch && this.updateValidTimeRange(), this.updateForceAd(1e3));
        }

        updateForceAd(t) {
          var e, o;
          null == d.Global.gameConfig || null == d.Global.gameConfig.gameForceAd || d.Global.gameConfig.gameForceAd.length < 2 || (e = d.Global.gameConfig.gameForceAd[0], (o = d.Global.gameConfig.gameForceAd[1]) <= 0) || e <= 1 || -1 != d.Global.curGameLevel && a.instance.needForceAd && (a.instance.adIdleTime += t, a.instance.adIdleTime >= e) && (1 == o ? (a.instance.needForceAd = !1, a.instance.adIdleTime = 0, d.showRewardedVideo(0, t => {
            a.instance.needForceAd = !0;
          }, this)) : 2 == o ? (a.instance.needForceAd = !1, a.instance.adIdleTime = 0, d.showInterstitial(t => {
            t || (a.instance.needForceAd = !0);
          }, () => {
            a.instance.needForceAd = !0;
          }, this)) : 3 == o && (a.instance.needForceAd = !1, a.instance.adIdleTime = 0, d.showCustomAd(0, t => {
            t || (a.instance.needForceAd = !0);
          }, () => {
            a.instance.needForceAd = !0;
          }, this)));
        }

        loadAsset(e) {
          for (let t = 0; t < e.length; t++) {
            var o = e[t];
            this.loadAssetImpl(o);
          }
        }

        loadAssetImpl(o) {
          d.Global.isWxgame && 2 == d.Global.engineType && window.cc.assetManager.loadRemote(o.img, (t, e) => {
            t ? console.error(t.message || t) : o.imageAsset = e;
          });
        }

      }

      d.AdPlat = a;
    }(uniSdk = uniSdk || {}), function (t) {
      t.AdRewardedVideo = class {};
    }(uniSdk = uniSdk || {}), function (s) {
      class e {
        constructor() {
          this.url = null, this.callback = null, this.callbackTarget = null, e.clientList.push(this);
        }

        send(t, e, o, a, i) {
          if (this.url && 0 < this.url.length) return !1;
          void 0 === i && (i = "POST");
          let l = this;
          e = "object" == typeof e ? JSON.stringify(e) : e;
          this.url = t, this.callback = o, this.callbackTarget = a, window[s.Global.platformName] && window[s.Global.platformName].request ? window[s.Global.platformName].request({
            url: this.url,
            data: e,
            method: i,
            header: {
              "content-type": "application/json;charset=UTF-8"
            },

            success(t) {
              l.onHttpComplete(t.data);
            },

            fail(t) {
              l.onHttpComplete(null);
            }

          }) : (console.log("HttpClient send", t), (o = new s.WebHttpRequest()).responseType = "text", o.open(t, i), o.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8"), o.send(e), o.setResponseEventListener(t => {
            console.warn("response", t);
            let e = null;

            try {
              e = JSON.parse(t);
            } catch (t) {
              e = null;
            }

            l.onHttpComplete(e);
          }, this));
        }

        destroy() {
          this.url = null, this.callback = null, this.callbackTarget = null;

          for (let t = 0; t < e.clientList.length; t++) if (e.clientList[t] == this) {
            e.clientList.splice(t, 1);
            break;
          }
        }

        onHttpComplete(t) {
          this.callback && this.callback.call(this.callbackTarget, t), this.destroy();
        }

      }

      e.clientList = [], s.HttpClient = e;
    }(uniSdk = uniSdk || {}), function (t) {
      t.WebHttpRequest = class {
        constructor() {
          this.timeout = 0, this.callback = null, this.callbackTarget = null, this._url = "", this._method = "";
        }

        setResponseEventListener(t, e) {
          this.callback = t, this.callbackTarget = e;
        }

        dispatchResponseEvent(t) {
          t ? this.callback && this.callback.call(this.callbackTarget) : this.callback && this.callback.call(this.callbackTarget, this.response), this.callback = null, this.callbackTarget = null;
        }

        get response() {
          return this._xhr ? null != this._xhr.response ? this._xhr.response : "text" == this._responseType ? this._xhr.responseText : "arraybuffer" == this._responseType && /msie 9.0/i.test(navigator.userAgent) ? window.convertResponseBodyToText(this._xhr.responseBody) : "document" == this._responseType ? this._xhr.responseXML : null : null;
        }

        get responseType() {
          return this._responseType;
        }

        set responseType(t) {
          this._responseType = t;
        }

        get withCredentials() {
          return this._withCredentials;
        }

        set withCredentials(t) {
          this._withCredentials = t;
        }

        getXHR() {
          return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
        }

        open(t, e = "GET") {
          this._url = t, this._method = e, this._xhr && (this._xhr.abort(), this._xhr = null);
          t = this.getXHR();
          window.XMLHttpRequest ? (t.addEventListener("load", this.onload.bind(this)), t.addEventListener("error", this.onerror.bind(this))) : t.onreadystatechange = this.onReadyStateChange.bind(this), t.onprogress = this.updateProgress.bind(this), t.ontimeout = this.onTimeout.bind(this), t.open(this._method, this._url, !0), this._xhr = t;
        }

        send(t) {
          if (null != this._responseType && (this._xhr.responseType = this._responseType), null != this._withCredentials && (this._xhr.withCredentials = this._withCredentials), this.headerObj) for (var e in this.headerObj) this._xhr.setRequestHeader(e, this.headerObj[e]);
          this._xhr.timeout = this.timeout, this._xhr.send(t);
        }

        abort() {
          this._xhr && this._xhr.abort();
        }

        getAllResponseHeaders() {
          return this._xhr ? this._xhr.getAllResponseHeaders() || "" : null;
        }

        setRequestHeader(t, e) {
          this.headerObj || (this.headerObj = {}), this.headerObj[t] = e;
        }

        getResponseHeader(t) {
          return this._xhr ? this._xhr.getResponseHeader(t) || "" : null;
        }

        onTimeout() {
          this.dispatchResponseEvent(!0);
        }

        onReadyStateChange() {
          var o = this._xhr;

          if (4 == o.readyState) {
            let t = 400 <= o.status || 0 == o.status;
            this._url;
            let e = this;
            window.setTimeout(function () {
              e.dispatchResponseEvent(t);
            }, 0);
          }
        }

        updateProgress(t) {
          t.lengthComputable;
        }

        onload() {
          let t = this;
          var e = this._xhr;
          this._url;
          let o = 400 <= e.status;
          window.setTimeout(function () {
            o ? t.callback && t.callback.call(t.callbackTarget) : t.callback && t.callback.call(t.callbackTarget, t.response);
          }, 0);
        }

        onerror() {
          this._url;
          let t = this;
          window.setTimeout(function () {
            t.dispatchResponseEvent(!0);
          }, 0);
        }

      };
    }(uniSdk = uniSdk || {}), function (t) {
      t.OppoPlatform = class {
        constructor() {
          this.BANNER_AD_POSID = "__BANNER_AD_POSID__", this.VIDEO_AD_POSID = "__VIDEO_AD_POSID__", this.CUSTOM_AD_POSID = "__CUSTOM_AD_POSID__", this.BOX_BANNER_AD_POSID = "__BOX_BANNER_AD_POSID__", this.BOX_PORTAL_AD_POSID = "__BOX_PORTAL_AD_POSID__", this.shortcutButton = null, this.banner = null, this.videoAd = null, this.boxPortalAd = null, this.boxBannerAd = null, this.customAd = null, this.videoAdLoading = !1, this.bannerAdShowed = !1, this.boxBannerAdShowed = !1, this.boxPortalAdShowed = !1, this.customAdShowed = !1;
        }

        showMaskLayer() {}

        hideMaskLayer() {}

        init(t, e) {
          t && t.call(e);
        }

        login(t, e, o) {
          console.log("DebugWebPlatform.login");
        }

        downloadResource(t, e, o, a, i) {}

        showBannerAdvertisement(t, e, o) {
          if (!this.boxBannerAdShowed) {
            console.log("showBannerAdvertisement"), this.customAd && (this.customAd.hide(), this.customAdShowed = !1);
            let t = this;
            null == this.banner && (this.banner = window.qg.createBannerAd({
              adUnitId: this.BANNER_AD_POSID,
              style: {}
            }), this.banner.onError(t => {
              console.log("banner广告加载失败", t);
            })), this.banner.show().then(() => {
              t.bannerAdShowed = !0, console.log("banner广告展示完成");
            }).catch(t => {
              console.error("banner广告展示失败", JSON.stringify(t));
            });
          }
        }

        hideBannerAdvertisement(t) {
          console.log("hideBannerAdvertisement"), null != this.banner && (this.bannerAdShowed = !1, this.banner.hide());
        }

        showInterstitialAdvertisement(t, e, o) {}

        showNativeAdvertisement(t, e, o) {
          if (this.CUSTOM_AD_POSID.length <= 0) e && e.call(o);else {
            let e = this,
                o = this.bannerAdShowed;
            this.hideBannerAdvertisement(null), null == this.customAd && (this.customAd = window.qg.createCustomAd({
              adUnitId: this.CUSTOM_AD_POSID
            })), this.customAd.show().then(() => {
              e.customAdShowed = !0;
            }).catch(t => {
              e.customAdShowed = !1, o && this.showBannerAdvertisement(null, null, null);
            });
          }
        }

        showVideoAdvertisement(t, e, o) {
          console.log("showVideoAdvertisement");
          let a = this;
          null == this.videoAd ? (this.videoAd = window.qg.createRewardedVideoAd({
            adUnitId: this.VIDEO_AD_POSID
          }), this.videoAd.onError(t => {
            e && e.call(o, -1);
          }), this.videoAd.onLoad(function (t) {
            a.videoAd.show().then(() => {
              console.log("激励视频广告展示完成");
            }).catch(t => {
              console.error("激励视频广告展示失败");
            });
          }), this.videoAd.onClose(t => {
            t && t.isEnded ? e && e.call(o, 1) : e && e.call(o, 0);
          })) : this.videoAd.load();
        }

        clearResCache() {}

        showShortcut() {}

        hideShortcut() {}

        destroyShortcut() {}

        createBoxPortalAd() {
          if (!this.boxPortalAd) {
            if (!window.qg.createGamePortalAd) return console.log("暂不支持互推盒子相关 API"), !1;
            null == this.boxPortalAd ? this.boxPortalAd = window.qg.createGamePortalAd({
              adUnitId: this.BOX_PORTAL_AD_POSID
            }) : this.boxPortalAd.load();
            let t = this;
            return this.boxPortalAd.onError(() => {
              console.log("九宫格盒子广告加载失败");
            }), this.boxPortalAd.onClose(() => {
              t.boxPortalAdShowed = !1;
            }), this.boxPortalAd.onLoad(function () {
              t.showBoxPortalAd();
            }), !0;
          }
        }

        showBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAdShowed = !0, this.boxPortalAd.show());
        }

        destroyBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAdShowed = !1, this.boxPortalAd.destroy(), this.boxPortalAd = null);
        }

        createBoxAd() {
          this.boxPortalAd ? this.showBoxPortalAd() : this.createBoxPortalAd();
        }

        destroyBoxAd() {
          this.destroyBoxPortalAd();
        }

        customInterface(t, e, o, a) {
          console.log("customInterface", t, e), "installShortcut" != t && ("showShortcut" == t ? this.showShortcut() : "hideShortcut" == t ? this.hideShortcut() : "destroyShortcut" == t ? this.destroyShortcut() : "createBoxAd" == t ? this.createBoxAd() : "destroyBoxAd" == t ? this.destroyBoxAd() : "clickNativeReportAd" == t ? this.customAd.reportAdClick({
            adId: e
          }) : "hideNativeAdvertisement" == t && this.customAd && (this.customAdShowed = !1, this.customAd.hide()));
        }

      };
    }(uniSdk = uniSdk || {}), function (s) {
      s.VivoPlatform = class {
        constructor() {
          this.BANNER_AD_POSID = "__BANNER_AD_POSID__", this.VIDEO_AD_POSID = "__VIDEO_AD_POSID__", this.CUSTOM_AD_POSID = "__CUSTOM_AD_POSID__", this.BOX_BANNER_AD_POSID = "__BOX_BANNER_AD_POSID__", this.BOX_PORTAL_AD_POSID = "__BOX_PORTAL_AD_POSID__", this.shortcutButton = null, this.banner = null, this.videoAd = null, this.boxPortalAd = null, this.boxBannerAd = null, this.customAd = null, this.videoAdLoading = !1, this.bannerAdShowed = !1, this.boxBannerAdShowed = !1, this.boxPortalAdShowed = !1;
        }

        showMaskLayer() {}

        hideMaskLayer() {}

        init(t, e) {
          t && t.call(e);
        }

        login(t, e, o) {
          console.log("DebugWebPlatform.login");
        }

        downloadResource(t, e, o, a, i) {}

        showBannerAdvertisement(t, e, o) {
          if (!this.boxBannerAdShowed) {
            let t = this;
            null == this.banner && (this.banner = window.qg.createBannerAd({
              posId: this.BANNER_AD_POSID,
              style: {}
            }), this.banner.onError(t => {
              console.log("banner广告加载失败", t);
            })), this.banner.show().then(() => {
              t.bannerAdShowed = !0, console.log("banner广告展示完成");
            }).catch(t => {
              console.error("banner广告展示失败", JSON.stringify(t));
            });
          }
        }

        hideBannerAdvertisement(t) {
          console.log("hideBannerAdvertisement"), null != this.banner && (this.bannerAdShowed = !1, this.banner.hide());
        }

        showInterstitialAdvertisement(t, e, o) {}

        showNativeAdvertisement(t, e, o) {
          console.log("showNativeAdvertisement");
          var a,
              i = this;
          let l = this.bannerAdShowed;
          this.hideBannerAdvertisement(null), this.customAd && (this.customAd.destroy(), this.customAd = null), window.qg.createCustomAd && (a = .5 * s.AdPlat.instance.systemInfo.screenHeight - 80, this.customAd = window.qg.createCustomAd({
            posId: this.CUSTOM_AD_POSID,
            style: {
              top: a
            }
          }), this.customAd.onError(t => {
            console.error("原生模板广告加载失败", t);
          }), this.customAd.show().then(() => {
            i.showMaskLayer(), console.log("原生模板广告展示完成");
          }).catch(t => {
            console.error("原生模板广告展示失败", JSON.stringify(t));
          }), this.customAd.onClose(() => {
            i.hideMaskLayer(), l && i.showBannerAdvertisement(null, null, null), e && e.call(o);
          }));
        }

        showVideoAdvertisement(t, e, o) {
          console.log("showVideoAdvertisement");
          let a = this;
          null == this.videoAd ? (this.videoAd = window.qg.createRewardedVideoAd({
            posId: this.VIDEO_AD_POSID
          }), this.videoAd.onError(t => {
            console.error("激励视频广告加载失败", t), e && e.call(o, -1);
          }), this.videoAd.onLoad(function (t) {
            console.log("激励视频广告加载完成-onload触发", JSON.stringify(t)), a.videoAd.show().then(() => {
              console.log("激励视频广告展示完成");
            }).catch(t => {
              console.error("激励视频广告展示失败", JSON.stringify(t));
            });
          }), this.videoAd.onClose(t => {
            t && t.isEnded ? e && e.call(o, 1) : e && e.call(o, 0);
          })) : this.videoAd.load();
        }

        clearResCache() {}

        showShortcut() {}

        hideShortcut() {}

        destroyShortcut() {}

        createBoxBannerAd() {
          if (!window.qg.createBoxBannerAd) return console.log("暂不支持互推盒子相关 API"), !1;
          this.boxBannerAd = window.qg.createBoxBannerAd({
            posId: this.BOX_BANNER_AD_POSID
          });
          let t = this;
          return this.boxBannerAd.onError(() => {
            console.log("横副盒子广告加载失败");
          }), this.boxBannerAd.onClose(() => {
            null == t.boxPortalAd && t.createBoxPortalAd(), t.showBoxPortalAd(), window.platform.showBannerAdvertisement();
          }), !0;
        }

        showBoxBannerAd() {
          this.boxBannerAd && (this.boxBannerAdShowed = !0, this.boxBannerAd.show());
        }

        hideBoxBannerAd() {
          this.boxBannerAd && (this.boxBannerAdShowed = !1, this.boxBannerAd.hide());
        }

        destroyBoxBannerAd() {
          this.boxBannerAd && (this.boxBannerAdShowed = !1, this.boxBannerAd.destroy(), this.boxBannerAd = null);
        }

        createBoxPortalAd() {
          if (!this.boxPortalAd) {
            if (!window.qg.createBoxPortalAd) return console.log("暂不支持互推盒子相关 API"), !1;
            this.boxPortalAd = window.qg.createBoxPortalAd({
              posId: this.BOX_PORTAL_AD_POSID
            });
            let t = this;
            return this.boxPortalAd.onError(() => {
              console.log("九宫格盒子广告加载失败");
            }), this.boxPortalAd.onClose(() => {
              null == t.boxBannerAd && t.createBoxBannerAd(), t.showBoxBannerAd();
            }), !0;
          }
        }

        showBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAdShowed = !0, this.boxPortalAd.show());
        }

        hideBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAdShowed = !1, this.boxPortalAd.hide());
        }

        destroyBoxPortalAd() {
          this.boxPortalAd && (this.boxPortalAdShowed = !1, this.boxPortalAd.destroy(), this.boxPortalAd = null);
        }

        createBoxAd() {
          this.hideBannerAdvertisement(null), this.createBoxBannerAd() && this.showBoxBannerAd();
        }

        destroyBoxAd() {
          this.destroyBoxPortalAd(), this.destroyBoxBannerAd();
        }

        customInterface(t, e, o, a) {
          console.log("customInterface", t, e), "installShortcut" != t && ("showShortcut" == t ? this.showShortcut() : "hideShortcut" == t ? this.hideShortcut() : "destroyShortcut" == t ? this.destroyShortcut() : "createBoxAd" == t ? this.createBoxAd() : "destroyBoxAd" == t && this.destroyBoxAd());
        }

      };
    }(uniSdk = uniSdk || {}), function (t) {
      t.XiaoMiPlatform = class {
        constructor() {
          this.BANNER_AD_POSID = "__BANNER_AD_POSID__", this.VIDEO_AD_POSID = "__VIDEO_AD_POSID__", this.CUSTOM_AD_POSID = "__CUSTOM_AD_POSID__", this.BOX_BANNER_AD_POSID = "__BOX_BANNER_AD_POSID__", this.BOX_PORTAL_AD_POSID = "__BOX_PORTAL_AD_POSID__", this.BOX_FLOAT_AD_POSID = "__BOX_FLOAT_AD_POSID__", this.INTERST_AD_POSID = "__INTERST_AD_POSID__", this.banner = null, this.videoAd = null, this.boxPortalAd = null, this.boxBannerAd = null, this.interstitialAd = null, this.videoAdLoading = !1, this.bannerAdShowed = !1, this.boxBannerAdShowed = !1, this.boxPortalAdShowed = !1, this.bannerTimestamp = 0;
        }

        showMaskLayer() {}

        hideMaskLayer() {}

        init(t, e) {
          let o = this;
          globalThis.document.addEventListener("qgCustomEvent", t => {
            100 != t.detail.adType && 120 != t.detail.adType || o.showBannerAdvertisement(null, null, null);
          });
        }

        login(t, e, o) {
          console.log("DebugWebPlatform.login");
        }

        downloadResource(t, e, o, a, i) {}

        showBannerAdvertisement(t, e, o) {
          let a = this;
          1e4 < Date.now() - this.bannerTimestamp && (this.banner && this.banner.destroy(), this.banner = null), null == this.banner && (this.banner = window.qg.createBannerAd({
            adUnitId: this.BANNER_AD_POSID
          }), this.bannerTimestamp = Date.now()), this.banner.show().then(() => {
            a.bannerAdShowed = !0, console.log("banner广告展示完成");
          }).catch(t => {
            console.error("banner广告展示失败");
          });
        }

        hideBannerAdvertisement(t) {
          console.log("hideBannerAdvertisement"), null != this.banner && (this.bannerAdShowed = !1, this.banner.hide());
        }

        showInterstitialAdvertisement(t, e, o) {
          null == this.interstitialAd && (this.interstitialAd = window.qg.createInterstitialAd({
            adUnitId: this.INTERST_AD_POSID
          })), this.interstitialAd.show();
        }

        showNativeAdvertisement(t, e, o) {
          e && e.call(o);
        }

        showVideoAdvertisement(t, e, o) {
          console.log("showVideoAdvertisement"), null == this.videoAd && (this.videoAd = window.qg.createRewardedVideoAd({
            adUnitId: this.VIDEO_AD_POSID
          }), this.videoAd.onError(t => {
            console.error("激励视频广告加载失败"), e && e.call(o, -1);
          }), this.videoAd.onLoad(function (t) {
            console.log("激励视频广告加载完成-onload触发");
          }), this.videoAd.onClose(t => {
            t && t.isEnded ? e && e.call(o, 1) : e && e.call(o, 0);
          })), this.videoAd.show();
        }

        clearResCache() {}

        showShortcut() {}

        hideShortcut() {}

        destroyShortcut() {}

        displayAd(e, t, o, a) {
          window.qg.displayAd({
            type: e,
            upid: t,
            success: t => {
              t.errMsg && 0 < t.errMsg.length && console.log(t.errMsg);
            },
            fail: t => {
              console.log("类型:" + e + "广告失败");
            }
          });
        }

        createBoxAd() {
          this.displayAd(120, this.BOX_BANNER_AD_POSID);
        }

        destroyBoxAd() {
          window.qg.closeAd({
            type: 120
          });
        }

        showBoxPortalAd() {
          window.qg.displayAd({
            type: 100,
            upid: this.BOX_PORTAL_AD_POSID
          });
        }

        hideBoxPortalAd() {
          window.qg.closeAd({
            type: 100
          });
        }

        showFloatAd() {
          window.qg.displayAd({
            type: 150,
            upid: this.BOX_FLOAT_AD_POSID
          });
        }

        hideFloatAd() {
          window.qg.closeAd({
            type: 150
          });
        }

        customInterface(t, e, o, a) {
          console.log("customInterface", t, e);
        }

      };
    }(uniSdk = uniSdk || {}), function (e) {
      class t extends e.AdBanner {
        constructor(t, e) {
          super(), this.showTime = 0, this.maxShowTime = 10, this.bannerWidth = 0, this.adUnitId = t, this.isShow = !1, this.createTimestamp = 0, this.bannerWidth = 0 < e ? e : 0;
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !!this.banner;
        }

        setShowTime(t) {
          this.maxShowTime = t;
        }

        createBannerAd() {
          let t = null;
          return t = window[e.Global.platformName] && window[e.Global.platformName].createBannerAd ? window[e.Global.platformName].createBannerAd({
            adUnitId: this.adUnitId
          }) : t;
        }

        load() {
          var t;
          this.bannerLoading ? console.warn("this.bannerLoading = true , banner loading...") : (t = Date.now()) - this.createTimestamp < 6e4 ? console.warn("时间不足，未能重新加载 banner...", this.adUnitId, t - this.createTimestamp) : (console.log("正在加载banner"), this.destroy(), this.bannerLoading = this.createBannerAd(), null == this.bannerLoading ? console.error("创建 Banner 失败", this.adUnitId) : (this.showTime = 0, this.createTimestamp = Date.now(), this.bannerLoading.onLoad(this.onBannerLoad.bind(this)), this.bannerLoading.onError(this.onBannerError.bind(this))));
        }

        onBannerLoad() {
          console.log("------onBannerLoad 广告加载成功------", this.adUnitId), this.banner = this.bannerLoading, this.bannerLoading = null, this.isShow && this.show(!0);
        }

        onBannerResize(t) {}

        onBannerError(t) {
          console.warn("banner___error:", this.adUnitId), this.bannerLoading && (this.bannerLoading.offLoad(this.onBannerLoad), this.bannerLoading.offError(this.onBannerError), this.bannerLoading.destroy(), this.bannerLoading = null), this.createTimestamp = 0;
        }

        show(t) {
          this.isShow = !0, null == this.banner && null == this.bannerLoading ? this.load() : this.banner && this.banner.show();
        }

        hide() {
          null != this.banner && (this.banner.hide(), this.isShow) && (this.showTime++, this.showTime > this.maxShowTime) ? (this.isShow = !1, this.load()) : this.isShow = !1;
        }

        destroy() {
          null != this.banner && (this.banner.offLoad(this.onBannerLoad), this.banner.offError(this.onBannerError), this.banner.destroy(), this.banner = null, this.createTimestamp = 0);
        }

      }

      e.OPPO_AdBanner = t;
    }(uniSdk = uniSdk || {}), function (o) {
      class t extends o.AdCustom {
        constructor(t, e) {
          super(), this.adUnitId = t, this.customAd = null, this.adIndex = e, this.state = 0, this.load();
        }

        createCustomAd(t) {
          let e = null;
          return e = window[o.Global.platformName] && window[o.Global.platformName].createCustomAd ? t ? window[o.Global.platformName].createCustomAd({
            adUnitId: this.adUnitId,
            style: t
          }) : window[o.Global.platformName].createCustomAd({
            adUnitId: this.adUnitId
          }) : e;
        }

        load() {
          this.destroy(), this.state = 1;
          var t = o.getCustomAdStyle(this.adIndex);
          t && t.left && t.top ? this.customAd = this.createCustomAd({
            left: t.left,
            top: t.top
          }) : this.customAd = this.createCustomAd(), this.customAd ? (this.customAd.onLoad ? this.customAd.onLoad(this.onCustomLoad.bind(this)) : console.error("不存在 customAd.onLoad"), this.customAd.onError ? this.customAd.onError(this.onCustomError.bind(this)) : console.error("不存在 customAd.onError"), this.customAd.onClose ? this.customAd.onClose(this.onCustomClose.bind(this)) : console.error("不存在 customAd.onClose"), this.customAd.onHide ? this.customAd.onHide(this.onCustomHide.bind(this)) : console.error("不存在 customAd.onHide")) : console.error(o.Global.platformName + ".createCustomAd 不存在, 需支持最低平台版本号'1094' (minPlatformVersion>='1094')");
        }

        destroy() {
          null != this.customAd && (this.customAd.offLoad(this.onCustomLoad), this.customAd.offError(this.onCustomError), this.customAd.offClose(this.onCustomClose), this.customAd.offHide(this.onCustomHide), this.customAd.destroy(), this.customAd = null);
        }

        show(o, t, a) {
          if (this.showCallback = o, this.closeCallback = t, this.showCallbackTarget = a, 2 == this.state || 0 == this.state) console.warn("customAd show reload...", this.adUnitId), this.load();else {
            this.isShow = !0;
            let e = this;
            3 == this.state && (console.warn("显示原生广告..."), this.customAd.show().then(function () {
              o && o.call(a, !0), e.showCallback = null;
            }).catch(function (t) {
              console.error("customAd show error.........", t), o && o.call(a, !1), e.showCallback = null;
            }));
          }
        }

        hide() {
          this.isShow = !1, this.showCallback = null, this.closeCallback = null, (this.showCallbackTarget = null) != this.customAd && this.customAd.hide();
        }

        onCustomLoad() {
          var t = this.state;
          (this.state = 3) != t && this.isShow && this.show(this.showCallback, this.closeCallback, this.showCallbackTarget);
        }

        onCustomError(t) {
          console.warn("onCustomError:", t, this.adUnitId), 3 != this.state && (this.state = 2, this.isShow || (this.showCallback && this.showCallback.call(this.showCallbackTarget, !1), this.showCallback = null), this.isShow = !1, this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null);
        }

        onCustomClose() {
          console.warn("onCustomClose:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        onCustomHide() {
          console.warn("onCustomHide:", this.adUnitId), this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null;
        }

      }

      o.OPPO_AdCustom = t;
    }(uniSdk = uniSdk || {}), function (t) {
      class e extends t.AdInterstitial {
        constructor(t) {
          super(), this.adUnitId = t;
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !1;
        }

        show(t, e, o) {
          t && t.call(o, !1);
        }

        destroy() {}

      }

      t.OPPO_AdInterstitial = e;
    }(uniSdk = uniSdk || {}), function (o) {
      class t extends o.AdRewardedVideo {
        constructor(t) {
          super(), this.showForLoading = !1, this.adUnitId = t[0], this.videoAd = null, this.callback = null, this.callbackTarget = null;
        }

        get id() {
          return this.adUnitId;
        }

        createRewardedVideoAd(t) {
          let e = null;
          return e = window[o.Global.platformName] && window[o.Global.platformName].createRewardedVideoAd ? window[o.Global.platformName].createRewardedVideoAd({
            adUnitId: t
          }) : e;
        }

        load() {
          this.videoAd ? this.videoAd.load() : (this.videoAd = this.createRewardedVideoAd(this.adUnitId), this.videoAd.onLoad(this.onVideoLoad.bind(this)), this.videoAd.onError(this.onVideoError.bind(this)), this.videoAd.onClose(this.onVideoClose.bind(this)));
        }

        onVideoLoad() {
          if (console.log("------onVideoLoad 广告加载成功------", this.adUnitId), this.showForLoading) {
            this.showForLoading = !1;
            let e = this.callback,
                o = this.callbackTarget;
            this.videoAd.show().then(function () {}).catch(function (t) {
              console.error("rewardedVideo show error.........", t), e && e.call(o, -1);
            });
          }
        }

        onVideoError(t) {
          console.warn("onVideoError:", t), this.showForLoading = !1, this.callback && this.callback.call(this.callbackTarget, -1), this.callback = null, this.callbackTarget = null;
        }

        onVideoClose(t) {
          let e = 0;
          (t && t.isEnded || void 0 === t) && (e = 1), this.callback && this.callback.call(this.callbackTarget, e), this.callback = null, this.callbackTarget = null;
        }

        show(t, e, o) {
          this.callback = e, this.callbackTarget = o, this.showForLoading = !0, this.load();
        }

        destroy() {
          console.log("AdRewardedVideo destroy", this.adUnitId), null != this.videoAd && (this.videoAd.offLoad(this.onVideoLoad), this.videoAd.offError(this.onVideoError), this.videoAd.offClose(this.onVideoClose), this.videoAd.destroy(), this.videoAd = null, this.adUnitId = "");
        }

      }

      o.OPPO_AdRewardedVideo = t;
    }(uniSdk = uniSdk || {}), function (a) {
      class t extends a.AdBanner {
        constructor(t, e) {
          super(), this.showTime = 0, this.maxShowTime = 10, this.bannerWidth = 0, console.log("TT_AdBanner 构造", t), this.adUnitId = t, this.isShow = !1, this.createTimestamp = 0, this.bannerWidth = 0 < e ? e : 0, this.load();
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !!this.banner;
        }

        setShowTime(t) {
          this.maxShowTime = t;
        }

        createBannerAd() {
          let t = null,
              e = 300;
          a.AdPlat.instance.systemInfo.windowWidth < a.AdPlat.instance.systemInfo.windowHeight && (e = a.AdPlat.instance.systemInfo.windowWidth), this.bannerWidth && 0 < this.bannerWidth && (e = this.bannerWidth);
          var o = .5 * (a.AdPlat.instance.systemInfo.windowWidth - e);
          return t = window[a.Global.platformName] && window[a.Global.platformName].createBannerAd ? window[a.Global.platformName].createBannerAd({
            adUnitId: this.adUnitId,
            adIntervals: 30,
            style: {
              left: o,
              top: 0,
              width: e
            }
          }) : t;
        }

        load() {
          var t;
          this.bannerLoading || ((t = Date.now()) - this.createTimestamp < 6e4 ? console.warn("时间不足，未能重新加载 banner...", this.adUnitId, t - this.createTimestamp) : (this.destroy(), this.bannerLoading = this.createBannerAd(), null == this.bannerLoading ? console.error("创建 Banner 失败", this.adUnitId) : (console.log("tt banner loading....", this.adUnitId), this.showTime = 0, this.createTimestamp = Date.now(), this.bannerLoading.onLoad(this.onBannerLoad.bind(this)), this.bannerLoading.onResize(this.onBannerResize.bind(this)), this.bannerLoading.onError(this.onBannerError.bind(this)))));
        }

        onBannerLoad() {
          console.log("------tt onBannerLoad 广告加载成功------", this.adUnitId), this.banner = this.bannerLoading, this.bannerLoading = null, this.isShow && this.show(!0);
        }

        onBannerResize(t) {
          var e = a.AdPlat.instance.systemInfo.windowHeight - t.height,
              o = .5 * (a.AdPlat.instance.systemInfo.windowWidth - t.width);
          console.log("----onBannerResize top:" + e + ",left:" + o + ",size", t), this.bannerLoading && this.bannerLoading.style ? (this.bannerLoading.style.left = o, this.bannerLoading.style.top = e) : this.banner && this.banner.style && (this.banner.style.left = o, this.banner.style.top = e), t && 0 < t.width && 0 < t.height && a.notityBannerResize(t.width, t.height);
        }

        onBannerError(t) {
          console.warn("tt banner___error:", this.adUnitId, t), this.bannerLoading && (this.bannerLoading.offLoad(this.onBannerLoad), this.bannerLoading.offResize(this.onBannerResize), this.bannerLoading.offError(this.onBannerError), this.bannerLoading.destroy(), this.bannerLoading = null), this.createTimestamp = 0;
        }

        show(t) {
          this.isShow = !0, null == this.banner && null == this.bannerLoading ? this.load() : this.banner && this.banner.show();
        }

        hide() {
          null != this.banner && (this.banner.hide(), this.isShow) && (this.showTime++, this.showTime > this.maxShowTime) ? (this.isShow = !1, this.load()) : this.isShow = !1;
        }

        destroy() {
          null != this.banner && (this.banner.offLoad(this.onBannerLoad), this.banner.offResize(this.onBannerResize), this.banner.offError(this.onBannerError), this.banner.destroy(), this.banner = null, this.createTimestamp = 0);
        }

      }

      a.TT_AdBanner = t;
    }(uniSdk = uniSdk || {}), function (e) {
      class t extends e.AdCustom {
        constructor(o, t) {
          super(), this.userStyle = {
            left: 0,
            top: 0,
            width: 300,
            fixed: !1
          }, this.adUnitId = o, this.customAd = null, this.state = 0, this.isShow = !1;
          o = e.AdPlat.instance.systemInfo;

          if (o) {
            let t = o.screenWidth,
                e = o.screenHeight;
            o.safeArea && (o.safeArea.width && (t = o.safeArea.width), o.safeArea.height) && (e = o.safeArea.height), this.userStyle.left = .5 * (t - 300), this.userStyle.top = .5 * (e - 300), this.userStyle.width = 300;
          }

          o = e.getCustomAdStyle(t);
          o && (o.left && (this.userStyle.left = o.left), o.top && (this.userStyle.top = o.top), o.width) && (this.userStyle.width = o.width);
        }

        createCustomAd() {
          let t = null;
          return t = window[e.Global.platformName] && window[e.Global.platformName].createCustomAd ? window[e.Global.platformName].createCustomAd({
            adUnitId: this.adUnitId,
            adIntervals: 30,
            style: this.userStyle
          }) : t;
        }

        load() {
          this.destroy(), this.state = 1, this.customAd = this.createCustomAd(), this.customAd.onLoad(this.onCustomLoad.bind(this)), this.customAd.onError(this.onCustomError.bind(this)), this.customAd.onClose(this.onCustomClose.bind(this)), this.customAd.onHide(this.onCustomHide.bind(this));
        }

        destroy() {
          null != this.customAd && (this.customAd.offLoad(this.onCustomLoad), this.customAd.offError(this.onCustomError), this.customAd.offClose(this.onCustomClose), this.customAd.offHide(this.onCustomHide), this.customAd.destroy(), this.customAd = null);
        }

        show(o, t, a) {
          if (this.showCallback = o, this.closeCallback = t, this.showCallbackTarget = a, 2 == this.state || 0 == this.state) console.warn("customAd show reload...", this.adUnitId), this.load();else {
            this.isShow = !0;
            let e = this;
            3 == this.state && (console.warn("显示原生广告..."), this.customAd.show().then(function () {
              o && o.call(a, !0), e.showCallback = null;
            }).catch(function (t) {
              console.error("customAd show error.........", t), o && o.call(a, !1), e.showCallback = null;
            }));
          }
        }

        hide() {
          this.isShow = !1, this.showCallback = null, this.closeCallback = null, (this.showCallbackTarget = null) != this.customAd && this.customAd.hide();
        }

        onCustomLoad() {
          var t = this.state;
          (this.state = 3) != t && this.isShow && this.show(this.showCallback, this.closeCallback, this.showCallbackTarget);
        }

        onCustomError(t) {
          console.warn("onCustomError:", t, this.adUnitId), 3 != this.state && (this.state = 2, this.isShow || (this.showCallback && this.showCallback.call(this.showCallbackTarget, !1), this.showCallback = null), this.isShow = !1, this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null);
        }

        onCustomClose() {
          console.warn("onCustomClose:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        onCustomHide() {
          console.warn("onCustomHide:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null;
        }

      }

      e.TT_AdCustom = t;
    }(uniSdk = uniSdk || {}), function (i) {
      class t extends i.AdInterstitial {
        constructor(t) {
          super(), this.createTimestamp = 0, console.log("TT_AdInterstitial 构造", t), this.adUnitId = t, this.interstitial = null, this.state = 0, this.isShow = !1, this.createTimestamp = i.startupTimestamp;
        }

        get id() {
          return this.adUnitId;
        }

        createInterstitialAd() {
          let t = null;
          return t = window[i.Global.platformName] && window[i.Global.platformName].createInterstitialAd ? window[i.Global.platformName].createInterstitialAd({
            adUnitId: this.adUnitId
          }) : t;
        }

        load() {
          this.destroy(), console.log("adinterstilal load."), this.state = 1, this.interstitial = this.createInterstitialAd(), this.interstitial.onLoad(this.onInterstitialLoad.bind(this)), this.interstitial.onError(this.onInterstitialError.bind(this)), this.interstitial.onClose(this.onInterstitialClose.bind(this)), this.interstitial.load();
        }

        onInterstitialLoad() {
          let e = this;
          console.log("------onInterstitialLoad 广告加载成功------", this.adUnitId), this.state = 3, this.interstitial.show().then(function () {
            console.log("成功显示插屏广告..."), e.isShow = !1, e.createTimestamp = Date.now(), e.showCallback && e.showCallback.call(e.showCallbackTarget, !0);
          }).catch(function (t) {
            console.error("interstitial show error.........", t), e.state = 2, e.showCallback && e.showCallback.call(e.showCallbackTarget, !1);
          });
        }

        onInterstitialError(t) {
          console.warn("onInterstitialError:", t), this.state = 2, this.showCallback && this.showCallback.call(this.showCallbackTarget, !1);
        }

        onInterstitialClose(t) {
          this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        show(t, e, o) {
          var a;
          this.isShow ? console.warn("插屏广告当前处于展示状态，请不要重复展示插屏广告") : (a = Date.now(), null == this.interstitial && a - this.createTimestamp <= 3e4 ? (console.warn("小游戏启动后的前30s（秒），不能展示插屏广告。\n如有疑问：请联系\nhttps://microapp.bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/interstitial-ad/interstitial-ad-notice"), t && t.call(o, !1)) : this.interstitial && a - this.createTimestamp <= 6e4 ? (console.warn("插屏广告距离上一次展示需要等待 60s（秒）才能展示\n如有疑问：请联系\nhttps://microapp.bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/interstitial-ad/interstitial-ad-notice"), t && t.call(o, !1)) : a - i.ttLastVideoCreateTimestamp <= 6e4 ? console.warn("展示插屏广告需要与激励视频广告的展示间隔 60s（秒）,当前间隔时间不足,如有疑问：请联系\nhttps://microapp.bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/interstitial-ad/interstitial-ad-notice") : (this.showCallback = t, this.closeCallback = e, this.showCallbackTarget = o, 1 == this.state ? console.warn("插屏广告正在拉取过程中... 请勿频繁操作插屏广告, 如有疑问：请联系\nhttps://microapp.bytedance.com/docs/zh-CN/mini-game/develop/open-capacity/ads/interstitial-ad/interstitial-ad-notice") : this.load()));
        }

        destroy() {
          null != this.interstitial && (console.log("destroy AdInterstitial"), this.interstitial.offLoad(this.onInterstitialLoad), this.interstitial.offError(this.onInterstitialError), this.interstitial.offClose(this.onInterstitialClose), this.state = 0, this.interstitial.destroy(), this.interstitial = null);
        }

      }

      i.TT_AdInterstitial = t;
    }(uniSdk = uniSdk || {}), function (l) {
      class t extends l.AdRewardedVideo {
        constructor(e) {
          super(), this.isShow = !1, this.unitIdList = [];

          for (let t = 0; t < e.length; t++) {
            var o = e[t];
            0 < o.length && this.unitIdList.push(o);
          }

          this.adUnitId = "", this.videoAd = null, this.isShow = !1, this.callback = null, this.callbackTarget = null;
        }

        get id() {
          return this.adUnitId;
        }

        createRewardedVideoAd(t) {
          let e = null;
          return e = window[l.Global.platformName] && window[l.Global.platformName].createRewardedVideoAd ? window[l.Global.platformName].createRewardedVideoAd({
            adUnitId: t
          }) : e;
        }

        load(t) {
          console.log("load video ", t, this.videoAd), this.destroy();
          t = this.unitIdList[t];
          this.adUnitId = t, this.videoAd = this.createRewardedVideoAd(t), this.videoAd.onLoad(this.onVideoLoad.bind(this)), this.videoAd.onError(this.onVideoError.bind(this)), this.videoAd.onClose(this.onVideoClose.bind(this));
        }

        onVideoLoad() {
          if (console.log("------tt onVideoLoad 广告加载成功------", this.adUnitId), !this.isShow) {
            let e = this.callback,
                o = this.callbackTarget;
            this.videoAd.show().then(function () {
              console.log("视频加载完成，展示成功"), l.ttLastVideoCreateTimestamp = Date.now(), this.isShow = !0;
            }).catch(function (t) {
              console.error("视频加载完成,展示失败", t), this.isShow = !1, e && e.call(o, -1);
            });
          }
        }

        onVideoError(t) {
          console.warn("tt onVideoError:", t), this.isShow = !1, this.callback && this.callback.call(this.callbackTarget, -1), this.callback = null, this.callbackTarget = null;
        }

        onVideoClose(t) {
          let e = 0;
          this.isShow = !1, (t && t.isEnded || void 0 === t) && (e = 1), this.callback && this.callback.call(this.callbackTarget, e), this.callback = null, this.callbackTarget = null;
        }

        show(o, a, i) {
          if ((null == o || o < 0 || o >= this.unitIdList.length) && (o = 0), this.isShow) console.warn("视频广告当前处于展示状态，请不要重复展示视频广告");else {
            this.callback = a, this.callbackTarget = i;
            let e = this,
                t = this.unitIdList[o];
            this.adUnitId != t && this.load(o), null == this.videoAd ? (a && a.call(i, -1), this.callback = null, this.callbackTarget = null) : this.videoAd.show().then(function () {
              console.log("视频广告展示成功", t), l.ttLastVideoCreateTimestamp = Date.now(), e.isShow = !0;
            }).catch(function (t) {
              console.error("rewardedVideo show error.........", t), e.isShow = !1, a && a.call(i, -1);
            });
          }
        }

        destroy() {
          null != this.videoAd && (console.log("tt AdRewardedVideo destroy", this.adUnitId), this.videoAd.offLoad(this.onVideoLoad), this.videoAd.offError(this.onVideoError), this.videoAd.offClose(this.onVideoClose), this.videoAd.destroy(), this.videoAd = null, this.adUnitId = "", this.isShow = !1);
        }

      }

      l.TT_AdRewardedVideo = t;
    }(uniSdk = uniSdk || {}), function (e) {
      class t extends e.AdBanner {
        constructor(t, e) {
          super(), this.showTime = 0, this.maxShowTime = 10, this.bannerWidth = 0, this.adUnitId = t, this.isShow = !1, this.createTimestamp = 0, this.bannerWidth = 0 < e ? e : 0;
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !!this.banner;
        }

        setShowTime(t) {
          this.maxShowTime = t;
        }

        createBannerAd() {
          let t = null;
          return t = window[e.Global.platformName] && window[e.Global.platformName].createBannerAd ? window[e.Global.platformName].createBannerAd({
            posId: this.adUnitId
          }) : t;
        }

        load() {
          var t;
          this.bannerLoading || ((t = Date.now()) - this.createTimestamp < 6e4 ? console.warn("时间不足，未能重新加载 banner...", this.adUnitId, t - this.createTimestamp) : (this.destroy(), this.bannerLoading = this.createBannerAd(), null == this.bannerLoading ? console.error("创建 Banner 失败", this.adUnitId) : (this.showTime = 0, this.createTimestamp = Date.now(), this.bannerLoading.onLoad(this.onBannerLoad.bind(this)), this.bannerLoading.onError(this.onBannerError.bind(this)))));
        }

        onBannerLoad() {
          console.log("------onBannerLoad 广告加载成功------", this.adUnitId), this.banner = this.bannerLoading, this.bannerLoading = null, this.isShow && this.show(!0);
        }

        onBannerResize(t) {}

        onBannerError(t) {
          console.warn("banner___error:", this.adUnitId), this.bannerLoading && (this.bannerLoading.offLoad(this.onBannerLoad), this.bannerLoading.offError(this.onBannerError), this.bannerLoading.destroy(), this.bannerLoading = null), this.createTimestamp = 0;
        }

        show(t) {
          this.isShow = !0, null == this.banner && null == this.bannerLoading ? this.load() : this.banner && this.banner.show();
        }

        hide() {
          null != this.banner && (this.banner.hide(), this.isShow) && (this.showTime++, this.showTime > this.maxShowTime) ? (this.isShow = !1, this.load()) : this.isShow = !1;
        }

        destroy() {
          null != this.banner && (this.banner.offLoad(this.onBannerLoad), this.banner.offError(this.onBannerError), this.banner.destroy(), this.banner = null, this.createTimestamp = 0);
        }

      }

      e.VIVO_AdBanner = t;
    }(uniSdk = uniSdk || {}), function (o) {
      class t extends o.AdCustom {
        constructor(t, e) {
          super(), this.adUnitId = t, this.customAd = null, this.adIndex = e, this.state = 0, this.load();
        }

        createCustomAd(t) {
          let e = null;
          return e = window[o.Global.platformName] && window[o.Global.platformName].createCustomAd ? t ? window[o.Global.platformName].createCustomAd({
            posId: this.adUnitId,
            style: t
          }) : window[o.Global.platformName].createCustomAd({
            posId: this.adUnitId
          }) : e;
        }

        load() {
          this.destroy(), this.state = 1;
          var t = o.getCustomAdStyle(this.adIndex);
          t ? t.left && t.top ? this.customAd = this.createCustomAd({
            left: t.left,
            top: t.top
          }) : t.top ? this.customAd = this.createCustomAd({
            top: t.top
          }) : t.left ? this.customAd = this.createCustomAd({
            left: t.left
          }) : this.customAd = this.createCustomAd() : this.customAd = this.createCustomAd(), this.customAd ? (this.customAd.onLoad(this.onCustomLoad.bind(this)), this.customAd.onError(this.onCustomError.bind(this)), this.customAd.onClose(this.onCustomClose.bind(this)), this.customAd.onHide(this.onCustomHide.bind(this))) : console.error(o.Global.platformName + ".createCustomAd 不存在, 需支持最低平台版本号'1094' (minPlatformVersion>='1094')");
        }

        destroy() {
          null != this.customAd && (this.customAd.offLoad(this.onCustomLoad), this.customAd.offError(this.onCustomError), this.customAd.offClose(this.onCustomClose), this.customAd.offHide(this.onCustomHide), this.customAd.destroy(), this.customAd = null);
        }

        show(o, t, a) {
          if (this.customAd) {
            if (this.showCallback = o, this.closeCallback = t, this.showCallbackTarget = a, 2 == this.state || 0 == this.state) console.warn("customAd show reload...", this.adUnitId), this.load();else {
              this.isShow = !0;
              let e = this;
              3 == this.state && (console.warn("显示原生广告..."), this.customAd.show().then(function () {
                o && o.call(a, !0), e.showCallback = null;
              }).catch(function (t) {
                console.error("customAd show error.........", t), o && o.call(a, !1), e.showCallback = null;
              }));
            }
          } else o && o.call(a, !1);
        }

        hide() {
          this.isShow = !1, this.showCallback = null, this.closeCallback = null, (this.showCallbackTarget = null) != this.customAd && this.customAd.hide();
        }

        onCustomLoad() {
          var t = this.state;
          (this.state = 3) != t && this.isShow && this.show(this.showCallback, this.closeCallback, this.showCallbackTarget);
        }

        onCustomError(t) {
          console.warn("onCustomError:", t, this.adUnitId), 3 != this.state && (this.state = 2, this.isShow || (this.showCallback && this.showCallback.call(this.showCallbackTarget, !1), this.showCallback = null), this.isShow = !1, this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null);
        }

        onCustomClose() {
          console.warn("onCustomClose:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        onCustomHide() {
          console.warn("onCustomHide:", this.adUnitId), this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null;
        }

      }

      o.VIVO_AdCustom = t;
    }(uniSdk = uniSdk || {}), function (t) {
      class e extends t.AdInterstitial {
        constructor(t) {
          super(), this.adUnitId = t;
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !1;
        }

        show(t, e, o) {
          t && t.call(o, !1);
        }

        destroy() {}

      }

      t.VIVO_AdInterstitial = e;
    }(uniSdk = uniSdk || {}), function (o) {
      class t extends o.AdRewardedVideo {
        constructor(t) {
          super(), this.showForLoading = !1, this.adUnitId = t[0], this.videoAd = null, this.callback = null, this.callbackTarget = null;
        }

        get id() {
          return this.adUnitId;
        }

        createRewardedVideoAd(t) {
          let e = null;
          return e = window[o.Global.platformName] && window[o.Global.platformName].createRewardedVideoAd ? window[o.Global.platformName].createRewardedVideoAd({
            posId: t
          }) : e;
        }

        load() {
          this.videoAd ? this.videoAd.load() : (this.videoAd = this.createRewardedVideoAd(this.adUnitId), this.videoAd.onLoad(this.onVideoLoad.bind(this)), this.videoAd.onError(this.onVideoError.bind(this)), this.videoAd.onClose(this.onVideoClose.bind(this)));
        }

        onVideoLoad() {
          if (console.log("------onVideoLoad 广告加载成功------", this.adUnitId), this.showForLoading) {
            this.showForLoading = !1;
            let e = this.callback,
                o = this.callbackTarget;
            this.videoAd.show().then(function () {}).catch(function (t) {
              console.error("rewardedVideo show error.........", t), e && e.call(o, -1);
            });
          }
        }

        onVideoError(t) {
          console.warn("onVideoError:", t), this.showForLoading = !1, this.callback && this.callback.call(this.callbackTarget, -1), this.callback = null, this.callbackTarget = null;
        }

        onVideoClose(t) {
          let e = 0;
          (t && t.isEnded || void 0 === t) && (e = 1), this.callback && this.callback.call(this.callbackTarget, e), this.callback = null, this.callbackTarget = null;
        }

        show(t, e, o) {
          this.callback = e, this.callbackTarget = o, this.showForLoading = !0, this.load();
        }

        destroy() {
          console.log("AdRewardedVideo destroy", this.adUnitId), null != this.videoAd && (this.videoAd.offLoad(this.onVideoLoad), this.videoAd.offError(this.onVideoError), this.videoAd.offClose(this.onVideoClose), this.videoAd.destroy(), this.videoAd = null, this.adUnitId = "");
        }

      }

      o.VIVO_AdRewardedVideo = t;
    }(uniSdk = uniSdk || {}), function (i) {
      class t extends i.AdBanner {
        constructor(t, e) {
          super(), this.showTime = 0, this.maxShowTime = 30, this.bannerWidth = 0, this.adUnitId = t, this.isShow = !1, this.createTimestamp = 0, this.bannerWidth = 0 < e ? e : 0, this.banner = null, this.load();
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return !!this.banner;
        }

        setShowTime(t) {
          this.maxShowTime = t;
        }

        createBannerAd() {
          let t = null,
              e = 300;
          i.AdPlat.instance.systemInfo.windowWidth < i.AdPlat.instance.systemInfo.windowHeight && (e = i.AdPlat.instance.systemInfo.windowWidth), this.bannerWidth && 0 < this.bannerWidth && (e = this.bannerWidth);
          var o = .5 * (i.AdPlat.instance.systemInfo.windowWidth - e),
              a = i.AdPlat.instance.systemInfo.windowHeight - 80;
          return t = window[i.Global.platformName] && window[i.Global.platformName].createBannerAd && i.Global.isWxgame ? window[i.Global.platformName].createBannerAd({
            adUnitId: this.adUnitId,
            adIntervals: 30,
            style: {
              left: o,
              top: a,
              width: e
            }
          }) : t;
        }

        load() {
          var t = Date.now();
          t - this.createTimestamp < 6e4 ? console.warn("时间不足，未能重新加载 banner...", this.adUnitId, t - this.createTimestamp) : (this.destroy(), console.log("load banner... " + this.adUnitId), this.banner = this.createBannerAd(), this.showTime = 0, this.createTimestamp = Date.now(), this.banner.onLoad(this.onBannerLoad.bind(this)), this.banner.onResize(this.onBannerResize.bind(this)), this.banner.onError(this.onBannerError.bind(this)));
        }

        onBannerLoad() {
          console.log("------onBannerLoad 广告加载成功------", this.adUnitId), this.isShow && this.show(!0);
        }

        onBannerResize(t) {
          var e, o;
          i.Global.isWxgame && (e = i.AdPlat.instance.systemInfo.windowHeight - t.height, o = .5 * (i.AdPlat.instance.systemInfo.windowWidth - t.width), console.log("----onBannerResize top:" + e + ",left:" + o + ",size", t), this.banner && this.banner.style && (this.banner.style.left = o, this.banner.style.top = e), t) && 0 < t.width && 0 < t.height && i.notityBannerResize(t.width, t.height);
        }

        onBannerError(t) {
          console.warn("banner___error:", this.adUnitId), this.banner && (this.isShow = !1, this.banner.hide(), this.banner.destroy(), this.banner = null), this.createTimestamp = 0;
        }

        show(t) {
          this.isShow = !0, null == this.banner || this.showTime > this.maxShowTime ? this.load() : this.banner && this.banner.show();
        }

        hide() {
          null == this.banner ? this.isShow = !1 : this.isShow && (this.banner.hide(), this.isShow && this.showTime++, this.isShow = !1);
        }

        destroy() {
          null != this.banner && (this.isShow = !1, this.banner.hide(), this.banner.destroy(), this.banner = null, this.createTimestamp = 0);
        }

      }

      i.WX_AdBanner = t;
    }(uniSdk = uniSdk || {}), function (e) {
      class t extends e.AdCustom {
        constructor(o, t) {
          super(), this.userStyle = {
            left: 0,
            top: 0,
            width: 300,
            fixed: !1
          }, this.adUnitId = o, this.customAd = null, this.state = 0, this.isShow = !1;
          o = e.AdPlat.instance.systemInfo;

          if (o) {
            let t = o.screenWidth,
                e = o.screenHeight;
            o.safeArea && (o.safeArea.width && (t = o.safeArea.width), o.safeArea.height) && (e = o.safeArea.height), this.userStyle.left = .5 * (t - 300), this.userStyle.top = .5 * (e - 300), this.userStyle.width = 300;
          }

          o = e.getCustomAdStyle(t);
          o && (o.left && (this.userStyle.left = o.left), o.top && (this.userStyle.top = o.top), o.width) && (this.userStyle.width = o.width), this.load();
        }

        createCustomAd() {
          let t = null;
          return t = window[e.Global.platformName] && window[e.Global.platformName].createCustomAd && e.Global.isWxgame ? window[e.Global.platformName].createCustomAd({
            adUnitId: this.adUnitId,
            adIntervals: 30,
            style: this.userStyle
          }) : t;
        }

        load() {
          this.destroy(), this.state = 1, this.customAd = this.createCustomAd(), this.customAd.onLoad(this.onCustomLoad.bind(this)), this.customAd.onError(this.onCustomError.bind(this)), this.customAd.onClose(this.onCustomClose.bind(this)), this.customAd.onHide(this.onCustomHide.bind(this));
        }

        destroy() {
          null != this.customAd && (this.customAd.offLoad(this.onCustomLoad), this.customAd.offError(this.onCustomError), this.customAd.offClose(this.onCustomClose), this.customAd.offHide(this.onCustomHide), this.customAd.destroy(), this.customAd = null);
        }

        show(o, t, a) {
          if (this.showCallback = o, this.closeCallback = t, this.showCallbackTarget = a, 2 == this.state || 0 == this.state) console.warn("customAd show reload...", this.adUnitId), this.load();else {
            this.isShow = !0;
            let e = this;
            3 == this.state && (console.warn("显示原生广告..."), this.customAd.show().then(function () {
              o && o.call(a, !0), e.showCallback = null;
            }).catch(function (t) {
              console.error("customAd show error.........", t), o && o.call(a, !1), e.showCallback = null;
            }));
          }
        }

        hide() {
          this.isShow = !1, this.showCallback = null, this.closeCallback = null, (this.showCallbackTarget = null) != this.customAd && this.customAd.hide();
        }

        onCustomLoad() {
          var t = this.state;
          (this.state = 3) != t && this.isShow && this.show(this.showCallback, this.closeCallback, this.showCallbackTarget);
        }

        onCustomError(t) {
          console.warn("onCustomError:", t, this.adUnitId), 3 != this.state && (this.state = 2, this.isShow || (this.showCallback && this.showCallback.call(this.showCallbackTarget, !1), this.showCallback = null), this.isShow = !1, this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null);
        }

        onCustomClose() {
          console.warn("onCustomClose:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        onCustomHide() {
          console.warn("onCustomHide:", this.adUnitId), this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.showCallback = null, this.closeCallback = null, this.showCallbackTarget = null;
        }

      }

      e.WX_AdCustom = t;
    }(uniSdk = uniSdk || {}), function (e) {
      class t extends e.AdInterstitial {
        constructor(t) {
          super(), this.createTimestamp = 0, this.adUnitId = t, this.interstitial = null, this.state = 0, this.isShow = !1, this.load();
        }

        get id() {
          return this.adUnitId;
        }

        get isLoaded() {
          return 3 == this.state;
        }

        createInterstitialAd() {
          let t = null;
          return t = window[e.Global.platformName] && window[e.Global.platformName].createInterstitialAd && e.Global.isWxgame ? window[e.Global.platformName].createInterstitialAd({
            adUnitId: this.adUnitId
          }) : t;
        }

        load() {
          Date.now() - this.createTimestamp < 3e4 || (this.destroy(), this.state = 1, this.createTimestamp = Date.now(), null == this.interstitial && (this.interstitial = this.createInterstitialAd(), this.interstitial.onLoad(this.onInterstitialLoad.bind(this)), this.interstitial.onError(this.onInterstitialError.bind(this)), this.interstitial.onClose(this.onInterstitialClose.bind(this)), !e.Global.isTTGame)) || this.interstitial.load();
        }

        onInterstitialLoad() {
          this.state = 3, this.isShow && this.show(this.showCallback, this.closeCallback, this.showCallbackTarget);
        }

        onInterstitialError(t) {
          console.warn("onInterstitialError:", t), this.state = 2, this.isShow = !1, this.createTimestamp = 0, this.showCallback && this.showCallback.call(this.showCallbackTarget, !1);
        }

        onInterstitialClose(t) {
          this.isShow = !1, this.closeCallback && this.closeCallback.call(this.showCallbackTarget), this.closeCallback = null, this.showCallbackTarget = null, this.load();
        }

        show(e, t, o) {
          this.showCallback = e, this.closeCallback = t, this.showCallbackTarget = o, 2 == this.state || 0 == this.state ? (this.showCallback && this.showCallback.call(this.showCallbackTarget, !1), this.load()) : (this.isShow = !0, 3 == this.state && (console.warn("显示插屏广告..."), this.interstitial.show().then(function (t) {
            e && e.call(o, !0);
          }).catch(function (t) {
            console.error("interstitial show error.........", t), e && e.call(o, !1);
          })));
        }

        destroy() {
          null != this.interstitial && (console.log("destroy AdInterstitial"), this.interstitial.offLoad(this.onInterstitialLoad), this.interstitial.offError(this.onInterstitialError), this.interstitial.offClose(this.onInterstitialClose), this.state = 0, this.interstitial.destroy(), this.interstitial = null, this.createTimestamp = 0);
        }

      }

      e.WX_AdInterstitial = t;
    }(uniSdk = uniSdk || {}), function (o) {
      class t extends o.AdRewardedVideo {
        constructor(e) {
          super(), this.showForLoading = !1, this.unitIdList = [];

          for (let t = 0; t < e.length; t++) {
            var o = e[t];
            0 < o.length && this.unitIdList.push(o);
          }

          this.adUnitId = "", this.videoAd = null, this.callback = null, this.callbackTarget = null;
        }

        get id() {
          return this.adUnitId;
        }

        createRewardedVideoAd(t) {
          let e = null;
          return window[o.Global.platformName] && window[o.Global.platformName].createRewardedVideoAd && (console.log("正在创建视频实例", t), e = window[o.Global.platformName].createRewardedVideoAd({
            adUnitId: t,
            multiton: !0
          })), e;
        }

        load(t) {
          this.destroy();
          t = this.unitIdList[t];
          this.adUnitId = t, this.videoAd = this.createRewardedVideoAd(t), this.videoAd.onLoad(this.onVideoLoad.bind(this)), this.videoAd.onError(this.onVideoError.bind(this)), this.videoAd.onClose(this.onVideoClose.bind(this)), this.videoAd.load();
        }

        onVideoLoad() {
          if (console.log("------onVideoLoad 广告加载成功------", this.adUnitId), this.showForLoading) {
            this.showForLoading = !1;
            let e = this.callback,
                o = this.callbackTarget;
            this.videoAd.show().then(function (t) {}).catch(function (t) {
              console.error("rewardedVideo show error222.........", t), e && e.call(o, -1);
            });
          }
        }

        onVideoError(t) {
          console.warn("onVideoError:", t), this.showForLoading = !1, this.callback && this.callback.call(this.callbackTarget, -1), this.callback = null, this.callbackTarget = null;
        }

        onVideoClose(t) {
          let e = 0;
          (t && t.isEnded || void 0 === t) && (e = 1), this.callback && this.callback.call(this.callbackTarget, e), this.callback = null, this.callbackTarget = null;
        }

        show(t, e, o) {
          (null == t || t < 0 || t >= this.unitIdList.length) && (t = 0), this.callback = e, this.callbackTarget = o;
          let a = this;
          this.unitIdList[t] != this.adUnitId || null == this.videoAd ? (this.showForLoading = !0, this.load(t)) : this.videoAd.show().then(function (t) {
            console.log("rewardedVideo show ok", t);
          }).catch(function (t) {
            console.error("视频显示失败，正在尝试重加载,", t), a.showForLoading = !0, a.videoAd.load();
          });
        }

        destroy() {
          null != this.videoAd && (console.log("AdRewardedVideo destroy", this.adUnitId), this.videoAd.offLoad(this.onVideoLoad), this.videoAd.offError(this.onVideoError), this.videoAd.offClose(this.onVideoClose), this.videoAd.destroy(), this.videoAd = null, this.adUnitId = "");
        }

      }

      o.WX_AdRewardedVideo = t;
    }(uniSdk = uniSdk || {}), window.uniSdk = uniSdk;
    window.uniSdk = uniSdk;
  }).call(root);
})( // The environment-specific global.
function () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof this !== 'undefined') return this;
  return {};
}.call(this));