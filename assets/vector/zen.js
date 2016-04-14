/**
 * User: jeakeyliang
 * Date: 14-08-22
 * Time: 下午9:20
 */


;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(window.Zepto);

!function ($) {
	var _private = {};
	_private.cache = {};
	$.tpl = function (str, data, env) {
		// 判断str参数，如str为script标签的id，则取该标签的innerHTML，再递归调用自身
		// 如str为HTML文本，则分析文本并构造渲染函数
		var fn = !/[^\w\-\.:]/.test(str)
			? _private.cache[str] = _private.cache[str] || this.get(document.getElementById(str).innerHTML)
			: function (data, env) {
			var i, variable = [], value = []; // variable数组存放变量名，对应data结构的成员变量；value数组存放各变量的值
			for (i in data) {
				variable.push(i);
				value.push(data[i]);
			}
			return (new Function(variable, fn.code))
				.apply(env || data, value); // 此处的new Function是由下面fn.code产生的渲染函数；执行后即返回渲染结果HTML
		};

		fn.code = fn.code || "var $parts=[]; $parts.push('"
			+ str
			.replace(/\\/g, '\\\\') // 处理模板中的\转义
			.replace(/[\r\t\n]/g, " ") // 去掉换行符和tab符，将模板合并为一行
			.split("<%").join("\t") // 将模板左标签<%替换为tab，起到分割作用
			.replace(/(^|%>)[^\t]*/g, function(str) { return str.replace(/'/g, "\\'"); }) // 将模板中文本部分的单引号替换为\'
			.replace(/\t=(.*?)%>/g, "',$1,'") // 将模板中<%= %>的直接数据引用（无逻辑代码）与两侧的文本用'和,隔开，同时去掉了左标签产生的tab符
			.split("\t").join("');") // 将tab符（上面替换左标签产生）替换为'); 由于上一步已经把<%=产生的tab符去掉，因此这里实际替换的只有逻辑代码的左标签
			.split("%>").join("$parts.push('") // 把剩下的右标签%>（逻辑代码的）替换为"$parts.push('"
			+ "'); return $parts.join('');"; // 最后得到的就是一段JS代码，保留模板中的逻辑，并依次把模板中的常量和变量压入$parts数组

		return data ? fn(data, env) : fn; // 如果传入了数据，则直接返回渲染结果HTML文本，否则返回一个渲染函数
	};
	
}(window.Zepto);

/*! Tappy! - a lightweight normalized tap event. Copyright 2013 @scottjehl, Filament Group, Inc. Licensed MIT */
(function( w, $, undefined ){

  // handling flag is true when an event sequence is in progress (thx androood)
  w.tapHandling = false;
  var untap = function( $els ){
    return $els.off( ".fz.tap" );
  };
  var tap = function( $els ){
    return $els.each(function(){

      var $el = $( this ),
        resetTimer,
        startY,
        startX,
        cancel,
        scrollTolerance = 10;

      function trigger( e ){
        $( e.target ).trigger( "tap", [ e, $( e.target ).attr( "href" ) ] );
        e.stopPropagation();
      }

      function getCoords( e ){
        var ev = e.originalEvent || e,
          touches = ev.touches || ev.targetTouches;

        if( touches ){
          return [ touches[ 0 ].pageX, touches[ 0 ].pageY ];
        }
        else {
          return null;
        }
      }

      function start( e ){
        if( e.touches && e.touches.length > 1 || e.targetTouches && e.targetTouches.length > 1 ){
          return false;
        }

        var coords = getCoords( e );
        startX = coords[ 0 ];
        startY = coords[ 1 ];
      }

      // any touchscroll that results in > tolerance should cancel the tap
      function move( e ){
        if( !cancel ){
          var coords = getCoords( e );
          if( coords && ( Math.abs( startY - coords[ 1 ] ) > scrollTolerance || Math.abs( startX - coords[ 0 ] ) > scrollTolerance ) ){
            cancel = true;
          }
        }
      }

      function end( e ){
        clearTimeout( resetTimer );
        resetTimer = setTimeout( function(){
          w.tapHandling = false;
          cancel = false;
        }, 1000 );

        // make sure no modifiers are present. thx http://www.jacklmoore.com/notes/click-events/
        if( ( e.which && e.which > 1 ) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey ){
          return;
        }

        e.preventDefault();

        // this part prevents a double callback from touch and mouse on the same tap

        // if a scroll happened between touchstart and touchend
        if( cancel || w.tapHandling && w.tapHandling !== e.type ){
          cancel = false;
          return;
        }

        w.tapHandling = e.type;
        trigger( e );
      }

      $el
        .bind( "touchstart.fz.tap MSPointerDown.fz.tap", start )
        .bind( "touchmove.fz.tap MSPointerMove.fz.tap", move )
        .bind( "touchend.fz.tap MSPointerUp.fz.tap", end )
        .bind( "click.fz.tap", end );
    });
  };

  

  // use special events api
  if( $.event && $.event.special ){
    $.event.special.tap = {
      add: function( handleObj ) {
        tap( $( this ) );
      },
      remove: function( handleObj ) {
        untap( $( this ) );
      }
    };
  }
  else{
    // monkeybind
    var oldOn = $.fn.on,
      oldOff = $.fn.off;
    $.fn.on = function( evt ){
      if( /(^| )tap( |$)/.test( evt ) ){
        untap(this);
        tap( this );
      }
      return oldOn.apply( this, arguments );
    };
    $.fn.off = function( evt ){
      if( /(^| )tap( |$)/.test( evt ) ){
        untap( this );
      }
      return oldOff.apply( this, arguments );
    };
    
  }
  $.fn.tap=function(callback){
    this.on("tap",callback);
  }

}( this, Zepto ));
/**
 * User: jeakeyliang
 * Date: 14-08-22
 * Time: 下午9:20
 */

!function($){

	// 默认模板
	var _dialogTpl='<div class="ui-dialog">'+
        '<div class="ui-dialog-cnt">'+
            '<div class="ui-dialog-bd">'+
                '<div>'+
                '<h4><%=title%></h4>'+
                '<div><%=content%></div></div>'+
            '</div>'+
            '<div class="ui-dialog-ft ui-btn-group">'+
            	'<% for (var i = 0; i < button.length; i++) { %>' +
				'<% if (i == select) { %>' +
				'<button type="button" data-role="button"  class="select" id="dialogButton<%=i%>"><%=button[i]%></button>' +
				'<% } else { %>' +
				'<button type="button" data-role="button" id="dialogButton<%=i%>"><%=button[i]%></div>' +
				'<% } %>' +
				'<% } %>' +
            '</div>'+
        '</div>'+        
    '</div>';
	// 默认参数
	var defaults={
		title:'',
		content:'',
		button:['确认'],
		select:0,
		allowScroll:false,
		callback:function(){}
	}
	// 构造函数
	var Dialog   = function (el,option,isFromTpl) {
		console.log(option)
		this.option=$.extend(defaults,option);
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.button=$(el).find('[data-role="button"]');
		this._bindEvent();
		// this.toggle();
	}
	Dialog.prototype={
		_bindEvent:function(){
			var self=this;
			self.button.on("tap",function(){
				var index=$(self.button).index($(this));
				self.option.callback("button",index);
				self.hide.apply(self);
			});
		},
		toggle:function(){
			if(this.element.hasClass("show")){
				this.hide();
			}else{
				this.show();
			}
		},
		show:function(){
			var self=this;
			self.option.callback("show");
			self.element.addClass("show");
			this.option.allowScroll && self.element.on("touchmove" , _stopScroll);

		},
		hide :function () {
			var self=this;
			self.option.callback("hide");
			self.element.off("touchmove" , _stopScroll);
			self.element.removeClass("show");
			console.log(self._isFromTpl)
			self._isFromTpl&&self.element.remove();
		}
	}
	// 禁止冒泡
	function _stopScroll(){
		return false;
	}
	function Plugin(option) {

		var $this= this;
		// 获得配置信息
		var context=$.extend({}, defaults,  typeof option == 'object' && option);

		var isFromTpl=false;
		// 如果传入script标签的选择器
		if($.isArray(this) && this.length && $(this)[0].nodeName.toLowerCase()=="script"){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(this[0].innerHTML,context)).appendTo("body");
			isFromTpl=true;
		}
		// 如果传入模板字符串
		else if($.isArray(this) && this.length && $this.selector== ""){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(this[0].outerHTML,context)).appendTo("body");
			isFromTpl=true;
		}
		// 如果通过$.dialog()的方式调用
		else if(!$.isArray(this)){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(_dialogTpl,context)).appendTo("body");
			isFromTpl=true;
		}


		return $this.each(function () {
			var el = $(this);
			// 读取对象缓存
			var data  = el.data('fz.dialog');
			if (!data) el.data('fz.dialog', 
				(data = new Dialog(this,$.extend({}, defaults,  typeof option == 'object' && option),isFromTpl)
			));
			data.toggle();
			// if (typeof option == 'string') data[option].call($this);
		})
	}
	$.fn.dialog=$.dialog= Plugin;
}(window.Zepto)

