/*
 * author：CHurricane
 * usage：1. 为zen框架添加自适应的顶部导航条
 *        2. app下载探针，在被第三方平台微信、QQ、微博等场景中下载被阻断时，对用户进行引导
 *        3. 自动识别微信场景，并且优先使用微信图片预览
 *        4. 自动在微信场景增加，分享布局，实现分享控制
 * usage：
 */
;(function($){
    'use strict';
    $.fn.autoapp = function(options,callback){
        var self=this,
        opts = $.extend({}, {
            navbar: ".ui-page-navbar",
            toolbar: ".ui-page-toolbar",
            view: "body",
            navbarThrough: "ui-navbar-through",
            toolbarThrough: "ui-toolbar-through",
            app : {
                ios: {
                    url:null,
                    enter: null
                },
                android: {
                    url:null,
                    myapp:null,
                    enter: null
                },
                btn : null,         //导航按钮
                insetBtn: null      //内链按钮
            },web :{
                mobile: null,
                web: null
            },mode : false //false 不显示渠道,true 就算该渠道没有下载地址仍显示
        }, options);

        var detectapp = {
            appver : navigator.appVersion,
            app: {
                ios: !! navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: navigator.userAgent.indexOf('Android') > -1, //android终端
                weixin: navigator.userAgent.indexOf('MicroMessenger') > -1, //是否为微信应用
                weibo: navigator.userAgent.indexOf('Weibo') > -1, //是否为微博应用
                qq: navigator.userAgent.indexOf('QQ') >-1, //是否为QQ应用
                pengsi: navigator.userAgent.indexOf('Pengsi') >-1 //是否为捧丝儿
            },
            language: (navigator.browserLanguage || navigator.language).toLowerCase(),
            inapp: false
        };(function(){
            detectapp.inapp = detectapp.app.weixin || detectapp.app.weibo || detectapp.app.qq || detectapp.app.pengsi;
        })();

        //自动解析，点击事件
        $(".ui-tapable").tap(function(){
            $("<a />").attr("href",$(this).data("target")).click();
        });
        
        //自动控制导航条
        (function autoNavbar(){
            // if(detectapp.app.weixin) alert("你在weixin中");
            // else if(detectapp.app.weibo) alert("你在weibo中");
            // else if(detectapp.app.qq) alert("你在qq中");
            // else if(detectapp.app.pengsi) alert("你在pengsi中");
            // else if(detectapp.inapp) alert("你在第三方应用中:"+detectapp.inapp);
            // else alert("你在浏览器中");
            if(!detectapp.inapp && opts.navbar){
                //show navbar and extend page height
                $(opts.navbar).show();
                $(opts.view).addClass(opts.navbarThrough);
            }
        })();
        //禁用 或者 隐藏按钮
        function disableBtn(){
            if(opts.mode) {
                $(opts.app.btn).html('敬请期待').addClass("disabled");
                $(opts.app.insetBtn).html('APP开发中，敬请期待').addClass("disabled");
            }else {
                $(opts.toolbar).hide();
                $(opts.view).removeClass(opts.toolbarThrough);
                $(opts.app.insetBtn).hide();
            }
            //为内链元素创建
        }
        //在app中自动创建app下载模式
        (function autoAppdown(){
            if(!detectapp.app.pengsi && opts.app.btn && (detectapp.app.ios || detectapp.app.android)){
                //不在捧丝儿中，显示下载渠道
                $(opts.toolbar).show();
                $(opts.view).addClass(opts.toolbarThrough);

                var _url;
                //根据不同的系统完成工作
                if(detectapp.app.ios){
                    _url = opts.app.ios;
                }else if(detectapp.app.android){
                    _url = opts.app.android;
                }
                //如果对应平台没有合适的安装包,Android平台在应用宝没有app也会隐藏
                if(_url.url == null || (detectapp.app.android && _url.myapp == null)){
                    disableBtn();
                }else
                    //添加触发事件
                    $(opts.app.btn+","+opts.app.insetBtn).tap(function(){
                        if(detectapp.app.weixin){
                            //微信,显示app被限制
                            var isappinstalled = $.params().isappinstalled || !1;
                            var jump = [
                                "http://www.chforce.com/302.php?path=",
                                "http://m.laiwang.com/market/laiwang/302jump.php?path="
                            ];
                            var weixinjump = "http://mp.weixin.qq.com/mp/redirect?url=";
                            if(isappinstalled){//应用宝，app呼叫
                                $("<a />").attr("href",_url.enter).click();
                            }else if(detectapp.app.ios){
                                //ios 可直接穿透
                                $("<a />").attr("href",weixinjump+jump[0]+_url.url).click();
                            }else if(_url.myapp){
                                //Android 以后可接入应用宝下载,http://down.myapp.com/然后穿透
                                $("<a />").attr("href",weixinjump+jump[0]+_url.myapp).click();
                            }
                        }else{
                            $("<a />").attr("href",_url.enter).click().attr("href",_url.url).click();
                        }  
                    });
            }
        })();
    }
})(window.Zepto);