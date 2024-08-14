System.register("chunks:///_virtual/AutoPlayUIEffect.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(t){"use strict";var e,c,o,r;return{setters:[function(t){e=t.inheritsLoose},function(t){c=t.cclegacy,o=t._decorator,r=t.Component}],execute:function(){var n;c._RF.push({},"59cc2GuKjJIt4c1heErKHJF","AutoPlayUIEffect",void 0);var u=o.ccclass;o.property,t("AutoPlayUIEffect",u("AutoPlayUIEffect")(n=function(t){function c(){return t.apply(this,arguments)||this}e(c,t);var o=c.prototype;return o.start=function(){},o.update=function(t){},c}(r))||n);c._RF.pop()}}}));

System.register("chunks:///_virtual/AutoShowParticle.ts",["./rollupPluginModLoBabelHelpers.js","cc","./BasicComponet.ts","./GlobalTmpData.ts","./GlobalPool.ts"],(function(t){"use strict";var i,e,r,o,s,c,a,n,l,p,u;return{setters:[function(t){i=t.applyDecoratedDescriptor,e=t.inheritsLoose,r=t.initializerDefineProperty,o=t.assertThisInitialized},function(t){s=t.cclegacy,c=t._decorator,a=t.v3,n=t.ParticleSystem},function(t){l=t.BasicComponet},function(t){p=t.GlobalTmpData},function(t){u=t.default}],execute:function(){var h,f,d;s._RF.push({},"91bf4TJ9uZGPqmIeZvSQCD2","AutoShowParticle",void 0);var m=c.ccclass,P=c.property;t("AutoShowParticle",m("AutoShowParticle")((d=i((f=function(t){function i(){for(var i,e=arguments.length,s=new Array(e),c=0;c<e;c++)s[c]=arguments[c];return i=t.call.apply(t,[this].concat(s))||this,r(i,"hideTime",d,o(i)),i.curt=0,i.particle=null,i.particleArr=[],i.tmpPos=a(),i}e(i,t);var s=i.prototype;return s.initSub=function(){this.particle=this.node.getComponent(n),this.particleArr=this.node.getComponentsInChildren(n)},s.setData=function(t){this.curt=0,this.particle&&this.particle.play(),this.particleArr&&this.particleArr.forEach((function(t){t.play()}))},s.reset=function(){this.curt=0,this.particle&&this.particle.stop(),this.particleArr&&this.particleArr.forEach((function(t){t.stop()}))},s.update=function(t){this.curt+=t,this.tmpPos.set(p.Player.wpos).add(p.Player.offset),this.node.setPosition(this.tmpPos),this.curt>=this.hideTime&&(this.particle&&this.particle.stop(),this.particleArr&&this.particleArr.forEach((function(t){t.stop()})),u.put(this.node))},i}(l)).prototype,"hideTime",[P],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return 1}}),h=f))||h);s._RF.pop()}}}));

System.register("chunks:///_virtual/Effect",["./AutoPlayUIEffect.ts","./AutoShowParticle.ts"],(function(){"use strict";return{setters:[null,null],execute:function(){}}}));

(function(r) {
  r('virtual:///prerequisite-imports/Effect', 'chunks:///_virtual/Effect'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});