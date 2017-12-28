var _ROOT = "";
var API_INTERFACE = {
    TODAYALARM: _ROOT + "js/todayAlarm.js", // 今日、昨日告警数量 以类型（提醒、警告、严重）
    TODAYERROR: _ROOT + "js/todayError.js", // 今日异常数量
    TODAYSERVICE: _ROOT + "js/todayService.js", //各业务系统告警数量与已处理情况
    GROUPBYREGION: _ROOT + "js/groupbyregion.js",
    ALARMSUNHANDLED: _ROOT + "js/alarmsunhandled.js",
    GROUPBYDAY: _ROOT + "js/groupbyday.js"
};

var t = setTimeout(time, 1000);

function time() {
    clearTimeout(t);
    $("#timeShow").html(new Date().format("yyyy-MM-dd hh:mm:ss"));
    t = setTimeout(time, 1000);
}

var AbnormityChart = (function() {
    var distChart = null;
    var handleChart = null;
    var trendChart = null;
    var proportionChart = null;

    var percentNumberCountUp = null;

    var tAlarm, tError, todayAlarmCountUp, todayExpCountUp;

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

    var autoHighlight = function() {
        var currentIndex = -1;
        clearInterval(autohighlight);

        autohighlight = setInterval(function() {
            var dataLen = handleOption.series[0].data.length;
            // 取消之前高亮的图形
            handleChart.dispatchAction({
                type: 'downplay',
                dataIndex: currentIndex
            });
            currentIndex = (currentIndex + 1) % dataLen;
            // 高亮当前图形
            handleChart.dispatchAction({
                type: 'highlight',
                dataIndex: currentIndex
            });

            var _name = handleOption.series[0].data[currentIndex].name;
            var oldNumber = parseInt($("#percentNumber").text(), 10);
            percentNumberCountUp = new CountUp("percentNumber", oldNumber, getPercentByName(handleDataValues, _name), 0, 1);
            percentNumberCountUp.start();

            $(".percent-text").animate({
                scaleX: 0
            }, {
                step: function(now, fx) {
                    $(this).css("transform", "scaleX(" + now + ")");
                },
                duration: 200,
                easing: 'easeInSine',
                complete: function() {
                    $(this).text(_name).animate({
                        scaleX: 1
                    }, {
                        step: function(now, fx) {
                            $(this).css("transform", "scaleX(" + now + ")");
                        },
                        duration: 200,
                        easing: 'easeOutSine'
                    });
                }
            });
        }, 2000);
    };

    var getLatestOneWeek = function() {
        var xAxisData = [];
        var dt = new Date();
        var index = 6;

        while (index >= 0) {
            var newDt = new Date(dt.getTime() - index * 24 * 3600 * 1000);
            xAxisData.push(newDt.format("MM.dd"));
            index--;
        }
        return xAxisData;
    };

    var getLatestOneMonth = function() {
        var xAxisData = [];
        var dt = new Date();
        var index = 3;

        function getPlaceholderArray() {
            var phArray = new Array(9);
            jQuery(phArray).each(function(i) {
                phArray[i] = "";
            });
            return phArray;
        }

        while (index >= 0) {
            var newDt = new Date(dt.getTime() - index * 10 * 24 * 3600 * 1000);
            xAxisData.push(newDt.format("yyyy.MM.dd"));
            index != 0 && (xAxisData = xAxisData.concat(getPlaceholderArray()));
            index--;
        }
        return xAxisData;
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
        getAlarmDataFunc();
        getExpDataFunc();
        getBusinessDataFunc();
        getDistDataFunc();
        getTrendDataFunc();
    };

    /*
     *获取当前开始时间和结束时间
     *前一天的开始时间和结束时间
     */
    var getReqParams = function() {
        var date = new Date(),
            tSince, tUntil, ySince, yUntil, hour;
        tSince = date.toISOString();
        hour = date.getHours();
        tUntil = (new Date(date.getTime() - hour * 60 * 60 * 1000)).toISOString();
        ySince = (new Date(date.getTime() - 24 * 60 * 60 * 1000)).toISOString();
        yUntil = (new Date(date.getTime() - (24 + hour) * 60 * 60 * 1000)).toISOString();

        return { since: tSince, until: tUntil };
    };

    var getAlarmDataFunc = function() {
        ajaxReq(API_INTERFACE.TODAYALARM, getReqParams(), function(res) {
            /*今日告警总数*/
            tAlarm = res.body.today.info + res.body.today.warning + res.body.today.fatal;
            var oldAlarmCount = parseInt($("#todayAlarmCount").text().replace(/\,/g, ""));
            todayAlarmCountUp = new CountUp("todayAlarmCount", oldAlarmCount, tAlarm, 0, 2);
            todayAlarmCountUp.start();

            /*今日告警占比*/
            $(".one .proportion-main .counter .number").text(res.body.today.fatal);
            $(".one .proportion-footer .counter .number").text(res.body.yesterday.fatal);
            $(".two .proportion-main .counter .number").text(res.body.today.warning);
            $(".two .proportion-footer .counter .number").text(res.body.yesterday.warning);
            $(".three .proportion-main .counter .number").text(res.body.today.info);
            $(".three .proportion-footer .counter .number").text(res.body.yesterday.info);

            setTimeout(getAlarmDataFunc, 6E3);
        }, jQuery.noop, "GET");
    };

    var getExpDataFunc = function() {
        ajaxReq(API_INTERFACE.TODAYERROR, getReqParams(), function(res) {
            /*今日异常总数*/
            tError = res.body.today.total;
            var oldExpCount = parseInt($("#todayExpCount").text().replace(/\,/g, ""));
            todayExpCountUp = new CountUp("todayExpCount", oldExpCount, tError, 0, 2);
            todayExpCountUp.start();

            setTimeout(getExpDataFunc, 6E3);
        }, jQuery.noop, "GET");
    };

    var getBusinessDataFunc = function() {
        ajaxReq(API_INTERFACE.TODAYSERVICE, getReqParams(), function(res) {
            var arr = res.body.values;
            arr.forEach(function(item, index) {
                $(".percentage").eq(index).find(".bar-num").text(item[1] + '个');
                $(".table-line").eq(index).find(".inner").text(item[0]);
            });

            setTimeout(getBusinessDataFunc, 6E3);
        }, jQuery.noop, "GET");
    };

    var getDistDataFunc = function() {
        ajaxReq(API_INTERFACE.GROUPBYREGION, null, function(res) {
            var arr = res.body.values;
            $(arr).each(function() {
                // [{ name: '北京', value: 96 }, { name: '广州' }],
                GZData.push([{ name: this[0], value: this[1] }, { name: '广州' }]);
            });
            [
                ['广州', GZData]
            ].forEach(function(item, i) {
                series.push({ //线
                    type: 'lines',
                    zlevel: 2,
                    symbol: ['none', 'arrow'], //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'线两端的标记类型
                    symbolSize: 5, //箭头大小
                    lineStyle: {
                        normal: {
                            width: 1,
                            opacity: 0.4,
                            curveness: 0.3
                        },
                    },
                    effect: {
                        show: true, //是否显示特效
                        period: 2, //特效动画的时间，单位为 s
                        symbol: 'pin', //特效图形的类型
                        constantSpeed: 100, //固定速度，大于0的值后会忽略 period 配置项
                        symbolSize: 5,
                        color: '#fff',
                        shadowBlur: 8
                    },
                    data: convertData(item[1])
                }, {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: { //涟漪特效相关配置
                        period: '4', //动画的时间
                        scale: '20', //动画中波纹的最大缩放比例
                        brushType: 'stroke'
                    },
                    label: { //图形上的城市文本标签
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            textStyle: {
                                color: '#fff',
                                fontStyle: 'normal',
                                fontFamily: 'arial',
                                fontSize: 12,
                            }
                        }
                    },
                    symbolSize: 3, //点大小
                    data: item[1].map(function(dataItem) {
                        return {
                            name: dataItem[0].name, //来源或流向修改
                            value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value]) //来源或流向修改
                        };
                    })
                });
            });
            distChart.setOption(distOption);

            setTimeout(getDistDataFunc, 6E3);
        }, jQuery.noop, "GET");
    };

    var getTrendDataFunc = function() {
        ajaxReq(API_INTERFACE.GROUPBYDAY, null, function(res) {
            var arr = res.body;
            var info = [],
                warning = [],
                fatal = [];
            $(arr).each(function() {
                info.push(this[1]);
                warning.push(this[2]);
                fatal.push(this[3]);
            });
            trendOption.series[0].data = fatal;
            trendOption.series[1].data = warning;
            trendOption.series[2].data = info;
            trendOption.xAxis.data = getLatestOneWeek();
            trendChart.setOption(trendOption);

            setTimeout(getTrendDataFunc, 6E3);
        }, jQuery.noop, "GET");
    };

    return {
        init: init
    }
})();

function addClickUrl() {
    jQuery(realtimeDataValues).each(function(index, el) {
        el.clickUrl = _ROOT + (index + 1)
    });
}

function run(_carouselInst, _autoUpdate) {
    1e3 > _autoUpdate && (_autoUpdate = 1e3), setTimeout(function() {
        ajaxReq(API_INTERFACE.ALARMSUNHANDLED, null, function(res) {
            var arr = res.body;
            $(arr).each(function() {
                realtimeDataValues.push({
                    time: this[0],
                    exception: this[1]
                });
            });
            addClickUrl();

            carouselInst.render(realtimeDataValues);
            run(carouselInst, 3E3);
        }, jQuery.noop, "GET");
    }, _autoUpdate - Date.now() % _autoUpdate)
}

jQuery(function() {
    carouselInst = new CarouselTable("#carouselWrapper", carouselConfig.config);
    run(carouselInst, 3E3);
});
