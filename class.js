~ function(win, doc) {
    var DefSuperClass = function() {},
        d = new Object;
    d.superclass = Object, d.__NAME__ = "Object", d.superinstance = new Object;
    d.callsuper = function(a) {
        var b = this;
        if (this._realsuper = this._realsuper ? this._realsuper.prototype.superclass : this.superclass, "string" == typeof a) {
            var c = Array.prototype.slice.call(arguments, 1);
            b._realsuper.prototype[a].apply(b, c)
        } else {
            var c = Array.prototype.slice.call(arguments, 0);
            b._realsuper.apply(b, c)
        }
        this._realsuper = null
    }, DefSuperClass.prototype = d;

    var Namespace = function(ns, obj2Mount, rootNs) {
        var e, f = ns.split("."),
            g = f.length - 1,
            h = 0;
        if (!rootNs) try {
            if (!new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*$").test(f[0])) throw "";
            rootNs = new Function("return " + f[0])(), h = 1
        } catch (i) {
            rootNs = win
        }
        for (; g > h; h++) e = f[h], rootNs[e] || (rootNs[e] = {}), rootNs = rootNs[e];
        rootNs[f[g]] || (rootNs[f[g]] = obj2Mount)
    };

    var Class = function(clsName, oArg) {
        var e = oArg.ns && oArg.ns + "." + clsName;
        if (e) try {
            var f = new Function("return " + e)();
            if (f) return f
        } catch (g) {}
        var superClass = oArg.extend || DefSuperClass,
            i = function() {},
            plugins = oArg.plugins || [];
        i.prototype = superClass.prototype;
        var construct = oArg.construct || function() {},
            properties = oArg.properties || {},
            methods = oArg.methods || {},
            statics = oArg.statics || {},
            o = new i;
        for (var p in o) o.hasOwnProperty(p) && delete o[p];
        for (var p in properties) o[p] = properties[p];
        for (var p in methods) o[p] = methods[p];
        for (var q = 0; q < plugins.length; q++) {
            var r = plugins[q];
            for (var p in r) o[p] = r[p]
        }
        o.constructor = construct, o.superclass = superClass, o.superinstance = new i, o.__NAME__ = clsName, construct.prototype = o;
        for (var p in statics) construct[p] = statics[p];
        return e && Namespace(e, construct), construct
    };

    function extend(dest, src, callback) {
        callback = callback || function() {
            return !0
        };
        for (var d in src) src.hasOwnProperty(d) && callback(dest[d], src[d]) && (dest[d] = src[d]);
        return dest
    }

    /**
     * 时间格式化 返回格式化的时间
     * @param date {object}  可选参数，要格式化的data对象，没有则为当前时间
     * @param fomat {string} 格式化字符串，例如：'YYYY年MM月DD日 hh时mm分ss秒 星期' 'YYYY/MM/DD week' (中文为星期，英文为week)
     * @return {string} 返回格式化的字符串
     * 
     * 例子:
     * formatDate(new Date("january 01,2012"));
     * formatDate(new Date());
     * formatDate('YYYY年MM月DD日 hh时mm分ss秒 星期 YYYY-MM-DD week');
     * formatDate(new Date("january 01,2012"),'YYYY年MM月DD日 hh时mm分ss秒 星期 YYYY/MM/DD week');
     * 
     * 格式：   
     *    YYYY：4位年,如1993
     *　　YY：2位年,如93
     *　　MM：月份
     *　　DD：日期
     *　　hh：小时
     *　　mm：分钟
     *　　ss：秒钟
     *　　星期：星期，返回如 星期二
     *　　周：返回如 周二
     *　　week：英文星期全称，返回如 Saturday
     *　　www：三位英文星期，返回如 Sat
     */
    function formatDate(date, format) {
        if (arguments.length < 2 && !date.getTime) {
            format = date;
            date = new Date();
        }
        typeof format != 'string' && (format = 'YYYY年MM月DD日 hh时mm分ss秒');
        var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六'];
        return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|星期|周|www|week/g, function(a) {
            switch (a) {
                case "YYYY":
                    return date.getFullYear();
                case "YY":
                    return (date.getFullYear() + "").slice(2);
                case "MM":
                    return ("0" + (date.getMonth() + 1)).slice(-2);
                case "DD":
                    return ("0" + date.getDate()).slice(-2);
                case "hh":
                    return ("0" + date.getHours()).slice(-2);
                case "mm":
                    return ("0" + date.getMinutes()).slice(-2);
                case "ss":
                    return ("0" + date.getSeconds()).slice(-2);
                case "星期":
                    return "星期" + week[date.getDay() + 7];
                case "周":
                    return "周" + week[date.getDay() + 7];
                case "week":
                    return week[date.getDay()];
                case "www":
                    return week[date.getDay()].slice(0, 3);
            }
        });
    }

    var f = win,
        storage = {},
        StorageUtil = {
            remove: function(key) {
                delete storage[key]
            },
            read: function(key) {
                return storage[key]
            },
            write: function(key, value) {
                storage[key] = value
            }
        },
        globalKey = "QInfo",
        buffer = [],
        capacity = 300,
        n = {
            moduleName: "",
            date: "",
            message: "",
            tpl: "",
            level: ""
        },
        format = function() {
            var d = 1,
                args = arguments;
            return args[0].replace(/%[sdj%]/g, function() {
                return String(args[d++]);
            });
        },
        formatMessage = function(a) {
            for (var b = [a.tpl, a.level, a.moduleName, formatDate(new Date(1 * a.date), "YYYY-MM-DD hh:mm:ss")], c = 0; c < a.message.length; c++) b.push(a.message[c]);
            var e = format.apply(null, b);
            return e
        },
        output = {
            log: function(a) {
                f.console && console.log && console.log(formatMessage(a))
            },
            info: function(a) {
                f.console && console.info && console.info(formatMessage(a))
            },
            debug: function(a) {
                f.console && console.debug && console.debug(formatMessage(a))
            },
            warn: function(a) {
                f.console && console.warn && console.warn(formatMessage(a))
            },
            error: function(a) {
                f.console && console.error && console.error(formatMessage(a))
            },
            flush: function(a) {
                this.log(formatMessage(a))
            }
        },
        InfoCenter = Class("InfoCenter", {
            construct: function(a) {
                a = a || {}, this._moduleName = a.moduleName || "Unknown", this._tmpl = a.tmpl || "[%s][%s][%s] >>> %s";
                var b = {};
                extend(b, output), extend(b, a.output || {}), this._output = b
            },
            methods: {
                _formatInfo: function(args, level) {
                    args = Array.prototype.slice.call(args);
                    var c = {};
                    for (var d in n) c[d] = n[d];
                    return c.moduleName = this._moduleName, c.date = (new Date).getTime(), c.message = args, c.tpl = this._tmpl, c.level = level, c
                },
                log: function() {
                    var a = this._formatInfo(arguments, "LOG");
                    this._writeLog(a), this._check() && this._output.log(a)
                },
                debug: function() {
                    var a = this._formatInfo(arguments, "DEBUG");
                    this._writeLog(a), this._check() && this._output.debug(a)
                },
                info: function() {
                    var a = this._formatInfo(arguments, "INFO");
                    this._writeLog(a), this._check() && this._output.info(a)
                },
                warn: function() {
                    var a = this._formatInfo(arguments, "WARN");
                    this._writeLog(a), this._check() && this._output.warn(a)
                },
                error: function() {
                    var a = this._formatInfo(arguments, "ERROR");
                    this._writeLog(a), this._check() && this._output.error(a)
                },
                _writeLog: function(a) {
                    a && (buffer.length >= capacity && buffer.splice(0, 1), buffer.push(a), this._save())
                },
                _save: function() {
                    StorageUtil.remove(globalKey), StorageUtil.write(globalKey, JSON.stringify(buffer))
                },
                _check: function() {
                    return f.enabled
                }
            }
        });

    var LOG = new InfoCenter({
            moduleName: "EventPlugin"
        }),
        EventPlugin = Class("EventPlugin", {
            construct: function() {},
            methods: {
                on: function(evType, listener) {
                    this._ep_createList();
                    var realListener = function(e) {
                        listener(e)
                    };
                    return evType = evType.toLowerCase(), this._ep_lists[evType] = this._ep_lists[evType] || [], this._ep_lists[evType].push({
                        type: evType,
                        listener: listener,
                        realListener: realListener
                    }), LOG.debug("on | " + this.__NAME__ + " | " + evType + " | list length : " + this._ep_lists[evType].length), this
                },
                un: function(evType, listener) {
                    if (this._ep_createList(), evType) {
                        evType = evType.toLowerCase();
                        var n = this._ep_lists[evType];
                        if (n) {
                            var a = (n.length, !listener);
                            n && n.length > 0 && (a ? this._ep_lists[evType] = [] : n.forEach(function(e, a) {
                                e && e.listener === listener && (n[a] = null)
                            }))
                        }
                    } else this._ep_clearList();
                    return this
                },
                fire: function(e) {
                    this._ep_createList();
                    var evType = e.type.toLowerCase(),
                        data = e.data,
                        i = this._ep_lists[evType];
                    return i && i.length > 0 && i.forEach(function(e) {
                        try {
                            e && e.listener && e.listener({
                                type: evType,
                                data: data
                            })
                        } catch (i) {
                            LOG.log("eventPluginFireError---eventType is :" + evType + " ;error message: " + i.message)
                        }
                    }), this
                },
                _ep_clearList: function() {
                    this._ep_lists = null
                },
                _ep_createList: function() {
                    this._ep_lists || (this._ep_lists = {})
                }
            }
        });

    var evLists = {
            domListeners: [], //待实现
            customListeners: {}
        },
        customListeners = evLists.customListeners,
        bind = function(a, b, c) {
            b = b.replace(/^on/i, "");
            var e = function(a) {
                c(a)
            };
            return b = b.toLowerCase(), d[b] = d[b] || [], d[b].push({
                type: b,
                listener: c,
                realListener: e
            }), a
        },
        unbind = function(a, b, c) {
            b = b.replace(/^on/i, "").toLowerCase();
            var e = d[b];
            if (e) {
                var f = (e.length, !c);
                return e && e.length > 0 && (1 == f ? d[b] = [] : e.forEach(function(a, b) {
                    a.listener === c && e.splice(b, 1)
                })), a
            }
        },
        fire = function(a, b) {
            var c = b.type.replace(/^on/i, "").toLowerCase();
            if (a.filters && -1 == a.filters.indexOf(c)) return a;
            var e = b.data,
                f = d[c];
            return f && f.length > 0 && f.forEach(function(a) {
                try {
                    a.listener({
                        type: c,
                        data: e
                    })
                } catch (b) {}
            }), a
        },
        CustomEvent = Class("CustomEvent", {
            methods: {
                filter: function(a) {
                    this.filters = a
                },
                on: function(a, b) {
                    bind(this, a, b)
                },
                un: function(a, b) {
                    unbind(this, a, b)
                },
                fire: function(a) {
                    fire(this, a)
                }
            }
        });
    win.MT = win.MT || {}, win.MT.Class = Class, win.MT.ic = win.MT.ic || {}, win.MT.ic.InfoCenter = InfoCenter, win.MT.EventPlugin = EventPlugin;
}(window, document);
