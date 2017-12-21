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

    var oldAlarmCount = parseInt($("#todayAlarmCount").text().replace(/\,/g, "") || 0, 10);
    var oldExpCount = parseInt($("#todayExpCount").text().replace(/\,/g, "") || 0, 10);
    todayAlarmCountUp = new CountUp("todayAlarmCount", oldAlarmCount, 39463, 0, 1);
    todayExpCountUp = new CountUp("todayExpCount", oldExpCount, 39463, 0, 1);
    todayAlarmCountUp.start();
    todayExpCountUp.start();

});

var AbnormityChart = (function() {
    var distChart = null;
    var handleChart = null;
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

            var _name = option.series[0].data[currentIndex].name;
            var oldNumber = parseInt($("#percentNumber").text(), 10);
            percentNumberCountUp = new CountUp("percentNumber", oldNumber, getPercentByName(handleDataValues, _name), 0, 1);
            percentNumberCountUp.start();

            $(".percent-text").on("animationend", function() {
                $(".percent-text").text(_name)
                    .off("animationend")
                    .removeClass("scaleOut")
                    .addClass("scaleIn");
            }).removeClass("scaleIn").addClass("scaleOut");

        }, 2000);

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
            color: ['#b54a52', '#b6661a', '#49aa16'],
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

    var getPercentByName = function(_seriesData, _name) {
        var sum = 0,
            value = 0;
        jQuery(_seriesData).each(function(i, item) {
            sum += item.value;
            if (item.name == _name)
                value = item.value;
        });
        return Math.round(value / sum * 100);
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

                setTimeout(getDataFunc, 6E3);
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

function CarouselTable(i, d) {
    this.container = $(i);
    var e = {
            width: this.container.width(),
            height: this.container.height(),
            'background-color': 'transparent',
            theme: {}
        },
        f = '<div class="line header" style="display: flex;align-items: center;background-color: <%= backgroundColor %>;height: <%= height %>px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;vertical-align: middle;color: <%= color %>;"><% if (hasIndex) {%><div class="index-list" style="display: inline-block;vertical-align: middle;width: <%= idListWidth %>%;height: <%= height %>px;"></div><%}%><%= column %></div>';
    this.headerTemp = _.template(f);
    var g = '<div class="line row-content" style="height: <%= height %>px;text-overflow: ellipsis;overflow: hidden;vertical-align: middle; display: flex;align-items: center;background-color: <%= bgColor %>;"><% if (hasIndex) {%><div class="index" style="display: inline-block;text-align: center;vertical-align: middle;width: <%= idListWidth %>%;color: <%= idListColor %>;font-size: <%= idListFontSize %>px;"><div class="index-bg" style="background-color: <%= idListBgColor %>;width: <%= bgSize %>px;height: <%= bgSize %>px;line-height: <%= bgSize %>px;vertical-align: middle;margin: auto;border-radius: <%= radius %>px;text-align: center;"></div></div><%}%></div>';
    this.rowTemp = _.template(g);
    var h = '<div class="<%=classname%>" style="width: <%= width %>%;display:inline-block;text-overflow: ellipsis;text-align: <%= textAlign %>;<% if (isBr) {%>word-wrap: break-word;word-break:normal;<%}%><% if (!isBr) {%>white-space: nowrap;<%}%>overflow: hidden;vertical-align: middle;background-color: transparent;font-family: <%= fontFamily %>;font-size: <%= fontSize %>px;color: <%= color %>;font-weight: <%= fontWeight %>;"><%= content %></div>';
    this.cellTemp = _.template(h), this._data = null, this.config = e, this.apis = d.apis, this.isInit = !0, this.startIndex = 0, this.titleList = [], this.init(d)
}
CarouselTable.prototype = {
    init: function(a) {
        this.mergeConfig(a), this.initRank(), this.updateStyle(), this.initInteraction()
    },
    initInteraction: function() {
        var a = this;
        a.container.css('cursor', 'pointer'), a.container.on('mouseover', function(b) {
            a.removeTimer()
        }).on('mouseout', function(b) {
            var c = b.toElement || b.relatedTarget;
            if (this.contains(c)) return;
            a.addTimer()
        })
    },
    initPool: function() {
        this.dataPool = []
    },
    setHeader: function(e, a) {
        var f = this.headerTemp,
            g = this.cellTemp,
            c = '';
        for (var b = 0; b < e.length; b++) {
            var d = e[b];
            c += g({
                width: d.width,
                height: a.height,
                content: d.displayName,
                textAlign: a.textStyle.textAlign,
                classname: 'column column-title',
                isBr: a.isBr,
                fontSize: a.textStyle.fontSize,
                fontFamily: a.textStyle.fontFamily,
                color: a.textStyle.color,
                fontWeight: a.textStyle.fontWeight
            })
        }
        a.column = c, a.color = a.textStyle.color, a.fontSize = a.textStyle.fontSize, a.fontWeight = a.textStyle.fontWeight;
        var h = f(a);
        this.container.append(h)
    },
    setRowNodeStr: function(a) {
        this.rowStr = this.rowTemp(a)
    },
    appendRow: function(o, n, p) {
        var d = this,
            m = d.cellTemp,
            e = d.config.row.callbackId,
            l = d.config.row.backgroundColor2;
        for (var g = 0; g < o; g++) {
            var f = $(d.rowStr);
            g % 2 === 1 && f.css({
                'background-color': l
            });
            var i = '';
            for (var h = 0; h < n.length; h++) {
                var j = n[h] || {},
                    k = _.clone(p),
                    c = _.merge(k, j);
                i += m({
                    width: c.width,
                    height: c.height,
                    content: '',
                    bgColor: c.backgroundColor,
                    textAlign: c.textStyle.textAlign,
                    classname: 'column cell-content',
                    isBr: c.isBr,
                    fontSize: c.textStyle.fontSize,
                    fontFamily: c.textStyle.fontFamily,
                    color: c.textStyle.color,
                    fontWeight: c.textStyle.fontWeight
                })
            }
            f.append(i), f.on('click', function(c) {
                // var b = $(this).data('data');
                // e && e !== '' && (d.emit('click-rank-dot', b[e]), d.emit('global_var', e, b[e]))
            }), this.container.append(f)
        }
    },
    removeTimer: function() {
        this.timer && clearTimeout(this.timer)
    },
    initRank: function() {
        var a = this.config;
        this.removeTimer(), this.initPool(), this.container.empty(), this.container.css({
            overflow: 'hidden',
            'background-color': a['background-color']
        });
        var d = a.header,
            c = a.idList,
            h = a.defaultCell,
            g = a.series;
        this.columnNameList = _.map(g, 'columnName'), d.show ? (d.hasIndex = c.show, d.idListWidth = c.width, d.height = Math.floor(a.height * (d.heightPercent / 100)), this.setHeader(g, d)) : d.height = 0;
        var f = a.global.rowCount,
            e = {
                rowCount: f,
                height: Math.floor((a.height - d.height) / f),
                hasIndex: c.show,
                idListWidth: c.width,
                idListRadius: c.radius,
                idListBgColor: c.backgroundColor,
                idListColor: c.textStyle.color,
                idListFontSize: c.textStyle.fontSize,
                bgColor: a.row.backgroundColor1
            };
        e.bgSize = Math.min(Math.floor(this.container.width() * c.width / 100), e.height) * e.idListRadius / 100 - 4, e.radius = e.bgSize / 2, this.setRowNodeStr(e), f *= 2, a.defaultCell.height = e.height, this.appendRow(f, g, a.defaultCell)
    },
    updateData: function(a) {
        if (!(a && a.length)) return;
        this.dataPool = a
    },
    getData: function(h, a, l) {
        var j = this,
            k = this.container,
            f = j.config,
            e = [];
        a += f.global.rowCount, a > h.length - 1 && (f.global.animationMode === 'bottom' ? a %= h.length : a = 0);
        for (var d = a; d < a + l; d++) {
            var i = d,
                c = h[i];
            if (c && c !== undefined) {
                var g = _.cloneDeep(c);
                g.index = i + 1, e.push(g)
            } else e.push({})
        }
        return {
            data: e,
            index: a
        }
    },
    setStartIndex: function(c, a, d) {
        var b = this,
            e = b.config;
        a += d, a > c.length - 1 && (a = 0), b.startIndex = a
    },
    initFill: function(i, e) {
        var b = this,
            c = b.config,
            f = b.columnNameList || [],
            g = b.container,
            d = c.series,
            h = $(g).find('.row-content:lt(' + c.global.rowCount + ')');
        h.each(function(g, c) {
            var b = i[e + g];
            b && ($(c).find('.cell-content').each(function(g, i) {
                var c = f[g],
                    h = d[g].dataType,
                    e = '';
                h === 'img' ? e = '<img src="' + (b[c] || '') + '" style="width:' + d[g].widthPercent + '%; height:100%;"/>' : e = !b[c] && Number(b[c]) !== 0 ? '-' : b[c], $(i).html(e)
            }), $(c).data('data', b) /*, $(c).find('.index-bg').html(e + g + 1)*/ )
        })
    },
    fillCell: function(h) {
        var c = this,
            b = c.config,
            f = c.columnNameList || [],
            g = c.container,
            e = h.data,
            i = h.index,
            j = b.row.backgroundColor1,
            k = b.row.backgroundColor2,
            d = b.series,
            l = $(g).find('.row-content:gt(' + (b.global.rowCount - 1) + ')');
        l.each(function(h, l) {
            var b = e[h];
            if (b) {
                var c = $(l);
                c.find('.cell-content').each(function(g, i) {
                    var c = f[g],
                        h = d[g].dataType,
                        e = '';
                    h === 'img' ? e = '<img src="' + (b[c] || '') + '" style="width:' + d[g].widthPercent + '%; height:100%;"/>' : e = !b[c] && Number(b[c]) !== 0 ? '-' : b[c], $(i).html(e)
                });
                var g = i + h + 1;
                c.css('background-color', g % 2 == 0 ? k : j), c.data('data', b) /*, c.find('.index-bg').html(g)*/
            }
        })
    },
    animation: function() {
        var d = this,
            e = d.config,
            c = d.container,
            f = e.global.animationMode,
            b;
        f === 'bottom' ? (b = c.find('.row-content:first'), a(b).slideToggle(400, function() {
            c.append(b), b.slideDown()
        })) : (b = $(c).find('.row-content:lt(' + e.global.rowCount + ')'), $(b).slideToggle(400, function() {
            c.append(b), b.slideDown()
        }))
    },
    addTimer: function() {
        var a = this,
            d = a.config,
            b = a.dataPool;
        if (b && b.length > 0) {
            var e = a.startIndex,
                c = d.global.rowCount,
                g = d.global.animationMode,
                f;
            if (g === 'bottom' ? (f = 1, c += 1) : (f = c, c *= 2), a.isInit) a.initFill(b, e);
            else {
                var h = a.getData(b, e, c);
                a.fillCell(h), a.animation(), a.setStartIndex(b, e, f)
            }
            this.timer = setTimeout(a.addTimer.bind(a), d.global.duration * 1e3)
        }
    },
    render: function(b, d) {
        var a = this,
            c = a.mergeConfig(d);
        if (b = a.data(b), !b) return;
        a.updateData(b), a.isInit && (setTimeout(a.addTimer(), c.global.duration * 1e3), a.isInit = !1)
    },
    resize: function(a, b) {
        this.mergeConfig({
            width: a,
            height: b
        }), this.render()
    },
    data: function(a) {
        return a && a.length > 0 && (this._data = a), this._data
    },
    mergeConfig: function(d) {
        if (!d) return this.config;
        var a = this.config;
        a.width = a.width, a.height = a.height;
        var e = _.cloneDeep(d),
            c = _.defaultsDeep(d || {}, a);
        return c.series = e.series || a.series, _.isEqual(a, c) || (this.config = c, this.isInit = !0, this.initRank()), this.config
    },
    updateStyle: function() {}
};

var percentNumberCountUp = null;

var realtimeDataValues = [];

var carouselInst = null;

var carouselConfig = {
    "config": {
        "global": {
            "animationMode": "top",
            "rowCount": 6,
            "duration": 2
        },
        "header": {
            "show": true,
            "heightPercent": 12,
            "backgroundColor": "rgba(255,255,255,0.05)",
            "textStyle": {
                "textAlign": "left",
                "fontFamily": "YouYuan",
                "color": "rgba(255,255,255,0.7)",
                "fontSize": 16,
                "fontWeight": "normal"
            }
        },
        "row": {
            "backgroundColor1": "rgba(255,255,255,0)",
            "backgroundColor2": "rgba(255,255,255,0.05)",
            "callbackId": "area"
        },
        "idList": {
            "show": true,
            "backgroundColor": "rgba(241,90,34,0.54)",
            "width": 15,
            "radius": 30,
            "textStyle": {
                "color": "#ffffff",
                "fontSize": 14,
                "fontWeight": "normal"
            }
        },
        "defaultCell": {
            "isBr": false,
            "textStyle": {
                "textAlign": "left",
                "fontFamily": "Microsoft Yahei",
                "fontSize": 14,
                "color": "#0c0c0c",
                "fontWeight": "normal"
            }
        },
        "series": [{
            "columnName": "time",
            "displayName": "时间",
            "backgroundColor": "#ff7900",
            "width": 35,
            "dataType": "text",
            "isBr": false,
            "textStyle": {
                "textAlign": "left",
                "fontSize": 16,
                "color": "rgba(255,255,255,0.7)",
                "fontWeight": "normal"
            }
        }, {
            "columnName": "exception",
            "displayName": "异常情况",
            "backgroundColor": "#ff7900",
            "width": 60,
            "dataType": "text",
            "isBr": false,
            "textStyle": {
                "textAlign": "left",
                "fontSize": 16,
                "color": "#d06a4d",
                "fontWeight": "normal"
            }
        }]
    }
    // "data": {
    //     "source": {
    //         "handler": "render",
    //         "autoUpdate": 30000,
    //         "description": "轮播列表接口",
    //         "fields": {},
    //         "dcConfig": {
    //             "data": realtimeDataValues
    //         }
    //     }
    // }
};

function run(_carouselInst, _autoUpdate) {
    1e3 > _autoUpdate && (_autoUpdate = 1e3), setTimeout(function() {
        run(_carouselInst, _autoUpdate)
    }, _autoUpdate - Date.now() % _autoUpdate)
}

jQuery(function() {
    carouselInst = new CarouselTable("#carouselWrapper", carouselConfig.config);

    $.getJSON('js/realtime_mock.js').done(function(res) {
        realtimeDataValues = res.data;

        carouselInst.render(realtimeDataValues);
        run(carouselInst, 3E4);
    });
});