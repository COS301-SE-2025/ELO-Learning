if (!self.define) {
  let e,
    a = {};
  const s = (s, i) => (
    (s = new URL(s + '.js', i).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = s), (e.onload = a), document.head.appendChild(e);
        } else (e = s), importScripts(s), a();
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[t]) return;
    let n = {};
    const r = (e) => s(e, t),
      d = { module: { uri: t }, exports: n, require: r };
    a[t] = Promise.all(i.map((e) => d[e] || r(e))).then((e) => (c(...e), n));
  };
}
define(['./workbox-291962df'], function (e) {
  'use strict';
  importScripts('fallback-6pZhDAn3TunWWYgANJHDQ.js'),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/ELO-Learning-Mascot.png',
          revision: '5bf20cbea33c1f3bf468c5b0dbb3e914',
        },
        {
          url: '/ELO-Logo-Horizontal.png',
          revision: '641c3b8648ca8a2a6854c8dc772ebd33',
        },
        {
          url: '/Light-horizontal.png',
          revision: '13860e26ca898ac117d7ea79ca995ae4',
        },
        {
          url: '/_next/app-build-manifest.json',
          revision: 'fa65c08fb16cff0b1d345bb9fcabfc38',
        },
        {
          url: '/_next/static/6pZhDAn3TunWWYgANJHDQ/_buildManifest.js',
          revision: '0102901edece8b62ba414150fa77cc5b',
        },
        {
          url: '/_next/static/6pZhDAn3TunWWYgANJHDQ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1355.211cecb93dd505f3.js',
          revision: '211cecb93dd505f3',
        },
        {
          url: '/_next/static/chunks/201-723a4d2194dd84b9.js',
          revision: '723a4d2194dd84b9',
        },
        {
          url: '/_next/static/chunks/2108-94b3026b2acb64f8.js',
          revision: '94b3026b2acb64f8',
        },
        {
          url: '/_next/static/chunks/2378-a34e24c06e1a37fd.js',
          revision: 'a34e24c06e1a37fd',
        },
        {
          url: '/_next/static/chunks/2816-af5d8dfda86ac0d5.js',
          revision: 'af5d8dfda86ac0d5',
        },
        {
          url: '/_next/static/chunks/3063-1ee9e2c4135c2cb9.js',
          revision: '1ee9e2c4135c2cb9',
        },
        {
          url: '/_next/static/chunks/3464-195470dd1bcb31ba.js',
          revision: '195470dd1bcb31ba',
        },
        {
          url: '/_next/static/chunks/4169.33cdbf51da305868.js',
          revision: '33cdbf51da305868',
        },
        {
          url: '/_next/static/chunks/4298-2c4da2f6a046cddc.js',
          revision: '2c4da2f6a046cddc',
        },
        {
          url: '/_next/static/chunks/4bd1b696-9909f507f95988b8.js',
          revision: '9909f507f95988b8',
        },
        {
          url: '/_next/static/chunks/5439-7a39d51540eda703.js',
          revision: '7a39d51540eda703',
        },
        {
          url: '/_next/static/chunks/5964-5f91c1514d945928.js',
          revision: '5f91c1514d945928',
        },
        {
          url: '/_next/static/chunks/6242-43b9ea95a89afd75.js',
          revision: '43b9ea95a89afd75',
        },
        {
          url: '/_next/static/chunks/6248-111e7d4ac0b5f1b9.js',
          revision: '111e7d4ac0b5f1b9',
        },
        {
          url: '/_next/static/chunks/6874-414075bb21e16c80.js',
          revision: '414075bb21e16c80',
        },
        {
          url: '/_next/static/chunks/688-9d19ed48fb491c4a.js',
          revision: '9d19ed48fb491c4a',
        },
        {
          url: '/_next/static/chunks/8528-c7ade5ffb28092a3.js',
          revision: 'c7ade5ffb28092a3',
        },
        {
          url: '/_next/static/chunks/8839-6cf5252d890c6c84.js',
          revision: '6cf5252d890c6c84',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/base-assessment/page-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/create-avatar/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/create-avatar/page-7c446227bda915a1.js',
          revision: '7c446227bda915a1',
        },
        {
          url: '/_next/static/chunks/app/dashboard/layout-53386f54bb0cf75f.js',
          revision: '53386f54bb0cf75f',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-d175444e14461954.js',
          revision: 'd175444e14461954',
        },
        {
          url: '/_next/static/chunks/app/end-screen/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/end-screen/page-fda8cb7d1ed2b240.js',
          revision: 'fda8cb7d1ed2b240',
        },
        {
          url: '/_next/static/chunks/app/game/%5Bgame%5D/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/game/%5Bgame%5D/page-3a4b0834584bd231.js',
          revision: '3a4b0834584bd231',
        },
        {
          url: '/_next/static/chunks/app/help/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/help/page-deadd62b48f2aab3.js',
          revision: 'deadd62b48f2aab3',
        },
        {
          url: '/_next/static/chunks/app/layout-e208bc8600dd7a93.js',
          revision: 'e208bc8600dd7a93',
        },
        {
          url: '/_next/static/chunks/app/login-landing/forgot-password/page-ecc8cf6eb64af215.js',
          revision: 'ecc8cf6eb64af215',
        },
        {
          url: '/_next/static/chunks/app/login-landing/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/login-landing/login/page-71bc77a178e70453.js',
          revision: '71bc77a178e70453',
        },
        {
          url: '/_next/static/chunks/app/login-landing/page-45a1c52d8b909528.js',
          revision: '45a1c52d8b909528',
        },
        {
          url: '/_next/static/chunks/app/login-landing/reset-password/page-4cdeff7aebe4eebc.js',
          revision: '4cdeff7aebe4eebc',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/age/page-ebcbdf81e7834d62.js',
          revision: 'ebcbdf81e7834d62',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/email/page-731f8099cdbeb7ec.js',
          revision: '731f8099cdbeb7ec',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/grade/page-b1b5b5f4c3c924b4.js',
          revision: 'b1b5b5f4c3c924b4',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/page-8c9aa06b12c0e8a4.js',
          revision: '8c9aa06b12c0e8a4',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/password/page-32ccd811cca8039f.js',
          revision: '32ccd811cca8039f',
        },
        {
          url: '/_next/static/chunks/app/login-landing/signup/username/page-1ddab06ea63512a0.js',
          revision: '1ddab06ea63512a0',
        },
        {
          url: '/_next/static/chunks/app/match-endscreen/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/match-endscreen/page-c4533246141bd18b.js',
          revision: 'c4533246141bd18b',
        },
        {
          url: '/_next/static/chunks/app/match/layout-f9acb5d79bb318de.js',
          revision: 'f9acb5d79bb318de',
        },
        {
          url: '/_next/static/chunks/app/match/page-da79a7855f978018.js',
          revision: 'da79a7855f978018',
        },
        {
          url: '/_next/static/chunks/app/memo/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/memo/page-03a197dc8b9a4ac1.js',
          revision: '03a197dc8b9a4ac1',
        },
        {
          url: '/_next/static/chunks/app/not-found-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/offline/page-917149f8a8bf3f91.js',
          revision: '917149f8a8bf3f91',
        },
        {
          url: '/_next/static/chunks/app/page-a0daa00c2a3137fb.js',
          revision: 'a0daa00c2a3137fb',
        },
        {
          url: '/_next/static/chunks/app/practice/layout-4757830e60097dfb.js',
          revision: '4757830e60097dfb',
        },
        {
          url: '/_next/static/chunks/app/practice/page-510134d91ce67dd4.js',
          revision: '510134d91ce67dd4',
        },
        {
          url: '/_next/static/chunks/app/profile/layout-3525f84af2db3559.js',
          revision: '3525f84af2db3559',
        },
        {
          url: '/_next/static/chunks/app/profile/page-bffac05246e1a08e.js',
          revision: 'bffac05246e1a08e',
        },
        {
          url: '/_next/static/chunks/app/question-templates/expression-builder/page-c66824cf0e4e54c3.js',
          revision: 'c66824cf0e4e54c3',
        },
        {
          url: '/_next/static/chunks/app/question-templates/fill-in-blank/page-5caddc1ea381b070.js',
          revision: '5caddc1ea381b070',
        },
        {
          url: '/_next/static/chunks/app/question-templates/input-questions/page-8fbee85c2dadf76e.js',
          revision: '8fbee85c2dadf76e',
        },
        {
          url: '/_next/static/chunks/app/question-templates/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/question-templates/math-input/page-4040114cdef722c3.js',
          revision: '4040114cdef722c3',
        },
        {
          url: '/_next/static/chunks/app/question-templates/mixed/page-6e9096221ffe84ff.js',
          revision: '6e9096221ffe84ff',
        },
        {
          url: '/_next/static/chunks/app/question-templates/multiple-choice/page-b5bb7862a652f1ec.js',
          revision: 'b5bb7862a652f1ec',
        },
        {
          url: '/_next/static/chunks/app/question-templates/open-response/page-700d9ca93ff145e8.js',
          revision: '700d9ca93ff145e8',
        },
        {
          url: '/_next/static/chunks/app/question-templates/page-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/settings/change-password/page-d723a3669233b1c5.js',
          revision: 'd723a3669233b1c5',
        },
        {
          url: '/_next/static/chunks/app/settings/page-86811a9297790eb4.js',
          revision: '86811a9297790eb4',
        },
        {
          url: '/_next/static/chunks/app/settings/template-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/single-player-game/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/single-player-game/page-b5bb7862a652f1ec.js',
          revision: 'b5bb7862a652f1ec',
        },
        {
          url: '/_next/static/chunks/app/single-player/layout-603dd2781174b781.js',
          revision: '603dd2781174b781',
        },
        {
          url: '/_next/static/chunks/app/single-player/page-510134d91ce67dd4.js',
          revision: '510134d91ce67dd4',
        },
        {
          url: '/_next/static/chunks/app/test-cache/page-b3a63d8ccae9be9f.js',
          revision: 'b3a63d8ccae9be9f',
        },
        {
          url: '/_next/static/chunks/app/test-validator/page-c856db4f8e045dc1.js',
          revision: 'c856db4f8e045dc1',
        },
        {
          url: '/_next/static/chunks/app/topic/%5Btopic%5D/layout-c052c118a44d16d0.js',
          revision: 'c052c118a44d16d0',
        },
        {
          url: '/_next/static/chunks/app/topic/%5Btopic%5D/page-b5bb7862a652f1ec.js',
          revision: 'b5bb7862a652f1ec',
        },
        {
          url: '/_next/static/chunks/bdfe9574-4b16423d468a6774.js',
          revision: '4b16423d468a6774',
        },
        {
          url: '/_next/static/chunks/framework-9abb776b0edbbe85.js',
          revision: '9abb776b0edbbe85',
        },
        {
          url: '/_next/static/chunks/main-app-a9ac1f4db27a36d1.js',
          revision: 'a9ac1f4db27a36d1',
        },
        {
          url: '/_next/static/chunks/main-f93feeb5df3146ef.js',
          revision: 'f93feeb5df3146ef',
        },
        {
          url: '/_next/static/chunks/pages/_app-1af4163d4f10b6fc.js',
          revision: '1af4163d4f10b6fc',
        },
        {
          url: '/_next/static/chunks/pages/_error-43885327f020d18a.js',
          revision: '43885327f020d18a',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-a81457416d38b15c.js',
          revision: 'a81457416d38b15c',
        },
        {
          url: '/_next/static/css/09dfadb69bdaa005.css',
          revision: '09dfadb69bdaa005',
        },
        {
          url: '/_next/static/css/0ee7da6d44e74b1b.css',
          revision: '0ee7da6d44e74b1b',
        },
        {
          url: '/_next/static/css/cca8f9f912383bf9.css',
          revision: 'cca8f9f912383bf9',
        },
        {
          url: '/_next/static/media/569ce4b8f30dc480-s.p.woff2',
          revision: 'ef6cefb32024deac234e82f932a95cbd',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/KaTeX_AMS-Regular.1608a09b.woff',
          revision: '1608a09b',
        },
        {
          url: '/_next/static/media/KaTeX_AMS-Regular.4aafdb68.ttf',
          revision: '4aafdb68',
        },
        {
          url: '/_next/static/media/KaTeX_AMS-Regular.a79f1c31.woff2',
          revision: 'a79f1c31',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Bold.b6770918.woff',
          revision: 'b6770918',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Bold.cce5b8ec.ttf',
          revision: 'cce5b8ec',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Bold.ec17d132.woff2',
          revision: 'ec17d132',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Regular.07ef19e7.ttf',
          revision: '07ef19e7',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Regular.55fac258.woff2',
          revision: '55fac258',
        },
        {
          url: '/_next/static/media/KaTeX_Caligraphic-Regular.dad44a7f.woff',
          revision: 'dad44a7f',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Bold.9f256b85.woff',
          revision: '9f256b85',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Bold.b18f59e1.ttf',
          revision: 'b18f59e1',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Bold.d42a5579.woff2',
          revision: 'd42a5579',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Regular.7c187121.woff',
          revision: '7c187121',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Regular.d3c882a6.woff2',
          revision: 'd3c882a6',
        },
        {
          url: '/_next/static/media/KaTeX_Fraktur-Regular.ed38e79f.ttf',
          revision: 'ed38e79f',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Bold.b74a1a8b.ttf',
          revision: 'b74a1a8b',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Bold.c3fb5ac2.woff2',
          revision: 'c3fb5ac2',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Bold.d181c465.woff',
          revision: 'd181c465',
        },
        {
          url: '/_next/static/media/KaTeX_Main-BoldItalic.6f2bb1df.woff2',
          revision: '6f2bb1df',
        },
        {
          url: '/_next/static/media/KaTeX_Main-BoldItalic.70d8b0a5.ttf',
          revision: '70d8b0a5',
        },
        {
          url: '/_next/static/media/KaTeX_Main-BoldItalic.e3f82f9d.woff',
          revision: 'e3f82f9d',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Italic.47373d1e.ttf',
          revision: '47373d1e',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Italic.8916142b.woff2',
          revision: '8916142b',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Italic.9024d815.woff',
          revision: '9024d815',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Regular.0462f03b.woff2',
          revision: '0462f03b',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Regular.7f51fe03.woff',
          revision: '7f51fe03',
        },
        {
          url: '/_next/static/media/KaTeX_Main-Regular.b7f8fe9b.ttf',
          revision: 'b7f8fe9b',
        },
        {
          url: '/_next/static/media/KaTeX_Math-BoldItalic.572d331f.woff2',
          revision: '572d331f',
        },
        {
          url: '/_next/static/media/KaTeX_Math-BoldItalic.a879cf83.ttf',
          revision: 'a879cf83',
        },
        {
          url: '/_next/static/media/KaTeX_Math-BoldItalic.f1035d8d.woff',
          revision: 'f1035d8d',
        },
        {
          url: '/_next/static/media/KaTeX_Math-Italic.5295ba48.woff',
          revision: '5295ba48',
        },
        {
          url: '/_next/static/media/KaTeX_Math-Italic.939bc644.ttf',
          revision: '939bc644',
        },
        {
          url: '/_next/static/media/KaTeX_Math-Italic.f28c23ac.woff2',
          revision: 'f28c23ac',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Bold.8c5b5494.woff2',
          revision: '8c5b5494',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Bold.94e1e8dc.ttf',
          revision: '94e1e8dc',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Bold.bf59d231.woff',
          revision: 'bf59d231',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Italic.3b1e59b3.woff2',
          revision: '3b1e59b3',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Italic.7c9bc82b.woff',
          revision: '7c9bc82b',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Italic.b4c20c84.ttf',
          revision: 'b4c20c84',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Regular.74048478.woff',
          revision: '74048478',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Regular.ba21ed5f.woff2',
          revision: 'ba21ed5f',
        },
        {
          url: '/_next/static/media/KaTeX_SansSerif-Regular.d4d7ba48.ttf',
          revision: 'd4d7ba48',
        },
        {
          url: '/_next/static/media/KaTeX_Script-Regular.03e9641d.woff2',
          revision: '03e9641d',
        },
        {
          url: '/_next/static/media/KaTeX_Script-Regular.07505710.woff',
          revision: '07505710',
        },
        {
          url: '/_next/static/media/KaTeX_Script-Regular.fe9cbbe1.ttf',
          revision: 'fe9cbbe1',
        },
        {
          url: '/_next/static/media/KaTeX_Size1-Regular.e1e279cb.woff',
          revision: 'e1e279cb',
        },
        {
          url: '/_next/static/media/KaTeX_Size1-Regular.eae34984.woff2',
          revision: 'eae34984',
        },
        {
          url: '/_next/static/media/KaTeX_Size1-Regular.fabc004a.ttf',
          revision: 'fabc004a',
        },
        {
          url: '/_next/static/media/KaTeX_Size2-Regular.57727022.woff',
          revision: '57727022',
        },
        {
          url: '/_next/static/media/KaTeX_Size2-Regular.5916a24f.woff2',
          revision: '5916a24f',
        },
        {
          url: '/_next/static/media/KaTeX_Size2-Regular.d6b476ec.ttf',
          revision: 'd6b476ec',
        },
        {
          url: '/_next/static/media/KaTeX_Size3-Regular.9acaf01c.woff',
          revision: '9acaf01c',
        },
        {
          url: '/_next/static/media/KaTeX_Size3-Regular.a144ef58.ttf',
          revision: 'a144ef58',
        },
        {
          url: '/_next/static/media/KaTeX_Size3-Regular.b4230e7e.woff2',
          revision: 'b4230e7e',
        },
        {
          url: '/_next/static/media/KaTeX_Size4-Regular.10d95fd3.woff2',
          revision: '10d95fd3',
        },
        {
          url: '/_next/static/media/KaTeX_Size4-Regular.7a996c9d.woff',
          revision: '7a996c9d',
        },
        {
          url: '/_next/static/media/KaTeX_Size4-Regular.fbccdabe.ttf',
          revision: 'fbccdabe',
        },
        {
          url: '/_next/static/media/KaTeX_Typewriter-Regular.6258592b.woff',
          revision: '6258592b',
        },
        {
          url: '/_next/static/media/KaTeX_Typewriter-Regular.a8709e36.woff2',
          revision: 'a8709e36',
        },
        {
          url: '/_next/static/media/KaTeX_Typewriter-Regular.d97aaf4a.ttf',
          revision: 'd97aaf4a',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        {
          url: '/avatar-icons/Background.svg',
          revision: 'f8526747a51252ec251bc17e72c3df74',
        },
        {
          url: '/avatar-icons/Body.svg',
          revision: '9d7706c9d0c1022d98aa88ab91e7232d',
        },
        {
          url: '/avatar-icons/Colour.svg',
          revision: '34e0511c98fa536b02f6f003db3a5778',
        },
        {
          url: '/avatar-icons/Eyes.svg',
          revision: 'af3f088701bc028d23c42d5500b18a8e',
        },
        {
          url: '/avatar-icons/Mouth.svg',
          revision: '2e19071d8d80d75229681147cd7588b6',
        },
        {
          url: '/browserconfig.xml',
          revision: '21ca83c4dade7947e57ea59afe75846a',
        },
        {
          url: '/chess-animation.gif',
          revision: '18738f89e140ff0229ff8938b5eb8116',
        },
        {
          url: '/elo-aninmation.gif',
          revision: '50eeabd4eed7565160093c7a3814e2e1',
        },
        {
          url: '/eyes/Eye 1.svg',
          revision: '88557eb137956c00a7d7bf6657ac09f0',
        },
        {
          url: '/eyes/Eye 10.svg',
          revision: 'c41fc97e6f0cc49d1f4f5a54c4005acb',
        },
        {
          url: '/eyes/Eye 11.svg',
          revision: 'fd626034d058837e5355e312606cfc0b',
        },
        {
          url: '/eyes/Eye 12.svg',
          revision: '881f00a198dbf5bbb242b6ea9c2a53f0',
        },
        {
          url: '/eyes/Eye 13.svg',
          revision: '705fd48a77af524474e0028ba2826779',
        },
        {
          url: '/eyes/Eye 14.svg',
          revision: 'b2bba58d990344998d99c7a54dc0891e',
        },
        {
          url: '/eyes/Eye 15.svg',
          revision: '0c2a7a1bd492ca0b3f8ae1b5242e9ea9',
        },
        {
          url: '/eyes/Eye 16.svg',
          revision: 'a4111ed84d798948a244caa6f79abe2d',
        },
        {
          url: '/eyes/Eye 17.svg',
          revision: 'c331b900125922f598198ea1483b2aac',
        },
        {
          url: '/eyes/Eye 18.svg',
          revision: '213a8667a7b4d724856c256803b6d598',
        },
        {
          url: '/eyes/Eye 19.svg',
          revision: '3ccf14ed0955f4f8b816b8696a2df52b',
        },
        {
          url: '/eyes/Eye 2.svg',
          revision: '5f9c616cbf21de27841dfb9dc16c953f',
        },
        {
          url: '/eyes/Eye 20.svg',
          revision: '0fbfcbc55067da9e50bdf7371eca5c8a',
        },
        {
          url: '/eyes/Eye 21.svg',
          revision: '29c06e027696d6df235ea70fcc6d6e2a',
        },
        {
          url: '/eyes/Eye 22.svg',
          revision: '2721f7e3896bb2f3169deca0da32bc2e',
        },
        {
          url: '/eyes/Eye 23.svg',
          revision: 'b9c2641c1c39cdf917e5dbd87c38321e',
        },
        {
          url: '/eyes/Eye 24.svg',
          revision: '5d16f0c63f1ed226c999eafc4e7d1a89',
        },
        {
          url: '/eyes/Eye 25.svg',
          revision: '29ffa196806cea00925a5f90e601f1c6',
        },
        {
          url: '/eyes/Eye 26.svg',
          revision: '831a9a75e9edfc95675829089030d075',
        },
        {
          url: '/eyes/Eye 27.svg',
          revision: 'a3866e04f0fa1e5efba00dd22bd70c86',
        },
        {
          url: '/eyes/Eye 28.svg',
          revision: '365248c483143a030e2491fe5f370b62',
        },
        {
          url: '/eyes/Eye 29.svg',
          revision: '65a22b5b4ca90be824bdafa6154216ca',
        },
        {
          url: '/eyes/Eye 3.svg',
          revision: '03ad3d80bfc3858f48fa6bdfca550989',
        },
        {
          url: '/eyes/Eye 30.svg',
          revision: 'e7dafcf41e35e8109ad43a6143d0e109',
        },
        {
          url: '/eyes/Eye 31.svg',
          revision: 'ed783e76169542560d660387093b3db0',
        },
        {
          url: '/eyes/Eye 32.svg',
          revision: 'c82e86af8fa206351db465a25912e970',
        },
        {
          url: '/eyes/Eye 4.svg',
          revision: '0d1b77a80372cdde9679905dd246ddfa',
        },
        {
          url: '/eyes/Eye 5.svg',
          revision: '25328a9243edfab9a25ef5ea7b931bfa',
        },
        {
          url: '/eyes/Eye 6.svg',
          revision: '1dd14c2cecc83405ec285172365590e7',
        },
        {
          url: '/eyes/Eye 7.svg',
          revision: 'fdb231f48f0e82f20ea08f3aec13e26d',
        },
        {
          url: '/eyes/Eye 8.svg',
          revision: 'c3a2af3f32c19a80379def248f2a7536',
        },
        {
          url: '/eyes/Eye 9.svg',
          revision: 'eea0b5b7a8d4d35f95bad9d8d5602def',
        },
        { url: '/file.svg', revision: '5a7cf15203348f0915990406e4fe2fc2' },
        { url: '/globe.svg', revision: '0666a56cc38cb6872fad06c182ef2660' },
        {
          url: '/icons/icon-128x128.png',
          revision: 'be35a66ea3ec4e69c41cf5e52717b0e7',
        },
        {
          url: '/icons/icon-144x144.png',
          revision: '79f5c2f0cb03d2f4e429cfaa2fc2f7b2',
        },
        {
          url: '/icons/icon-152x152.png',
          revision: '7308489623e57b74203da3cf9bb75e59',
        },
        {
          url: '/icons/icon-192x192.png',
          revision: 'eca86252110b5c6d6996c9af5219c2bb',
        },
        {
          url: '/icons/icon-384x384.png',
          revision: '1490c32dd4715fbd63fc9b4e5ad526b7',
        },
        {
          url: '/icons/icon-512x512.png',
          revision: '5bf20cbea33c1f3bf468c5b0dbb3e914',
        },
        {
          url: '/icons/icon-72x72.png',
          revision: '59d3a9de20c1d775f94f6610d9b70dc5',
        },
        {
          url: '/icons/icon-96x96.png',
          revision: '74a02ebb60aaa9cfa1582fd62f8fb809',
        },
        { url: '/manifest.json', revision: '77c4eb41e8328b496cdbdd7e15aa8b5c' },
        {
          url: '/mouths/Mouth 1.svg',
          revision: '104d892cb4bea0c2cc04b7cc552b63a2',
        },
        {
          url: '/mouths/Mouth 10.svg',
          revision: '226a487f292d7333ca24283d52aa18f5',
        },
        {
          url: '/mouths/Mouth 11.svg',
          revision: '47392be020bea490c62ec3e77c7d78fa',
        },
        {
          url: '/mouths/Mouth 12.svg',
          revision: '5ea1f24a2146fa015a4945a2737e82a9',
        },
        {
          url: '/mouths/Mouth 13.svg',
          revision: 'd339abda9500bb26219f273376b90303',
        },
        {
          url: '/mouths/Mouth 14.svg',
          revision: '5b697ff258e58d41578c0288482e519d',
        },
        {
          url: '/mouths/Mouth 15.svg',
          revision: 'e0bc7415a4193cce1240ced82e1d2d92',
        },
        {
          url: '/mouths/Mouth 16.svg',
          revision: '48f7eaf566090395373f9fd397cd0de5',
        },
        {
          url: '/mouths/Mouth 17.svg',
          revision: '276eaaa084dd86fe2a4e332dc38cd34d',
        },
        {
          url: '/mouths/Mouth 18.svg',
          revision: 'd8feb338d3cc5f3c9143df0e6df44076',
        },
        {
          url: '/mouths/Mouth 19.svg',
          revision: '204e0c53dca2398209829f207a43dfc9',
        },
        {
          url: '/mouths/Mouth 2.svg',
          revision: '0b50a7c9038867c5729caef6103b3f8b',
        },
        {
          url: '/mouths/Mouth 20.svg',
          revision: 'de527d583763aeb5589dff38a7faf29d',
        },
        {
          url: '/mouths/Mouth 21.svg',
          revision: 'bd89723ad79f7d908eb48b750001216d',
        },
        {
          url: '/mouths/Mouth 22.svg',
          revision: 'd7b7b49244017e2012d48b7b9dd8d748',
        },
        {
          url: '/mouths/Mouth 23.svg',
          revision: '61c0fc1448e3e3599ccace65d2279c7f',
        },
        {
          url: '/mouths/Mouth 24.svg',
          revision: '0932dc01294c82aad326484aa3d41c11',
        },
        {
          url: '/mouths/Mouth 25.svg',
          revision: 'a124187304d56c27fed6540ba17ea732',
        },
        {
          url: '/mouths/Mouth 26.svg',
          revision: 'db265a1b2fff2d9ec02b9fb74a447878',
        },
        {
          url: '/mouths/Mouth 27.svg',
          revision: 'd6a39038153b089ecbc5b66fcf1837a1',
        },
        {
          url: '/mouths/Mouth 28.svg',
          revision: '34bda4ba246f80cde40fa2431b6d7685',
        },
        {
          url: '/mouths/Mouth 29.svg',
          revision: '484dc2f5324997cc70011a4101f3a72d',
        },
        {
          url: '/mouths/Mouth 3.svg',
          revision: '2c2d6a2b4c3b2faaff1d26bfcec35ee1',
        },
        {
          url: '/mouths/Mouth 30.svg',
          revision: '7a59c4abcdf541f4da3c923d24df0a80',
        },
        {
          url: '/mouths/Mouth 31.svg',
          revision: '438aa4533f8a8cd7a142a1a76fe2652c',
        },
        {
          url: '/mouths/Mouth 32.svg',
          revision: '29dc3d2f0968af38d7e0d937c5ca8d87',
        },
        {
          url: '/mouths/Mouth 4.svg',
          revision: '7076e06c4a9bdcc6ca34d7b6c3288d5d',
        },
        {
          url: '/mouths/Mouth 5.svg',
          revision: 'f16de3f44df5b45c1a86551fd44179de',
        },
        {
          url: '/mouths/Mouth 6.svg',
          revision: 'aaa6b244a7cfc98a60c9bd655eed5abf',
        },
        {
          url: '/mouths/Mouth 7.svg',
          revision: '4ba735209372a7be83589414c34c2a11',
        },
        {
          url: '/mouths/Mouth 8.svg',
          revision: '8ec22b0f5ac24d570da83eea8b14a5f8',
        },
        {
          url: '/mouths/Mouth 9.svg',
          revision: '03fa93a3b666586bac90df94781ab030',
        },
        { url: '/next.svg', revision: '2c469ea859f2cba868be3a6bd258a961' },
        { url: '/offline', revision: '6pZhDAn3TunWWYgANJHDQ' },
        { url: '/progress.gif', revision: '2f056a626b2955ea4dd724afaa6219ba' },
        {
          url: '/shapes/Circle.svg',
          revision: '3c6d66d5df8b03e32b468cc9044c4b88',
        },
        {
          url: '/shapes/Heart.svg',
          revision: '2fe1fd401b5aa4d1cbb84089d578cf2d',
        },
        {
          url: '/shapes/Pentagon.svg',
          revision: '6d22c6352cd79587d076b354774a0c29',
        },
        {
          url: '/shapes/Polygon.svg',
          revision: '89e38e70da8b40b65c97eaf9d201ea72',
        },
        {
          url: '/shapes/Square.svg',
          revision: '97d27322335ace43ddb1d3f457a3963b',
        },
        {
          url: '/shapes/Taco.svg',
          revision: 'b5d9ff78ff6ec2308d19f85b267fcbe4',
        },
        {
          url: '/shapes/Triangle.svg',
          revision: '801a652f2c7ddcde1c2899da58fa3916',
        },
        { url: '/user.svg', revision: '6669c08a60a894418ae66f651fae617d' },
        { url: '/vercel.svg', revision: '5570ba747e9dd6fdb68e7e2dd32d1cec' },
        { url: '/window.svg', revision: 'f2d60ec0c2c0d62aac6a19dc14ea108d' },
        { url: '/winner.gif', revision: 'ae0d1ab87dc692d98cdc92f80e001762' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: i,
            }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: a.headers,
                  })
                : a,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const a = e.pathname;
        return !a.startsWith('/api/auth/') && !!a.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      'GET',
    );
});
