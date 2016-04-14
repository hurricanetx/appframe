/*
 * author：CHurricane
 * usage：无限加载内容
 */
;(function($){
    'use strict';
    $.fn.dataloader = function(options,callback){
        var w = window,
        $window = $(w),
        $elements=this,
        $container,
        options = $.extend({}, {
            threshold : 0,
            container : w,
            failure_limit : 0,
            vertical_only : true,
            skip_invisible : true,
            hasMinimumInterval : 0,
            event : 'scroll'
        }, options),
        isIOS = (/(?:iphone|ipod|ipad).*os/gi).test(navigator.appVersion),
        isIOS5 = isIOS && (/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion);
        function emptyFn(){};
        //页面底部触发更新
        function belowthefold($element, options){
            var fold
            if(options._$container == $window){
                fold = ('innerHeight' in w ? w.innerHeight : $window.height()) + $window.scrollTop()
            }else{
                fold = options._$container.offset().top + $(options.container).height()
            }
            return fold <= $element.offset().top - options.threshold
        }
        //页面右边触发更新
        function rightoffold($element, options){
            var fold
            if(options._$container == $window){
                // Zepto do not support `$window.scrollLeft()` yet.
                fold = $window.width() + ($.fn.scrollLeft?$window.scrollLeft():w.pageXOffset)
            }else{
                fold = options._$container.offset().left + $(options.container).width()
            }
            return fold <= $element.offset().left - options.threshold
        }
        //页面顶部触发更新
        function abovethetop($element, options){
            var fold
            if(options._$container == $window){
                fold = $window.scrollTop()
            }else{
                fold = options._$container.offset().top
            }
            // console.log('abovethetop fold '+ fold)
            // console.log('abovethetop $element.height() '+ $element.height())
            return fold >= $element.offset().top + options.threshold  + $element.height()
        }
        //页面左边触发更新
        function leftofbegin($element, options){
            var fold
            if(options._$container == $window){
                // Zepto do not support `$window.scrollLeft()` yet.
                fold = $.fn.scrollLeft?$window.scrollLeft():w.pageXOffset
            }else{
                fold = options._$container.offset().left
            }
            return fold >= $element.offset().left + options.threshold + $element.width()
        }
        function checkAppear($elements, options){
            var counter = 0
            $elements.each(function(i,e){
                var $element = $elements.eq(i)
                if(options.skip_invisible &&
                !($element.width() || $element.height()) && $element.css("display") !== "none"){
                    return
                }
                function appear(){
                    $element.trigger('_dataloader_appear');
                    // 加载中
                    counter = 0
                }
                // If vertical_only is set to true, only check the vertical to decide appear or not
                // In most situations, page can only scroll vertically, set vertical_only to true will improve performance
                if(options.vertical_only){
                    if(abovethetop($element, options)){
                        // Nothing. 
                    }else if(!belowthefold($element, options)){
                        appear()
                    }else{
                        if(++counter > options.failure_limit){
                            return false
                        }
                    }
                }else{
                    if(abovethetop($element, options) || leftofbegin($element, options)){
                        // Nothing. 
                    }else if(!belowthefold($element, options) && !rightoffold($element, options)){
                        appear()
                    }else{
                        if(++counter > options.failure_limit){
                            return false
                        }
                    }
                }
            })
        }

        var defaultSuccess = function(ele){
            var url = ele._href+ele._param;
            // console.log(ele._dataloader_loadStarted);
            if(!ele._dataloader_loadStarted){
                //显示加载中的动画
                ele._defaultText = ele.html();
                ele.addClass("ui-loading-wrap").html('<p>加载中</p><i class="ui-loading"></i>');
                //加载中，标记为不可触发状态
                ele._dataloader_loadStarted = true;
                $.get(url, function(data){
                    data = $.parseJSON(data);
                    if(data.code == -1){
                        ele.removeClass("ui-loading-wrap").html(data.message);
                        //将不再触发加载
                        ele._dataloader_loadStarted = true;
                        ele.off('_dataloader_appear');
                        return;
                    }else{
                        //序列化内容
                        ele.before($.tpl($("#"+ele._tpl).html(),data));
                        if(callback) callback();
                        //增加页码
                        if(!ele._method) ele.data("param",ele._param++);
                        else ele.data("param",ele._method(ele._param));
                        //加载完毕，重置为可触发状态
                        ele.removeClass("ui-loading-wrap").html(ele._defaultText);
                        ele._dataloader_loadStarted = false;
                    }
                });
            }
        }

        // Cache container as jQuery as object. 
        $container = options._$container = (!options.container || options.container == w) ? $window : $(options.container)
        delete options.container
        var isScrollEvent = options.event == 'scroll';
        // isScrollTypeEvent. cantains custom scrollEvent . Such as 'scrollstart' & 'scrollstop'
        var isScrollTypeEvent = isScrollEvent || options.event == 'scrollstart' || options.event == 'scrollstop';

        if(isScrollTypeEvent){
            var hasMinimumInterval = options.minimum_interval != 0,scrollTimer = null;
            $container.on(options.event, function(){
                // desktop and Android device triggered many times `scroll` event in once user scrolling
                if(isScrollEvent && hasMinimumInterval && (!isIOS || options.use_minimum_interval_in_ios)){
                    if(!scrollTimer){
                        scrollTimer = setTimeout(function(){
                            checkAppear($elements, options)
                            scrollTimer = null
                        },options.minimum_interval) // only check once in 300ms
                    }
                }else{
                    return checkAppear($elements, options)
                }
            })
        }
        
        $elements.each(function(i,e){
            var element = this,
                $element = $elements.eq(i);

            if($element._dataloader_loadStarted != true){
                $element._dataloader_loadStarted = false
            }

            $element._href = $element.data("href"),
            $element._param = $element.data("param"),
            $element._method = $element.data("method");
            $element._tpl = $element.data("tpl");
            $element._load = defaultSuccess;
            $element.on('_dataloader_appear',function(){
                //开始处理,传递节点元素
                $element._load($element);
            });
                           
            if (!isScrollTypeEvent){
                $element.on(options.event, function(){
                    if (!$element._dataloader_loadStarted){
                        $element.trigger('_dataloader_appear');
                    }
                })
            }
        });

        $window.on('resize load', function(){
            checkAppear($elements, options)
        })

        this.tap(function(){
            checkAppear($elements, options)
        });

        // With IOS5 force loading images when navigating with back button. 
        // Non optimal workaround. 
        if(isIOS5){
            $window.on('pageshow', function(e){
                if(e.originalEvent && e.originalEvent.persisted){
                    $elements.trigger('_dataloader_appear')
                }
            })
        }
        
        return this;
    }
})(window.Zepto);