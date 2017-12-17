var websocket = (function() {

    var stompClient = null;

    /**
     * 创建WebSocket链接
     * @param url
     * @param databackurl
     * @param callback
     */
    var createConnectFunc = function connect(url, databackurl, callback) {
        var socket = new SockJS(url);
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function(frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(databackurl, function(response) {
                if (typeof callback === "function") {
                    callback(response);
                } else {
                    console.log("Not Function!");
                }
            });
        });
    };

    /**
     * 断开WebSocket链接
     */
    var disconnectFunc = function disconnect() {
        if (stompClient != null) {
            stompClient.disconnect();
        }
        console.log("WebSocket has Disconnected!");
    };

    /**
     * 发送数据到服务端
     * @param url
     * @param data
     */
    var sendDataFunc = function sendDate(url, data) {
        stompClient.send("/app" + url, {}, JSON.stringify(data));
    };

    /**
     * 判断是否已经链接
     * @returns {boolean}
     */
    var hasConnectedFunc = function hasConnected() {
        if (stompClient != null) {
            return true;
        }
        return false;
    };

    return {
        createConnect: createConnectFunc,
        sendData: sendDataFunc,
        disconnect: disconnectFunc,
        hasConnected: hasConnectedFunc
    }
})();

var demo = (function() {
    // 基于准备好的dom，初始化echarts实例
    // var myChart = echarts.init(document.getElementById('main'));
    var myChart = null;

    var loanDataValues = [];
    var repayDataValues = [];

    // 使用刚指定的配置项和数据显示图表。
    var showChartFunc = function() {
        myChart.setOption({
            title: {
                show: false,
                text: '图表详情'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    var date = new Date(params.value[0]);
                    data = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                    return data + '<br/>' + '金额:' + params.value[1] + '<br/>' + '公司:' + params.value[2];
                }
            },
            legend: {
                data: ['Demo1金额', 'Demo2金额']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            xAxis: [{
                type: 'time',
                splitNumber: 10,
                boundaryGap: ['20%', '20%'],
                min: 'dataMin',
                max: 'dataMax'
            }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: '金额(元)',
                min: 0,
                boundaryGap: ['20%', '20%']
            }],
            dataZoom: {
                type: 'inside',
                start: 0,
                end: 100
            },
            series: [{
                name: 'Demo1金额',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                data: loanDataValues
            }, {
                name: 'Demo2金额',
                type: 'line',
                smooth: true,
                symbol: 'rect',
                data: repayDataValues
            }]
        });
    };

    /**
     * 实时接受消息并绘制图标
     * @param message
     */
    var addPointFunc = function addPoint(message) {
        var dataVo = JSON.parse(message.body);
        addData(dataVo);
        showChartFunc();
    };

    function addData(dataVo) {
        if (dataVo.type == 1) {
            loanDataValues.push([dataVo.date, dataVo.value, dataVo.name]);
        } else if (dataVo.type == 2) {
            repayDataValues.push([dataVo.date, dataVo.value, dataVo.name]);
        }
    }

    /**
     * WebSocket连接
     */
    var connectFunc = function connect() {
        websocket.createConnect("/getLoanPoints", "/topic/addLoanPoint", addPointFunc);
    };

    /**
     * 发送数据到服务器(暂时不用)
     */
    var sendValueFunc = function sendValue() {
        var value = document.getElementById('name').value;
        websocket.sendData("/getLoanPoints", value);
    };

    /**
     * 获取当日借贷信息
     */
    var getLoanFunc = function() {
        $.getJSON('getLoanInfo').done(function(data) {
            if (data.success) {
                loanDataValues = data.loanInfos.datas;
                repayDataValues = data.repayInfos.datas;
                showChartFunc();
            } else {
                alert(data.message);
            }
        });
    };

    return {
        getLoan: getLoanFunc,
        connect: connectFunc
    }
})();

var s = echarts.init(document.getElementById("echarts-map-chart")),
    c = {
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
            data: ["iphone3", "iphone4", "iphone5"]
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
            name: "iphone3",
            type: "map",
            mapType: "china",
            roam: !1,
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
            data: [{
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
                name: "河南",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "云南",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "辽宁",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "黑龙江",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "湖南",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "安徽",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "山东",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "新疆",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "江苏",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "浙江",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "江西",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "湖北",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "广西",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "甘肃",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "山西",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "内蒙古",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "陕西",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "吉林",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "福建",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "贵州",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "广东",
                value: Math.round(1e3 * Math.random())
            }, {
                name: "青海",
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
                name: "海南",
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
            }]
        }, {
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
            data: [{
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
            }]
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
            data: [{
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
            }]
        }]
    };
s.setOption(c), $(window).resize(s.resize);
