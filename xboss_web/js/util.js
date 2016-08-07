/**
 * 
 * @authors zhaofan@xinguodu.com
 * @date    2016-06-12 19:05:32
 * @version $Id$
 */

var util = function() {};

var hasTouch = 'ontouchstart' in window,
    EV = 'click', //'touchstart'
    PAGE_SIZE = 20;

util.query = function(params, callback) {
    var url = params.url,
        wrapId = params.dataWrapId || "dataWrapper",
        tplId = params.tplId,
        pullUpId = params.pullUpId || "pullUp",
        iScroll = params.iScroll,
        indexRequired = params.indexRequired;
    delete params.id, delete params.dataWrapId, delete params.tplId, delete params.pullUpId, delete params.pullDownId;
    delete params.url, delete params.pullUpAction, delete params.pullDownAction, delete params.iScroll, delete params.indexRequired;
    $.ajax({
        url: url,
        type: "POST",
        data: params,
        dataType: "json",
        beforeSend: function() {
            params.pageIndex == 1 && util.loadingToast();
        },
        success: function(data) {
            util.removeToast();
            if (data && (data.code == 200 || data.rtnCode == 200)) {
                var html = "",
                    tpl = $("#" + tplId).html();
                data.data && data.data.forEach(function(item, index) {
                    indexRequired && (item["index"] = (params.pageIndex - 1) * params.pageSize + index + 1);
                    html += tpl.format(item);
                });
                params.pageIndex == 1 ? $("#" + wrapId).html(html) : $("#" + wrapId).append(html);
                $("#" + wrapId).data("pageIndex", params.pageIndex);
                !+data.totalPage || data.totalPage == 1 || params.pageIndex == data.totalPage ? $("#" + pullUpId).addClass("dn") : $("#" + pullUpId).removeClass("dn");

                iScroll && iScroll.refresh();
                callback && callback(data.data);
            } else {
                util.dialog({ info: data.msg || data.rtnMsg });
            }
        },
        error: function() {
            util.dialog({ info: "服务器异常，请稍候重试！" });
        }
    });
};

util.wxUploadImage = function(wx, opts, fnSuccess, fnFailure) {
    opts = $.extend({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有);
    }, opts || {});

    wx.chooseImage({
        count: opts.count,
        sizeType: opts.sizeType,
        sourceType: opts.sourceType,
        success: function(res) {
            var images = {
                localId: [],
                serverId: []
            };
            images.localId = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
            //alert('已选择 ' + res.localIds.length + ' 张图片');

            if (images.localId.length == 0) {
                alert('请先使用 chooseImage 接口选择图片');
                return;
            }
            // 上传图片
            var i = 0,
                length = images.localId.length;

            function upload() {
                wx.uploadImage({
                    localId: images.localId[i],
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function(res) {
                        i++;
                        //alert('已上传：' + i + '/' + length);
                        images.serverId.push(res.serverId);
                        fnSuccess && fnSuccess(localId, res.serverId);

                        if (i < length) {
                            upload();
                        }
                    },
                    fail: function(res) {
                        alert(JSON.stringify(res));
                        fnFailure && fnFailure(res);
                    }
                });
            }
            upload();
        }
    });
};

/**
 * 合并图片
 * @param  {[type]}   dataList 要合并的图片列表
 * @param  {[type]}   width    [description]
 * @param  {[type]}   height   [description]
 * @param  {Function} fn       [description]
 * @return {String}   合并后生成的base64编码
 */
util.compose = function(dataList, width, height, fn) {
    var c = document.createElement('canvas'),
        ctx = c.getContext('2d'),
        len = dataList.length,
        base64;
    c.width = width;
    c.height = height;
    ctx.rect(0, 0, c.width, c.height);
    ctx.fillStyle = '#fff';
    ctx.fill();

    function draw(n) {
        if (n < len) {
            var img = new Image;
            //img.crossOrigin = 'Anonymous'; //解决跨域
            img.src = data[n].url;
            img.onload = function() {
                ctx.drawImage(img, dataList[n].offsetX, dataList[n].offsetY, img.width, img.height);
                img = null;
                draw(n + 1); //递归
            }
        } else {
            //保存生成图片
            base64 = c.toDataURL("image/jpeg", 0.8);
            c = null;
            fn(base64);
        }
    }
    draw(0);
};

