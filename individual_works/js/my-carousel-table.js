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
                var b = $(this).data('data');
                e && e !== '' && (d.emit('click-rank-dot', b[e]), d.emit('global_var', e, b[e]))
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
        debugger
        this.dataPool = a
    },
    getData: function(h, a, l) {
        debugger
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
            }), $(c).data('data', b), $(c).find('.index-bg').html(e + g + 1))
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
                c.css('background-color', g % 2 == 0 ? k : j), c.data('data', b), c.find('.index-bg').html(g)
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
        debugger
        var a = this,
            d = a.config,
            b = a.dataPool;
        if (b && b.length > 0) {
            debugger
            var e = a.startIndex,
                c = d.global.rowCount,
                g = d.global.animationMode,
                f;
            if (g === 'bottom' ? (f = 1, c += 1) : (f = c, c *= 2), a.isInit) a.initFill(b, e);
            else {
                debugger
                var h = a.getData(b, e, c);
                a.fillCell(h), a.animation(), a.setStartIndex(b, e, f)
            }
            this.timer = setTimeout(a.addTimer.bind(a), d.global.duration * 1e3)
            debugger
        }
        debugger
    },
    render: function(b, d) {
        debugger
        var a = this,
            c = a.mergeConfig(d);
        if (b = a.data(b), !b) return;
        debugger
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