/**
 * 地址参数获取
 */
!function($){
  $.params = function(){
    var a=window.location.href,
        b={},
        paramToJson = function(a){
          var b,c=a.split("&"),d=[],e={};
          for(b=0;b<c.length;b++){
            d=c[b].split("=");
            e[d[0]]=d[1];
          }
            return e;
        };

    return -1!=a.indexOf("?")&&(b=paramToJson(a.split("?")[1])),b;
  }
}(window.Zepto)

/**
 * 懒加载
 */
!function($){
    var w = window,
        $window = $(w),
        defaultOptions = {
            threshold                   : 0,
            failure_limit               : 0,
            event                       : 'scroll',
            effect                      : 'show',
            effect_params               : null,
            container                   : w,
            data_attribute              : 'original',
            skip_invisible              : true,
            appear                      : emptyFn,
            load                        : emptyFn,
            vertical_only               : false,
            minimum_interval            : 300,
            use_minimum_interval_in_ios : false,
            url_rewriter_fn             : emptyFn,
            no_fake_img_loader          : false,
            placeholder_data_img        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC',
            // for IE6\7 that does not support data image
            placeholder_real_img        : 'http://www.chforce.com/appframe/assets/img/placeholder.png'
        },
        isIOS = (/(?:iphone|ipod|ipad).*os/gi).test(navigator.appVersion),
        isIOS5 = isIOS && (/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion),
        type // function

    function emptyFn(){}

    type = (function(){
        var object_prototype_toString = Object.prototype.toString
        return function(obj){
            // todo: compare the speeds of replace string twice or replace a regExp
            return object_prototype_toString.call(obj).replace('[object ','').replace(']','')
        }
    })()

    function belowthefold($element, options){
        var fold
        if(options._$container == $window){
            fold = ('innerHeight' in w ? w.innerHeight : $window.height()) + $window.scrollTop()
        }else{
            fold = options._$container.offset().top + $(options.container).height()
        }
        return fold <= $element.offset().top - options.threshold
    }

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
                $element.trigger('_lazyload_appear')
                // if we found an image we'll load, reset the counter 
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

    // Remove image from array so it is not looped next time. 
    function getUnloadElements($elements){
        return $elements.filter(function(i,e){
            return !$elements.eq(i)._lazyload_loadStarted
        })
    }

    $.fn.lazyLoad = function(options){
        var $elements = this,
            $container,
            isScrollEvent,
            isScrollTypeEvent,
            scrollTimer = null,
            hasMinimumInterval

        if(!$.isPlainObject(options)){
            options = {}
        }

        // following params can be a string
        $.each(['threshold','failure_limit','minimum_interval'],function(i,e){
            if(type(options[e]) == 'String'){
                options[e] = parseInt(options[e],10)
            }
        })

        $.each(defaultOptions,function(k,v){
            if(defaultOptions.hasOwnProperty(k) && (!options.hasOwnProperty(k) || (type(options[k]) != type(defaultOptions[k])))){
                options[k] = v
            }
        })

        // Cache container as jQuery as object. 
        $container = options._$container = (!options.container || options.container == w) ? $window : $(options.container)
        delete options.container

        isScrollEvent = options.event == 'scroll'

        // isScrollTypeEvent. cantains custom scrollEvent . Such as 'scrollstart' & 'scrollstop'
        isScrollTypeEvent = isScrollEvent || options.event == 'scrollstart' || options.event == 'scrollstop'

        $elements.each(function(i,e){
            var element = this,
                $element = $elements.eq(i),
                placeholderSrc = $element.attr('src'),
                originalSrcInAttr = $element.attr('data-'+options.data_attribute), // `data-original` attribute value
                originalSrc = options.url_rewriter_fn == emptyFn?
                    originalSrcInAttr:
                    options.url_rewriter_fn.call(element,$element,originalSrcInAttr),
                isImg = $element.is('img')

            if($element._lazyload_loadStarted == true || placeholderSrc == originalSrc){
                $element._lazyload_loadStarted = true
                $elements = getUnloadElements($elements)
                return
            }

            $element._lazyload_loadStarted = false

            // If element is an img and no src attribute given, use placeholder. 
            if(isImg && !placeholderSrc){
                // For browsers that do not support data image.
                $element.one('error',function(){ // `on` -> `one` : IE6 triggered twice error event sometimes
                    $element.attr('src',options.placeholder_real_img)
                }).attr('src',options.placeholder_data_img)
            }
            
            // When appear is triggered load original image. 
            $element.one('_lazyload_appear',function(){
                var effectParamsIsArray = $.isArray(options.effect_params),
                    effectIsNotImmediacyShow
                function loadFunc(){
                    // In most situations, the effect is immediacy show, at this time there is no need to hide element first
                    // Hide this element may cause css reflow, call it as less as possible
                    if(effectIsNotImmediacyShow){
                        // todo: opacity:0 for fadeIn effect
                        $element.hide()
                    }
                    if(isImg){
                        $element.attr('src', originalSrc)
                    }else{
                        $element.css('background-image','url("' + originalSrc + '")')
                    }
                    if(effectIsNotImmediacyShow){
                        $element[options.effect].apply($element,effectParamsIsArray?options.effect_params:[])
                    }
                    $elements = getUnloadElements($elements)
                }
                if(!$element._lazyload_loadStarted){
                    effectIsNotImmediacyShow = (options.effect != 'show' && $.fn[options.effect] && (!options.effect_params || (effectParamsIsArray && options.effect_params.length == 0)))
                    if(options.appear != emptyFn){
                        options.appear.call(element, $elements.length, options)
                    }
                    $element._lazyload_loadStarted = true
                    if(options.no_fake_img_loader){
                        if(options.load != emptyFn){
                            $element.one('load',function(){
                                options.load.call(element, $elements.length, options)
                            })
                        }
                        loadFunc()
                    }else{
                        $('<img />').one('load', function(){ // `on` -> `one` : IE6 triggered twice load event sometimes
                            loadFunc()
                            if(options.load != emptyFn){
                                options.load.call(element, $elements.length, options)
                            }
                        }).attr('src',originalSrc)
                    }
                }
            })

            // When wanted event is triggered load original image 
            // by triggering appear.                              
            if (!isScrollTypeEvent){
                $element.on(options.event, function(){
                    if (!$element._lazyload_loadStarted){
                        $element.trigger('_lazyload_appear')
                    }
                })
            }
        })

        // Fire one scroll event per scroll. Not one scroll event per image. 
        if(isScrollTypeEvent){
            hasMinimumInterval = options.minimum_interval != 0
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

        // Check if something appears when window is resized. 
        // Force initial check if images should appear when window onload. 
        $window.on('resize load', function(){
            checkAppear($elements, options)
        })
              
        // With IOS5 force loading images when navigating with back button. 
        // Non optimal workaround. 
        if(isIOS5){
            $window.on('pageshow', function(e){
                if(e.originalEvent && e.originalEvent.persisted){
                    $elements.trigger('_lazyload_appear')
                }
            })
        }

        // Force initial check if images should appear. 
        $(function(){
            checkAppear($elements, options)
        })
        
        return this
    }
}(window.Zepto);