util.initIScroll = function(opts) {
    var myScroll,
        opts = opts || {},
        pullDownEl, pullDownOffset,
        pullUpEl, pullUpOffset,
        generatedCount = 0;

    var pullDownAction = opts.pullDownAction || function() {
            myScroll.refresh();
        },
        pullUpAction = opts.pullUpAction || function() {
            myScroll.refresh();
        };

    //初始化绑定iScroll控件 
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);

    pullDownEl = $('#' + (opts['pullDownId'] || 'pullDown'));
    pullDownEl = pullDownEl.length && pullDownEl[0];
    pullDownOffset = pullDownEl && pullDownEl.offsetHeight;
    pullUpEl = $('#' + (opts['pullUpId'] || 'pullUp'))[0];
    pullUpOffset = pullUpEl.offsetHeight;

    /**
     * 初始化iScroll控件
     */
    var wrapId = opts['id'] || 'wrapper',
        dataWrapId = opts['dataWrapId'] || 'dataWrapper',
        wrap = $("#" + wrapId),
        parentWrap = wrap.parents(".tab_wrap"),
        // 隐藏元素不能获取其准确位置
        bHidden = parentWrap.hasClass("dn");
    bHidden && parentWrap.removeClass("dn");

    var offsetTop = wrap.position().top;
    wrap.css({
        position: "absolute",
        left: 0,
        top: offsetTop + "px",
        bottom: 0,
        width: "100%"
    });
    bHidden && parentWrap.addClass("dn");

    myScroll = new iScroll(wrapId, {
        vScrollbar: false,
        topOffset: pullDownOffset || 0,
        onRefresh: function() {
            if (pullDownEl && pullDownEl.className.match('loading')) {
                $(pullDownEl).removeClass('loading');
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
            } else if (pullUpEl.className.match('loading')) {
                $(pullUpEl).removeClass('loading');
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
            }
        },
        onScrollMove: function() {
            if (this.y > 5 && pullDownEl && !pullDownEl.className.match('flip')) {
                $(pullDownEl).addClass('flip');
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手开始更新...';
                this.minScrollY = 0;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                if ($(pullUpEl).hasClass('dn')) return;
                $(pullUpEl).addClass('flip');
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '松手开始更新...';
            }
        },
        onScrollEnd: function() {
            if (pullDownEl && pullDownEl.className.match('flip')) {
                $(pullDownEl).removeClass('flip').addClass('loading');
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';
                pullDownAction(1);
            } else if (pullUpEl.className.match('flip')) {
                $(pullUpEl).removeClass('flip').addClass('loading');
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';
                var pageIndex = $("#" + dataWrapId).data("pageIndex") || 1;
                pullUpAction(++pageIndex);
            }
        }
    });
    return myScroll;
};

util.showActionSheet = function(fnOk) {
    var mask = $('#mask');
    var weuiActionsheet = $('#weui_actionsheet');
    weuiActionsheet.addClass('weui_actionsheet_toggle');
    mask.show()
        .focus() //加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
        .addClass('weui_fade_toggle').one('click', function() {
            util.hideActionSheet();
        });

    $('#actionsheet_cancel').one('click', function() {
        fnOk && fnOk();
        util.hideActionSheet();
    });

    mask.unbind('transitionend').unbind('webkitTransitionEnd');
};

util.hideActionSheet = function() {
    var mask = $('#mask');
    var weuiActionsheet = $('#weui_actionsheet');
    weuiActionsheet.removeClass('weui_actionsheet_toggle');
    mask.removeClass('weui_fade_toggle');
    mask.on('transitionend', function() {
        mask.hide();
    }).on('webkitTransitionEnd', function() {
        mask.hide();
    })
};

util.dialog = function(opts) {
    var html = '<div class="weui_dialog_confirm" id="dialog">' +
        '<div class="weui_mask"></div>' +
        '<div class="weui_dialog">' +
        '<div class="weui_dialog_hd"><strong class="weui_dialog_title">' + (opts.title || '提示') + '</strong></div>' +
        '<div class="weui_dialog_bd">' + opts.info + '</div>' +
        '<div class="weui_dialog_ft">' +
        (opts.cancel ? '<a href="javascript:;" class="weui_btn_dialog default">取消</a>' : '') +
        '<a href="javascript:;" class="weui_btn_dialog primary">确定</a>' +
        '</div>' +
        '</div>' +
        '</div>';

    var $html = $(html);
    $html.on(EV, ".weui_btn_dialog.default", function() {
        opts.cancelCb && opts.cancelCb();
        $("#dialog").remove();
    }).on(EV, ".weui_btn_dialog.primary", function() {
        opts.okCb && opts.okCb();
        $("#dialog").remove();
    });

    $("body").append($html);
};

util.toast = function(content) {
    var html = '<div id="toast">' +
        '<div class="weui_mask_transparent"></div>' +
        '<div class="weui_toast">' +
        '<i class="weui_icon_toast"></i>' +
        '<p class="weui_toast_content">' + content + '</p>' +
        '</div>' +
        '</div>';
    $("body").append(html);
    setTimeout(function() {
        $('#toast').remove();
    }, 2000);
}

