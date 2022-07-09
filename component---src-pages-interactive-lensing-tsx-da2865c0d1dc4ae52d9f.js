/*! For license information please see component---src-pages-interactive-lensing-tsx-da2865c0d1dc4ae52d9f.js.LICENSE.txt */
(self.webpackChunkadam_coogan_github_io=self.webpackChunkadam_coogan_github_io||[]).push([[228],{7945:function(e,t,r){"use strict";var n=r(6494),a=60103,o=60106;t.Fragment=60107,t.StrictMode=60108,t.Profiler=60114;var i=60109,s=60110,l=60112;t.Suspense=60113;var u=60115,c=60116;if("function"==typeof Symbol&&Symbol.for){var f=Symbol.for;a=f("react.element"),o=f("react.portal"),t.Fragment=f("react.fragment"),t.StrictMode=f("react.strict_mode"),t.Profiler=f("react.profiler"),i=f("react.provider"),s=f("react.context"),l=f("react.forward_ref"),t.Suspense=f("react.suspense"),u=f("react.memo"),c=f("react.lazy")}var h="function"==typeof Symbol&&Symbol.iterator;function d(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,r=1;r<arguments.length;r++)t+="&args[]="+encodeURIComponent(arguments[r]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var p={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},m={};function g(e,t,r){this.props=e,this.context=t,this.refs=m,this.updater=r||p}function y(){}function b(e,t,r){this.props=e,this.context=t,this.refs=m,this.updater=r||p}g.prototype.isReactComponent={},g.prototype.setState=function(e,t){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error(d(85));this.updater.enqueueSetState(this,e,t,"setState")},g.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},y.prototype=g.prototype;var v=b.prototype=new y;v.constructor=b,n(v,g.prototype),v.isPureReactComponent=!0;var _={current:null},w=Object.prototype.hasOwnProperty,E={key:!0,ref:!0,__self:!0,__source:!0};function x(e,t,r){var n,o={},i=null,s=null;if(null!=t)for(n in void 0!==t.ref&&(s=t.ref),void 0!==t.key&&(i=""+t.key),t)w.call(t,n)&&!E.hasOwnProperty(n)&&(o[n]=t[n]);var l=arguments.length-2;if(1===l)o.children=r;else if(1<l){for(var u=Array(l),c=0;c<l;c++)u[c]=arguments[c+2];o.children=u}if(e&&e.defaultProps)for(n in l=e.defaultProps)void 0===o[n]&&(o[n]=l[n]);return{$$typeof:a,type:e,key:i,ref:s,props:o,_owner:_.current}}function k(e){return"object"==typeof e&&null!==e&&e.$$typeof===a}var S=/\/+/g;function C(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,(function(e){return t[e]}))}(""+e.key):t.toString(36)}function T(e,t,r,n,i){var s=typeof e;"undefined"!==s&&"boolean"!==s||(e=null);var l=!1;if(null===e)l=!0;else switch(s){case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case a:case o:l=!0}}if(l)return i=i(l=e),e=""===n?"."+C(l,0):n,Array.isArray(i)?(r="",null!=e&&(r=e.replace(S,"$&/")+"/"),T(i,t,r,"",(function(e){return e}))):null!=i&&(k(i)&&(i=function(e,t){return{$$typeof:a,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(i,r+(!i.key||l&&l.key===i.key?"":(""+i.key).replace(S,"$&/")+"/")+e)),t.push(i)),1;if(l=0,n=""===n?".":n+":",Array.isArray(e))for(var u=0;u<e.length;u++){var c=n+C(s=e[u],u);l+=T(s,t,r,c,i)}else if("function"==typeof(c=function(e){return null===e||"object"!=typeof e?null:"function"==typeof(e=h&&e[h]||e["@@iterator"])?e:null}(e)))for(e=c.call(e),u=0;!(s=e.next()).done;)l+=T(s=s.value,t,r,c=n+C(s,u++),i);else if("object"===s)throw t=""+e,Error(d(31,"[object Object]"===t?"object with keys {"+Object.keys(e).join(", ")+"}":t));return l}function R(e,t,r){if(null==e)return e;var n=[],a=0;return T(e,n,"","",(function(e){return t.call(r,e,a++)})),n}function H(e){if(-1===e._status){var t=e._result;t=t(),e._status=0,e._result=t,t.then((function(t){0===e._status&&(t=t.default,e._status=1,e._result=t)}),(function(t){0===e._status&&(e._status=2,e._result=t)}))}if(1===e._status)return e._result;throw e._result}var $={current:null};function I(){var e=$.current;if(null===e)throw Error(d(321));return e}var F={ReactCurrentDispatcher:$,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:_,IsSomeRendererActing:{current:!1},assign:n};t.Children={map:R,forEach:function(e,t,r){R(e,(function(){t.apply(this,arguments)}),r)},count:function(e){var t=0;return R(e,(function(){t++})),t},toArray:function(e){return R(e,(function(e){return e}))||[]},only:function(e){if(!k(e))throw Error(d(143));return e}},t.Component=g,t.PureComponent=b,t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=F,t.cloneElement=function(e,t,r){if(null==e)throw Error(d(267,e));var o=n({},e.props),i=e.key,s=e.ref,l=e._owner;if(null!=t){if(void 0!==t.ref&&(s=t.ref,l=_.current),void 0!==t.key&&(i=""+t.key),e.type&&e.type.defaultProps)var u=e.type.defaultProps;for(c in t)w.call(t,c)&&!E.hasOwnProperty(c)&&(o[c]=void 0===t[c]&&void 0!==u?u[c]:t[c])}var c=arguments.length-2;if(1===c)o.children=r;else if(1<c){u=Array(c);for(var f=0;f<c;f++)u[f]=arguments[f+2];o.children=u}return{$$typeof:a,type:e.type,key:i,ref:s,props:o,_owner:l}},t.createContext=function(e,t){return void 0===t&&(t=null),(e={$$typeof:s,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:i,_context:e},e.Consumer=e},t.createElement=x,t.createFactory=function(e){var t=x.bind(null,e);return t.type=e,t},t.createRef=function(){return{current:null}},t.forwardRef=function(e){return{$$typeof:l,render:e}},t.isValidElement=k,t.lazy=function(e){return{$$typeof:c,_payload:{_status:-1,_result:e},_init:H}},t.memo=function(e,t){return{$$typeof:u,type:e,compare:void 0===t?null:t}},t.useCallback=function(e,t){return I().useCallback(e,t)},t.useContext=function(e,t){return I().useContext(e,t)},t.useDebugValue=function(){},t.useEffect=function(e,t){return I().useEffect(e,t)},t.useImperativeHandle=function(e,t,r){return I().useImperativeHandle(e,t,r)},t.useLayoutEffect=function(e,t){return I().useLayoutEffect(e,t)},t.useMemo=function(e,t){return I().useMemo(e,t)},t.useReducer=function(e,t,r){return I().useReducer(e,t,r)},t.useRef=function(e){return I().useRef(e)},t.useState=function(e){return I().useState(e)},t.version="17.0.1"},8824:function(e,t,r){"use strict";e.exports=r(7945)},790:function(e,t,r){"use strict";var n=r(8824),a=r(3450);t.Z=function(e){var t=e.resampleSHs,r=e.hideSHs,o=e.toggleHideSHs;return n.createElement("div",null,n.createElement("h2",null,"Subhalo parameters"),n.createElement(a.Z,{onClick:function(){return t()}},"Resample subhalos"),n.createElement(a.Z,{onClick:function(){return o()},selected:!r},r?"Show subhalos":"Hide subhalos"))}},3099:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return k}});var n=r(7294),a=r(2109),o=r(2955),i=r(9),s=r.p+"static/horseshoe-4af20953c99936a0e44bcbdc7e0dd8ff.jpg",l=i.default.div.withConfig({displayName:"horseshoe__Horseshoe",componentId:"sc-5tm37f-0"})(['background-image:url("','");background-repeat:no-repeat;background-size:cover;width:250px;height:250px;background-position:left;'],s),u=r.p+"static/cdm-galaxy-9aa9eb5af2e6561e31f620faa08a7f51.png",c=i.default.div.withConfig({displayName:"cdmgalaxy__CDMGalaxy",componentId:"sc-200day-0"})(['background-image:url("','");background-repeat:no-repeat;background-size:cover;width:250px;height:250px;background-position:left;'],u),f=r.p+"static/wdm-galaxy-70429444d72013e26df1d5403a9a83a3.png",h=i.default.div.withConfig({displayName:"wdmgalaxy__WDMGalaxy",componentId:"sc-179hpcy-0"})(['background-image:url("','");background-repeat:no-repeat;background-size:cover;width:250px;height:250px;background-position:left;'],f),d=r(2802),p=r(338),m=r(7673),g=r(790),y=r(6758),b=r(3774),v=r(9682),_=r(2507),w=r(3286),E=r(1644),x=(0,w.yb)(50),k=function(){var e=(0,n.useState)(.05),t=e[0],r=e[1],i=(0,n.useState)(_.EF),s=i[0],u=i[1],f=(0,n.useState)(40.107),w=f[0],k=f[1],S=(0,n.useState)(.5),C=S[0],T=S[1],R=(0,n.useState)(4),H=R[0],$=R[1],I=(0,n.useState)(5),F=I[0],D=I[1],P=(0,n.useState)(57.296),j=P[0],A=P[1],L=(0,n.useState)(.75),M=L[0],O=L[1],Z=(0,n.useState)(1.5),q=Z[0],N=Z[1],U=(0,n.useState)(_.xY),W=U[0],z=U[1],B=(0,n.useState)(.007),G=B[0],Y=B[1],V=(0,n.useState)(.01),J=V[0],Q=V[1],X=(0,n.useState)((0,E.Af)(50)),K=X[0],ee=X[1],te=(0,n.useState)(!0),re=te[0],ne=te[1],ae=(0,n.useState)(.1),oe=ae[0],ie=ae[1],se=(0,n.useState)(.5),le=se[0],ue=se[1],ce=0===W?23:_.xY,fe=ce,he=ce,de=400,pe=(0,E.kC)(de,_.Ip,oe),me=pe*oe/2,ge=_.w*pe,ye=(0,n.useState)((0,E.ag)(Math.pow(pe,2),5)),be=ye[0],ve=ye[1],_e=n.createElement("div",{id:"intro",style:{width:"800px",margin:"auto",paddingBottom:"20px"}},n.createElement("h1",null,"What's this all about?"),n.createElement("p",null,"A range of observations on galactic through cosmological scales demand the existence of ",n.createElement("b",null,"dark matter"),", which outweighs normal matter by 4:1. But beyond its abundance and distribution on large scales, the identity of the fundamental constituents of dark matter remains unknown."),n.createElement("p",null,"The fundamental properties of dark matter are closely connected with how it is distributed on small scales. For example, the images below from this simulation visualize the dark matter in a galaxy assuming it is"," ",n.createElement("b",null,"cold"),"(i.e. heavy and slow-moving, left plot) or warm (i.e. light and fast-moving, right plot). The difference is striking: if dark matter is warm, galaxies should contain far fewer small structures (more properly called",n.createElement("a",{href:"https://en.wikipedia.org/wiki/Dark_matter_halo"},n.createElement("b",null,"subhalos")),") than if it is cold. The general lesson is that learning how dark matter is distributed on subgalactic scales tells us something about its fundamental properties."),n.createElement("div",{style:{display:"flex",justifyContent:"space-around"}},n.createElement(c,null)," ",n.createElement(h,null)),n.createElement("p",null,"Since small subhalos are made purely of dark matter, they don't emit light and are hard to search for. Instead, I use"," ",n.createElement("a",{href:"https://en.wikipedia.org/wiki/Gravitational_lens"},n.createElement("b",null,"gravitational lensing"))," ","to search for them."),n.createElement("div",{style:{display:"flex"}},n.createElement("div",{style:{paddingRight:"40px"}},n.createElement("p",null,"To right is a Hubble Space Telescope image of the famous"," ",n.createElement("a",{href:"https://en.wikipedia.org/wiki/Cosmic_Horseshoe"},"Horseshoe lens"),". The orange light is from the system's ",n.createElement("i",null,"lens")," galaxy. The blue light comes from the ",n.createElement("i",null,"source")," galaxy. The source is not really ring-shaped. Instead, it lies a good distance directly behind the lens, whose gravitational field dramatically distorts the source's light."),n.createElement("p",null,"The lens galaxy consists of a large amount of dark matter, stars, dust and gas, and the ring-shaped distortion it produces is immediately apparent. However, the gravitational distortions caused by dark matter subhalos located in the lens are far more subtle. Measuring their distortions requires precision statistical analysis.")),n.createElement(l,{style:{minWidth:"250px"}})),n.createElement("p",null,n.createElement("b",null,"I use machine learning and statistics to detect and measure the distortions from subhalos in lenses"),". The visualization below will give you a sense of why this is a difficult problem. The left image shows a simple model for what the light could look like from an undistorted source galaxy. The image on the right shows what a telescope would see: the distorted ring of light from the source, plus the light from the lens. Some things to explore:"),n.createElement("ul",null,n.createElement("li",null,'Click the "Resample subhalos" button to see how small the distortions from subhalos are. The variations between images with different subhalo populations can be quite small! Where in the observation are the differences most apparent? (Click "Show subhalos" if you want to see wherre the subhalos are located.)'),n.createElement("li",null,"Change the sliders controlling the source, lens and shear parameters to see how they impact the observation. Can you find configurations where the subhalos' distortions are more apparent?"),n.createElement("li",null,"Upcoming telescopes like the Extremely Large Telescope (ELT) and James Webb Space Telescope (JWST) will have much higher resolution than the Hubble Space Telescope. What impact does that have on how easy it is to see distortions from subhalos?"),n.createElement("li",null,"Longer telescope observations reduce the noise in the observation. How does this help make the effects of subhalos more apparent?"),n.createElement("li",null,'If you want to hide the light from the lens galaxy to make the distorted source galaxy easier to see, click "Turn off lens light". Subtracting this light from observations is typically the first stage in the data analysis.'))),we=n.createElement("div",{style:{width:de,display:"flex",flexDirection:"column",alignItems:"left",paddingRight:"40px"}},n.createElement("div",null,n.createElement("h2",{"data-tip":!0,"data-for":"sourceHeaderTT"},"Source"),n.createElement(a.Z,{id:"sourceHeaderTT"},"Source galaxy with no lensing"),n.createElement(y.Z,{x_s:t,y_s:s,phi_sDeg:w,q_s:C,index:H,r_e:F,I_e:.05,lowFlux:-3,highFlux:fe,range:me,canvasDim:de})),n.createElement(b.Z,{x:t,y:s,phiDeg:w,q:C,index:H,r_e:F,setX:r,setY:u,setPhiDeg:k,setQ:T,setIndex:$,setRe:D}),n.createElement(v.Z,{sigma_n:le,setSigmaN:ue,setRes:function(e){ie(e);var t=(0,E.kC)(de,_.Ip,e);ve((0,E.ag)(Math.pow(t,2),5))},resampleNoise:function(){return ve((0,E.ag)(Math.pow(pe,2),5))}})),Ee=n.createElement("div",{style:{width:de,display:"flex",flexDirection:"column",alignItems:"left",paddingLeft:"40px"}},n.createElement("div",null,n.createElement("h2",{"data-tip":!0,"data-for":"obsHeaderTT"},"Observation"),n.createElement(a.Z,{id:"obsHeaderTT"},"Observation of lensed galaxy seen by telescope"),n.createElement(d.Z,{fsLensSource:x,x_s:t,y_s:s,phi_sDeg:w,q_s:C,index:H,r_e:F,I_e:.05,x_l:0,y_l:0,phi_lDeg:j,q_l:M,r_ein:q,lensLightScale:W,gamma_1:G,gamma_2:J,x_sh:K.x_shs,y_sh:K.y_shs,M_200c:K.M_200cs,tau:new Array(50).fill(_.gc),hideSHs:re,noiseArray:be,noiseRange:5,sigma_n:le,maxFlux:he,lowFlux:-3,highFlux:ce,res:oe,nPix:pe,nPixFine:ge,range:me,canvasDim:de})),n.createElement(g.Z,{resampleSHs:function(){return ee((0,E.Af)(50))},hideSHs:re,toggleHideSHs:function(){return ne(!re)}}),n.createElement(p.Z,{phiDeg:j,q:M,r_ein:q,lensLight:0!==W,setPhiDeg:A,setQ:O,setRein:N,toggleLensLight:function(){return z(0===W?_.xY:0)}}),n.createElement(m.Z,{gamma_1:G,gamma_2:J,setGamma_1:Y,setGamma_2:Q})),xe=n.createElement("div",{style:{display:"flex",justifyContent:"center",flexDirection:"row"}},we,Ee);return n.createElement(o.Z,null,n.createElement("div",{style:{backgroundColor:"#232323"}},n.createElement("div",{style:{backgroundColor:"#FFFFFF",width:"880px",padding:"60px",margin:"auto"}},n.createElement("h1",null,"Probing dark matter with strong gravitational lensing"),xe,n.createElement("br",null),n.createElement("hr",null),_e)))}}}]);
//# sourceMappingURL=component---src-pages-interactive-lensing-tsx-da2865c0d1dc4ae52d9f.js.map