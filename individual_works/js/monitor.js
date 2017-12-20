/**
 *
 * @authors Your Name (you@example.org)
 * @date    2017-12-17 20:51:16
 * @version 1.0
 */

var t = setTimeout(time, 1000);

function time() {
    clearTimeout(t);
    var dt = new Date();
    var y = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var d = dt.getDate();
    var h = dt.getHours();
    var m = dt.getMinutes();
    var s = dt.getSeconds();
    mm = mm < 10 ? "0" + mm : mm;
    d = d < 10 ? "0" + d : d;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    document.getElementById("timeShow").innerHTML = y + "-" + mm + "-" + d + " " + h + ":" + m + ":" + s;
    t = setTimeout(time, 1000);
}

jQuery(function() {


    // var oCount = new DigitRoll({
    //     container: ".js_num",
    //     width: 8
    // });
    // var num = 99999999;
    // timer = setInterval(function() {
    //     oCount.roll(num -= Math.ceil(Math.random() * 100));
    // }, 10000);
    // setTimeout(function() {
    //     clearInterval(timer);
    // }, 35000);


});

var AbnormityChart = (function() {
    var distChart = null;
    handleChart = null;
    var trendChart = null;
    var proportionChart = null;

    var distDataValues = [];
    var handleDataValues = [];
    var trendDataValues = {};
    var proportionDataValues = [];

    var autohighlight;

    var init = function() {
        // 基于准备好的dom，初始化echarts实例
        distChart = echarts.init(document.getElementById("echarts-map-chart"));
        handleChart = echarts.init(document.getElementById("echarts-pie-chart"));
        trendChart = echarts.init(document.getElementById("echarts-line-chart"));
        proportionChart = echarts.init(document.getElementById("echarts-proportion-pie-chart"));

        $(window).resize(function() {
            distChart.resize();
            handleChart.resize();
            trendChart.resize();
            proportionChart.resize();
        });

        getDataFunc();
    }

    // 使用刚指定的配置项和数据显示图表。
    var showChartFunc = function() {
        distChart.setOption({
            title: {
                show: !1,
                text: "iphone销量",
                subtext: "纯属虚构",
                x: "center"
            },
            tooltip: {
                trigger: "item"
            },
            legend: {
                show: !1,
                orient: "vertical",
                x: "left",
                data: ["iphone5"]
            },
            visualMap: {
                show: !1,
                min: 0,
                max: 2500,
                inRange: {
                    color: ['#1e9fd1', '#37b89b', '#1c7ac0']
                },
                x: "left",
                y: "bottom",
                text: ["高", "低"],
                calculable: !0
            },
            // roamController: {
            //     show: !1,
            //     x: "right",
            //     mapTypeControl: {
            //         china: !0
            //     }
            // },
            series: [{
                name: "iphone5",
                type: "map",
                roam: !0,
                mapType: "china",
                label: {
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
                data: distDataValues
            }]
        });

        option = {
            title: {
                text: '处理情况',
                subtext: 'Treatment situation',
                x: 'left',
                textStyle: {
                    fontSize: 22,
                    fontWeight: 'normal',
                    color: '#fff'
                },
                subtextStyle: {
                    fontSize: 16
                }
            },
            // tooltip: {
            //     trigger: 'item',
            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
            // },
            legend: {
                orient: 'vertical',
                x: 300,
                textStyle: {
                    color: '#fff'
                },
                itemWidth: 14,
                itemHeight: 14,
                data: [{
                    name: '已处理',
                    icon: 'stack'
                }, {
                    name: '处理中',
                    icon: 'stack'
                }, {
                    name: '未处理',
                    icon: 'stack'
                }],
                formatter: function(name) {
                    var _label = name;
                    jQuery(handleDataValues).each(function(index, item) {
                        if (item.name == name) {
                            _label = name + "：" + item.value + "个";
                            return false;
                        }
                    });
                    return _label;
                }
            },
            color: ['#5ac8ae', '#fdc77c', '#f1786b'],
            calculable: false,
            series: [{
                name: '处理情况',
                type: 'pie',
                selectedMode: 'single',
                radius: ['40%', '70%'],
                center: ['50%', '60%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    emphasis: {
                        label: {
                            show: !1,
                            position: 'center',
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    }
                },
                data: handleDataValues
            }]
        };
        handleChart.setOption(option);

        var currentIndex = -1;

        clearInterval(autohighlight);
        autohighlight = setInterval(function() {
            var dataLen = option.series[0].data.length;
            // 取消之前高亮的图形
            handleChart.dispatchAction({
                type: 'downplay',
                seriesIndex: 0,
                dataIndex: currentIndex
            });
            currentIndex = (currentIndex + 1) % dataLen;
            // 高亮当前图形
            handleChart.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: currentIndex
            });

            $(".percent-text").text(option.series[0].data[currentIndex].name);
        }, 1000);

        proportionChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            color: ['#ff6063', '#a3ff6c', '#ffffff'],
            calculable: false,
            series: [{
                name: '处理情况',
                type: 'pie',
                radius: ['40%', '50%'],
                center: ['50%', '60%'],
                itemStyle: {
                    normal: {
                        label: {
                            show: !0,
                            formatter: '{d}%\n{b}'
                        },
                        labelLine: {
                            show: !0
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    }
                },
                data: proportionDataValues
            }]
        });

        trendChart.setOption({
            title: {
                text: '近期严重趋势图',
                subtext: 'One month trend map',
                x: 'left',
                textStyle: {
                    fontSize: 22,
                    fontWeight: 'normal',
                    color: '#fff'
                },
                subtextStyle: {
                    fontSize: 16
                }
            },
            grid: {
                x: 35,
                y: 75,
                x2: 10,
                y2: 30
            },
            legend: {
                x: '700',
                itemWidth: 50,
                itemHeight: 2,
                data: [{
                    name: '严重',
                    icon: 'rect'
                }, {
                    name: '警告',
                    icon: 'rect'
                }, {
                    name: '提醒',
                    icon: 'rect'
                }],
                textStyle: {
                    color: '#fff'
                },
            },
            color: ['#5ac8ae', '#fdc77c', '#f1786b'],
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: { onZero: false },
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                max: 500
            }],
            series: [{
                name: '严重',
                type: 'line',
                data: trendDataValues["1"]
            }, {
                name: '警告',
                type: 'line',
                data: trendDataValues["2"]
            }, {
                name: '提醒',
                type: 'line',
                data: trendDataValues["3"]
            }]
        });
    };

    /**
     * 获取信息
     */
    var getDataFunc = function() {
        $.getJSON('js/mock.js?r=' + Math.random()).done(function(data) {
            if (data) {
                distDataValues = data.distInfos;
                handleDataValues = data.handleInfos;
                trendDataValues = data.trendInfos;
                proportionDataValues = data.proportionInfos;
                showChartFunc();

                setTimeout(getDataFunc, 3E3);
            } else {
                alert(data.message);
            }
        });
    };

    return {
        init: init,
        getData: getDataFunc
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