util.loadingToast = function() {
    var html = '<div id="loadingToast" class="weui_loading_toast">' +
        '<div class="weui_mask_transparent"></div>' +
        '<div class="weui_toast">' +
        '<div class="weui_loading">' +
        '<div class="weui_loading_leaf weui_loading_leaf_0"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_1"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_2"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_3"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_4"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_5"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_6"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_7"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_8"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_9"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_10"></div>' +
        '<div class="weui_loading_leaf weui_loading_leaf_11"></div>' +
        '</div>' +
        '<p class="weui_toast_content">数据加载中</p>' +
        '</div>' +
        '</div>';
    $("body").append(html);
}

util.removeToast = function() {
    $('#toast, #loadingToast').remove();
};

util.strLen = function(str) {
    return (str || "").replace(/[^\x00-\xff]/g, "00").length;
};

util.formatBankCard = function(input, replace) {
    input = input.replace(/\s/g, "");
    if (replace) {
        return input.substring(0, 6) + '*****' + input.substring(input.length - 4);
    }
    return input.replace(/(\d{4})(?!$)/g, "$1 ");
};

util.isValidId = function(id) {
    return /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/.test(id);
};

util.isValidMobile = function(mobile) {
    return /^1[34578]\d{9}$/.test(mobile);
};

util.queryToJson = function(url) {
    var query = url.substr(url.lastIndexOf('?') + 1),
        params = query.split('&'),
        len = params.length,
        result = {},
        i = 0,
        key, value, item, param;

    for (; i < len; i++) {
        if (!params[i]) {
            continue;
        }
        param = params[i].split('=');
        key = param[0];
        value = param[1];

        item = result[key];
        if ('undefined' == typeof item) {
            result[key] = value;
        } else if (isArray(item)) {
            item.push(value);
        } else { // 这里只可能是string了  
            result[key] = [item, value];
        }
    }

    return result;
};

//Array.forEach implementation for IE support..
//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
Array.prototype.forEach || (Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this == null) {
        throw new TypeError(" this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32
    if ({}.toString.call(callback) != "[object Function]") {
        throw new TypeError(callback + " is not a function");
    }
    if (thisArg) {
        T = thisArg;
    }
    k = 0;
    while (k < len) {
        var kValue;
        if (k in O) {
            kValue = O[k];
            callback.call(T, kValue, k, O);
        }
        k++;
    }
});

/**
 * 日期格式化
 * @param  {[type]} format [description]
 * @return {[type]}        [description]
 */
Date.prototype.format = function(format) {
    format = format || "yyyy-MM-dd";
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

String.prototype.format = function(args) {
    var reg,
        result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof(args) == "object") {
            for (var key in args) {
                reg = new RegExp("({{" + key + "}})", "g");
                result = result.replace(reg, args[key] || "");
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                reg = new RegExp("({{)" + i + "(}})", "g");
                result = result.replace(reg, arguments[i] || "");
            }
        }
    }
    return result;
};
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
/**
 * 获取某个月份的天数
 * @param  {Number} iYear  [description]
 * @param  {Number} iMonth [description]
 * @return {Number}        天数
 */
function getDaysInMonth(iYear, iMonth) {
    return new Date(iYear || (new Date).getFullYear(), iMonth, 0).getDate();
}

/**
 * 根据结束日期和差值获取目标日期
 * @param  {Number} diff 差值 - 天数，每月固定按30天算
 * @param  {Date} minDate  约束日期的最小值
 * @param  {Date} endDate  结束日期
 * @return {Date}          目标日期
 */
function getTargetDate(diff, minDate, endDate) {
    var oDate = endDate || new Date();
    var iYear = oDate.getFullYear();
    var iMonth = oDate.getMonth();
    var targetDate = new Date();
    var iNum = Math.floor(diff / 30);
    if (iNum <= 0) {
        var timestamp = oDate.valueOf() - diff * 24 * 60 * 60 * 1000;
        targetDate = new Date(timestamp);
    } else {
        var targetMonth = iMonth - iNum;
        while (targetMonth < 0) {
            targetMonth += 12;
            iYear--;
        }
        targetDate.setFullYear(iYear);

        var iDate = getDaysInMonth(iYear, targetMonth + 1);
        iDate > oDate.getDate() && (iDate = oDate.getDate());
        targetDate.setMonth(targetMonth, iDate);
        targetDate.setHours(oDate.getHours());
        targetDate.setMinutes(oDate.getMinutes());
        targetDate.setSeconds(oDate.getSeconds());
        targetDate.setMilliseconds(oDate.getMilliseconds());
    }
    return minDate ? (targetDate < minDate ? minDate : targetDate) : targetDate;
}

