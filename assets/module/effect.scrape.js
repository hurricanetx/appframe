/*
 * author：CHurricane
 * 刮开图层
 */
;(function($) {
    'use strict';
    $.fn.scrape = function(options,callback){
        var $elements = this;
        $elements.node = document.getElementById(this.selector.replace("#",""));
        options = $.extend({}, {
            cover : "#ccc",
            coverType : 'color', //image,color
            width : this.width() || 300,
            height: this.height() || 100,
            lottery : null,
            background : null,
            mask: null, //mask canvas
            type : 'image' //image,text
        }, options);
        function createElement(tagName, attributes) {
            var ele = document.createElement(tagName);
            for (var key in attributes) {
                ele.setAttribute(key, attributes[key]);
            }
            return ele;
        };
        function getTransparentPercent(ctx, width, height) {
            var imgData = ctx.getImageData(0, 0, width, height),
                pixles = imgData.data,
                transPixs = [];
            for (var i = 0, j = pixles.length; i < j; i += 4) {
                var a = pixles[i + 3];
                if (a < 128) {
                    transPixs.push(i);
                }
            }
            return (transPixs.length / (pixles.length / 4) * 100).toFixed(2);
        };
        function resizeCanvas(canvas, width, height) {
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').clearRect(0, 0, width, height);
        };
        function drawPoint(x, y) {
            options.maskCtx.beginPath();
            var radgrad = options.maskCtx.createRadialGradient(x, y, 0, x, y, 30);
            radgrad.addColorStop(0, 'rgba(0,0,0,0.6)');
            radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            options.maskCtx.fillStyle = radgrad;
            options.maskCtx.arc(x, y, 30, 0, Math.PI * 2, true);
            options.maskCtx.fill();
            if (callback) {
                callback.call(null, getTransparentPercent(options.maskCtx, options.width, options.height));
            }
        };
        function bindEvent() {
            var device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
            var clickEvtName = device ? 'touchstart' : 'mousedown';
            var moveEvtName = device? 'touchmove': 'mousemove';
            if (!device) {
                var isMouseDown = false;
                $elements.on('mouseup', function(e) {
                    isMouseDown = false;
                }, false);
            } else {
                $elements.on("touchmove", function(e) {
                    if (isMouseDown) {
                        e.preventDefault();
                    }
                }, false);
                $elements.on('touchend', function(e) {
                    isMouseDown = false;
                }, false);
            }
            options.mask.addEventListener(clickEvtName, function (e) {
                isMouseDown = true;
                var docEle = document.documentElement;
                if (!options.clientRect) {
                    options.clientRect = {
                        left: 0,
                        top:0
                    };
                }
                var x = (device ? e.touches[0].clientX : e.clientX) - options.clientRect.left + docEle.scrollLeft - docEle.clientLeft;
                var y = (device ? e.touches[0].clientY : e.clientY) - options.clientRect.top + docEle.scrollTop - docEle.clientTop;
                drawPoint(x, y);
            }, false);

            options.mask.addEventListener(moveEvtName, function (e) {
                if (!device && !isMouseDown) {
                    return false;
                }
                var docEle = document.documentElement;
                if (!options.clientRect) {
                    options.clientRect = {
                        left: 0,
                        top:0
                    };
                }
                var x = (device ? e.touches[0].clientX : e.clientX) - options.clientRect.left + docEle.scrollLeft - docEle.clientLeft;
                var y = (device ? e.touches[0].clientY : e.clientY) - options.clientRect.top + docEle.scrollTop - docEle.clientTop;
                drawPoint(x, y);
            }, false);
        };
        function drawLottery() {
            options.background = options.background || createElement('canvas', {
                style: 'position:absolute;left:0;top:0;'
            });
            options.backCtx = null;
            options.mask = options.mask || createElement('canvas', {
                style: 'position:absolute;left:0;top:0;'
            });
            options.maskCtx = null;
            options.clientRect = null;
            // console.log($elements);
            if (!$elements.html().replace(/[\w\W]| /g, '')) {
                $elements.append(options.background);
                $elements.append(options.mask);
                // console.log($elements.node.getBoundingClientRect());
                options.clientRect = $elements.node ? $elements.node.getBoundingClientRect() : null;
                bindEvent();
            }

            options.backCtx = options.backCtx || options.background.getContext('2d');
            options.maskCtx = options.maskCtx || options.mask.getContext('2d');

            if (options.type == 'image') {
                var image = new Image();
                image.onload = function () {
                    resizeCanvas(options.background, options.width, options.height);
                    options.backCtx.drawImage(this, 0, 0);
                    drawMask();
                };
                image.src = options.lottery;
            } else if (options.type == 'text') {
                resizeCanvas(options.background, options.width, options.height);
                options.backCtx.save();
                options.backCtx.fillStyle = '#FFF';
                options.backCtx.fillRect(0, 0, options.width, options.height);
                options.backCtx.restore();
                options.backCtx.save();
                var fontSize = 30;
                options.backCtx.font = 'Bold ' + fontSize + 'px Arial';
                options.backCtx.textAlign = 'center';
                options.backCtx.fillStyle = '#F60';
                options.backCtx.fillText(options.lottery, options.width / 2, options.height / 2 + fontSize / 2);
                options.backCtx.restore();
                drawMask();
            }
        };
        function drawMask() {
            resizeCanvas(options.mask, options.width, options.height);
            if (options.coverType == 'color') {
                options.maskCtx.fillStyle = options.cover;
                options.maskCtx.fillRect(0, 0, options.width, options.height);
                options.maskCtx.globalCompositeOperation = 'destination-out';
            } else if (options.coverType == 'image'){
                var image = new Image(),
                    _this = this;
                image.onload = function () {
                    _this.maskCtx.drawImage(this, 0, 0);
                    _this.maskCtx.globalCompositeOperation = 'destination-out';
                }
                image.src = options.cover;
            }
        };
        this.update = function(lottery,type){
            options.lottery = lottery;
            options.type = type;
            drawLottery();
        };
        drawLottery();
        return this;
    }
})(window.Zepto);