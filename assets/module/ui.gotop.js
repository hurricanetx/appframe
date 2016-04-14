/*
 * author：CHurricane
 * usage：GoTop
 */
;(function($) {
    'use strict';
  var DEFAULTS = {
    endY: (navigator.userAgent.indexOf('Android') > -1) ? 1 : 0,
    duration: 200,
    updateRate: 15
  };

  var interpolate = function (source, target, shift) {
    return (source + (target - source) * shift);
  };

  var easing = function (pos) {
    return (-Math.cos(pos * Math.PI) / 2) + .5;
  };

  var scroll = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      window.scrollTo(0, options.endY);
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = window.pageYOffset,
        startT = Date.now(),
        finishT = startT + options.duration;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      window.scrollTo(0, interpolate(startY, options.endY, easing(shift)));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  var scrollNode = function(settings) {
    var options = $.extend({}, DEFAULTS, settings);

    if (options.duration === 0) {
      this.scrollTop = options.endY;
      if (typeof options.callback === 'function') options.callback();
      return;
    }

    var startY = this.scrollTop,
        startT = Date.now(),
        finishT = startT + options.duration,
        _this = this;

    var animate = function() {
      var now = Date.now(),
          shift = (now > finishT) ? 1 : (now - startT) / options.duration;

      _this.scrollTop = interpolate(startY, options.endY, easing(shift));

      if (now < finishT) {
        setTimeout(animate, options.updateRate);
      }
      else {
        if (typeof options.callback === 'function') options.callback();
      }
    };

    animate();
  };

  $.scrollTo = scroll;

  $.fn.scrollTo = function() {
    if (this.length) {
      var args = arguments;
      this.forEach(function(elem, index) {
        scrollNode.apply(elem, args);
      });
    }
  };
}(Zepto));
;(function($){
    'use strict';
    $.fn.gotop = function(options){
        var defaults = {
            showPixels:'',          //滚动条滚动高度单位px(可选)，若不设置默认以当前浏览器窗口高度   
            scrollSpeed:0,          //滚动条上升速度
            showDelay:500,          //动画时长
            debug:false,            //是否开启调试状态
            bottom: 10,           //距离底部多少
            callback:function(){ return true; }
        }
        var options = $.extend(defaults,options);
        var isExists = $(this).length==0?false:true;
        var isAnimate = $.animate!==undefined;
        if(isExists===true){
            var node = $(this); node.addClass("ui-gotop").hide().css({'cursor':'pointer',bottom:options.bottom}).append("<div/>");
            options.showPixels = options.showPixels==''?$(window).height():parseInt(options.showPixels);
            node.bind('click',function(){
                (isAnimate)?$('html, body').animate({ 
                    scrollTop: 0 
                 }, options.scrollSpeed==0?0:options.scrollSpeed):$('html,body').scrollTo({endY: 0,duration:options.showDelay});

            })
            $(window).scroll(function(){
                if( $(window).scrollTop() >= options.showPixels )
                    (options.showDelay==0 || options.showDelay==false || !isAnimate)?node.show():node.animate({opacity: 1}, options.showDelay, 'ease-in');
                else
                    (options.showDelay==0 || options.showDelay==false || !isAnimate)?node.hide():node.animate({opacity: 0}, options.showDelay, 'ease-out');
                options.callback.apply(this,['true']);
            })
        }else if(options.debug===true){
            alert('Dom Node Not Exists!');
            options.callback.apply(this,['false']);
        }
    }
})(window.Zepto);