$(document).ready(function() {
    /*    
        var currYear = (new Date()).getFullYear();
        $.fn.mobiscroll && $('input[data-role="datebox"]').mobiscroll({
            preset: 'date', //日期类型--datatime --time,
            theme: 'android-ics light', //皮肤样式
            display: 'bottom', //显示方【modal】【inline】【bubble】【top】【bottom】
            mode: 'scroller', //操作方式【scroller】【clickpick】【mixed】
            dateFormat: 'yyyy-mm-dd',
            /*  timeFormat: 'HH:ii:ss',
                timeWheels: 'HHiiss',
            rows: 3,
            lang: 'zh',
            showNow: true,
            nowText: '今天',
            startYear: currYear - 10, //开始年份
            //endYear: currYear + 10, //结束年份
            maxDate: new Date()
        }).val(new Date().format());*/
});

/*;
(function(doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function() {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            var fontSize = 20 * (clientWidth / 320);
            fontSize = (fontSize > 54) ? 54 : fontSize;

            //如果是pc访问
            if (!/windows phone|iphone|android/ig.test(window.navigator.userAgent)) {
                fontSize = 20;
            }

            docEl.style.fontSize = fontSize + 'px';

            var dpi = window.devicePixelRatio;
            var viewport = document.querySelector('meta[name="viewport"]');

            docEl.setAttribute('data-dpi', dpi);
            var scale = 1 / dpi;
            // viewport.setAttribute('content', 'initial-scale='+scale+', maximum-scale='+scale+', minimum-scale='+scale+', user-scalable=no')
        };

    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);*/

util.initPage = function(pageType) {
    $(document).ready(function() {
        var nHeight = $(window).height(),
            asHght = $('#weui_actionsheet').height();
        $('#weui_actionsheet').height(nHeight);
        if (nHeight <= asHght) {
            $('#weui_actionsheet').css({
                "overflow-y": "auto"
            });
        } else {
            $("#btnWrap").addClass("btnWrapAbs");
        }

        var minDate = new Date();
        minDate.setDate(1);
        var opts = {
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'top',
            mode: 'scroller',
            dateFormat: 'mm-dd',
            defaultValue: [new Date(), new Date()],
            minDate: getTargetDate(180),
            maxDate: new Date(),
            onSelect: function(valueText, inst) {
                $('#rangeDate, #filterDate').text(valueText.replace(/\s-\s/, ' 至 '));
                $('#rangeDate, #filterRangeDate').mobiscroll('setValue', inst.getVal());
            }
        };
        $('#rangeDate, #filterRangeDate').mobiscroll().range(opts);

        $('#filterRangeDate').mobiscroll('setValue', [getTargetDate(180), new Date()]);

        $('#rangeDate, #filterDate').text(new Date().format('MM-dd'));

        $('#rangeDate, #filterRangeDate').on(EV, function() {
            return $(this).mobiscroll('show'), false;
        });

        $('#consumptionTypeWrap').on(EV, 'a.weui_grid', function() {
            $('.weui_grid_label', this).toggleClass('active');
            var bActive = $('.weui_grid_label', this).hasClass('active');
            if ($(this).hasClass('check_all')) {
                var fn = bActive ? 'addClass' : 'removeClass';
                $(this).siblings().each(function() {
                    $('.weui_grid_label', this)[fn]('active');
                });
            } else {
                if (!bActive) {
                    $('.check_all .weui_grid_label').removeClass('active');
                } else {
                    var bAllActive = !0;
                    $(this).siblings().each(function() {
                        if ($(this).hasClass('check_all')) return;
                        return !$('.weui_grid_label', this).hasClass('active') && (bAllActive = !1), bAllActive
                    });
                    bAllActive && $('.check_all .weui_grid_label').addClass('active');
                }
            }
        });

        $('#settleTypeWrap, #storeWrap').on(EV, 'a.weui_grid', function() {
            $('.weui_grid_label', this).toggleClass('active');
        });

        $("#weui_actionsheet").on("click", ".filter_back", function() {
            util.hideActionSheet();
        });
    });
};

util.initPrintMerName = function(url) {
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        beforeSend: function() {
            util.loadingToast();
        },
        success: function(data) {
            util.removeToast();
            if (data && data.code == 200) {
                var html = "";
                data.data && data.data.forEach(function(item) {
                    html += " <a href='javascript:;' class='weui_grid'><p class='weui_grid_label'>" + item.terminalAlias + "</p></a>";
                });
                $("#storeWrap").html(html);
            } else {
                /*              
                                util.dialog({
                                    info: data.rtnMsg
                                });*/
            }
        },
        error: function() {
            /*          
                        util.dialog({
                            info: "服务器异常，请稍候重试！"
                        });*/
        }
    });
}

~ function() {
    var browser = {},
        ua = navigator.userAgent.toLowerCase();
    browser.iPhone = /iphone os/.test(ua);
    browser.iPod = /ipod/i.test(ua);
    browser.iPad = /ipad/.test(ua);
    browser.android = /android/.test(ua);
    util.browser = browser;
}();
