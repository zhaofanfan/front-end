/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2017-12-17 20:51:16
 * @version 1.0
 */

// 重置 echart 和 knob 插件冲突全局变量
G_vmlCanvasManager = undefined;

jQuery(function() {
    $(".dial").knob();

    var oCount = new DigitRoll({
        container: ".js_num",
        width: 8
    });
    var num = 99999999;
    timer = setInterval(function() {
        oCount.roll(num -= Math.ceil(Math.random() * 100));
    }, 10000);
    setTimeout(function() {
        clearInterval(timer);
    }, 35000);

    demo.init();
});

var demo = (function() {
    var myChart = null;

    var loanDataValues = [];
    var repayDataValues = [];

    var init = function() {
        // 基于准备好的dom，初始化echarts实例
        myChart = echarts.init(document.getElementById("echarts-map-chart"));
        $(window).resize(myChart.resize);
        getLoanFunc();
    }

    // 使用刚指定的配置项和数据显示图表。
    var showChartFunc = function() {
        myChart.setOption({
            title: {
                text: "iphone销量",
                subtext: "纯属虚构",
                x: "center"
            },
            tooltip: {
                trigger: "item"
            },
            legend: {
                orient: "vertical",
                x: "left",
                data: ["iphone4", "iphone5"]
            },
            dataRange: {
                min: 0,
                max: 2500,
                x: "left",
                y: "bottom",
                text: ["高", "低"],
                calculable: !0
            },
            toolbox: {
                show: !0,
                orient: "vertical",
                x: "right",
                y: "center",
                feature: {
                    mark: {
                        show: !0
                    },
                    dataView: {
                        show: !0,
                        readOnly: !1
                    },
                    restore: {
                        show: !0
                    },
                    saveAsImage: {
                        show: !0
                    }
                }
            },
            roamController: {
                show: !0,
                x: "right",
                mapTypeControl: {
                    china: !0
                }
            },
            series: [{
                name: "iphone4",
                type: "map",
                mapType: "china",
                itemStyle: {
                    normal: {
                        label: {
                            show: !0
                        }
                    },
                    emphasis: {
                        label: {
                            show: !0
                        }
                    }
                },
                data: loanDataValues
            }, {
                name: "iphone5",
                type: "map",
                mapType: "china",
                itemStyle: {
                    normal: {
                        label: {
                            show: !0
                        }
                    },
                    emphasis: {
                        label: {
                            show: !0
                        }
                    }
                },
                data: repayDataValues
            }]
        });
    };

    /**
     * 获取信息
     */
    var getLoanFunc = function() {
        // $.getJSON('/').done(function(data) {
        //     if (data.success) {
        //         loanDataValues = data.loanInfos.datas;
        //         repayDataValues = data.repayInfos.datas;
        //         showChartFunc();
        //     } else {
        //         alert(data.message);
        //     }
        // });
        loanDataValues = [{
            name: "北京",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "天津",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "上海",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "重庆",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "河北",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "安徽",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "新疆",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "浙江",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "江西",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "山西",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "内蒙古",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "吉林",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "福建",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "广东",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "西藏",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "四川",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "宁夏",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "香港",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "澳门",
            value: Math.round(1e3 * Math.random())
        }];
        repayDataValues = [{
            name: "北京",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "天津",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "上海",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "广东",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "台湾",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "香港",
            value: Math.round(1e3 * Math.random())
        }, {
            name: "澳门",
            value: Math.round(1e3 * Math.random())
        }];
        showChartFunc();
    };

    return {
        init: init,
        getLoan: getLoanFunc
    }
})();

var AJAX_RESCODE = {
    SUCCESS_CODE: "00",
    ERROR_CODE: -1
};

function DigitRoll(options) {
    if (this.container = document.querySelector(options.container), this.width = options.width || 1, !this.container)
        throw Error("no container");
    this.container.style.overflow = "hidden";
    this.rollHeight = parseInt(getComputedStyle(this.container).height);
    this.rollHeight < 1 && (this.container.style.height = "20px", this.rollHeight = 20);
    this.setWidth();
}

DigitRoll.prototype = {
    roll: function(number) {
        var _this = this;
        this.number = parseInt(number) + "";
        this.number.length <= this.width ? this.number = new Array(this.width - this.number.length + 1).join("0") + this.number : this.number.length > this.width && (this.width = this.number.length, this.setWidth());
        Array.prototype.forEach.call(this.container.querySelectorAll(".num"), function(dom, index) {
            var fromIndex, max = parseInt(dom.querySelector("div:last-child").innerHTML),
                digit = parseInt(_this.number[index]),
                delta = 0,
                html = "";
            if (max != digit) {
                if (digit > max)
                    for (delta = digit - max, fromIndex = max; digit + 1 > fromIndex; fromIndex++)
                        html += "<div>" + fromIndex + "</div>";
                else {
                    for (delta = 10 - max + digit, fromIndex = max; 10 > fromIndex; fromIndex++)
                        html += "<div>" + fromIndex + "</div>";
                    for (fromIndex = 0; digit + 1 > fromIndex; fromIndex++)
                        html += "<div>" + fromIndex + "</div>"
                }
                dom.style.cssText += "-webkit-transition-duration:0s;-webkit-transform:translateY(0)";
                dom.innerHTML = html;
                setTimeout(function() {
                    dom.style.cssText += "-webkit-transition-duration:1s;-webkit-transform:translateY(-" + _this.rollHeight * delta + "px)"
                }, 50);
            }
        })
    },
    setWidth: function(width) {
        var str, c;
        for (width = width || this.width, str = "", c = 0; width > c; c++)
            str += '<div class="num" style="float:left;height:100%;line-height:' + this.rollHeight + 'px"><div>0</div></div>';
        this.container.innerHTML = str
    }
};

DigitRoll.prototype.setWidth = function(width) {
    width = width || this.width;
    var str = '';
    for (var i = 0; i < width; i++) {
        // <i class="mod_listen__numb">1</i>
        for (var i = 0; i < width; i++) {
            str += '<div class="number_item"><div class="num" style="float:left;width:100%;height:100%;line-height:' + this.rollHeight + 'px"><div>0</div></div></div>';
        }
    }
    this.container.innerHTML = str;
};

function ajaxReq(url, data, successfn, errorfn, method, beforefn, jsonp) {
    data = data || { timestamp: new Date().getTime() };
    var ajaxSetting = {
        url: url,
        type: method || "post",
        data: data,
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        dataType: "json",
        beforeSend: function() {
            !beforefn || beforefn();
        },
        success: function(res) {
            if (res && res.ret_code == AJAX_RESCODE.SUCCESS_CODE) {
                !successfn || successfn(res);
            } else {
                !errorfn || errorfn(res);
            }
        },
        error: function(res) {
            !errorfn || errorfn(res);
        },
        complete: function(xhr, textStatus) {

        }
    };
    if (jsonp) {
        ajaxSetting.dataType = "jsonp";
        ajaxSetting.jsonp = "jsonpCallback";
    }
    return $.ajax(ajaxSetting)
}