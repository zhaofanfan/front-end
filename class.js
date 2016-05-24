~ function(win, doc) {
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

    var f = win;
    var DefSuperClass = function() {},
        d = new Object;
    d.superclass = Object, d.__NAME__ = "Object", d.superinstance = new Object;
    d.callsuper = function(a) {
        var b = this;
        if (this._realsuper = this._realsuper ? this._realsuper.prototype.superclass : this.superclass, "string" == typeof a) {
            var args = Array.prototype.slice.call(arguments, 1);
            b._realsuper.prototype[a].apply(b, args)
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            b._realsuper.apply(b, args)
        }
        this._realsuper = null
    }, DefSuperClass.prototype = d;

    var Namespace = function(ns, obj2Mount, rootNs) {
        var nsName, nsNames = ns.split("."),
            max = nsNames.length - 1,
            index = 0;
        if (!rootNs) try {
            if (!new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*$").test(nsNames[0])) throw "";
            rootNs = new Function("return " + nsNames[0])(), index = 1
        } catch (i) {
            rootNs = win
        }
        for (; max > index; index++) nsName = nsNames[index], rootNs[nsName] || (rootNs[nsName] = {}), rootNs = rootNs[nsName];
        rootNs[nsNames[max]] || (rootNs[nsNames[max]] = obj2Mount)
    };

    var Class = function(clsName, oArg) {
        var ns = oArg.ns && oArg.ns + "." + clsName;
        if (ns) try {
            var cls = new Function("return " + ns)();
            if (cls) return cls
        } catch (g) {}
        var superClass = oArg.extend || DefSuperClass,
            fn = function() {},
            plugins = oArg.plugins || [];
        fn.prototype = superClass.prototype;
        var construct = oArg.construct || function() {},
            properties = oArg.properties || {},
            methods = oArg.methods || {},
            statics = oArg.statics || {},
            _proto_ = new fn;
        for (var property in _proto_) _proto_.hasOwnProperty(property) && delete _proto_[property];
        for (var property in properties) _proto_[property] = properties[property];
        for (var methodName in methods) _proto_[methodName] = methods[methodName];
        for (var index = 0; index < plugins.length; index++) {
            var plugin = plugins[index];
            for (var p in plugin) _proto_[p] = plugin[p]
        }
        _proto_.constructor = construct, _proto_.superclass = superClass, _proto_.superinstance = new fn, _proto_.__NAME__ = clsName, construct.prototype = _proto_;
        for (var p in statics) construct[p] = statics[p];
        return ns && Namespace(ns, construct), construct
    };

    function extend(dest, src, callback) {
        callback = callback || function() {
            return !0
        };
        for (var property in src) src.hasOwnProperty(property) && callback(dest[property], src[property]) && (dest[property] = src[property]);
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

    function jsonToQuery(json) {
        var key, value, ret = [];
        for (key in json) {
            key = encodeURIComponent(key);
            value = json[key];
            if (value && value.constructor == Array) {
                var queryValues = [];
                for (var i = 0, len = value.length, val; i < len; i++) {
                    val = value[i];
                    queryValues.push(key + '=' + encodeURIComponent(!val ? '' : String(val)));
                }
                ret = ret.concat(queryValues);
            } else {
                ret.push(key + '=' + encodeURIComponent(!value ? '' : String(value)));
            }
        }
        return ret.join('&');
    }

    var storage = {},
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
        opts = {
            moduleName: "",
            date: "",
            message: "",
            tpl: "",
            level: ""
        },
        format = function() {
            var pivot = 1,
                args = arguments;
            return args[0].replace(/%[sdj%]/g, function(a) {
                switch (a) {
                    case "%s":
                        return String(args[pivot++]);
                    case "%d":
                        return Number(args[pivot++]);
                    case "%j":
                        return JSON.stringify(args[pivot++]);
                    case "%%":
                        return "%";
                    default:
                        return a
                }
            });
        },
        formatMessage = function(msgObj) {
            for (var vArgs = [msgObj.tpl, msgObj.level, msgObj.moduleName, formatDate(new Date(1 * msgObj.date), "YYYY-MM-DD hh:mm:ss")], index = 0; index < msgObj.message.length; index++) vArgs.push(msgObj.message[index]);
            return format.apply(null, vArgs);
        },
        output = {
            log: function(msgObj) {
                f.console && console.log && console.log(formatMessage(msgObj))
            },
            info: function(msgObj) {
                f.console && console.info && console.info(formatMessage(msgObj))
            },
            debug: function(msgObj) {
                f.console && console.debug && console.debug(formatMessage(msgObj))
            },
            warn: function(msgObj) {
                f.console && console.warn && console.warn(formatMessage(msgObj))
            },
            error: function(msgObj) {
                f.console && console.error && console.error(formatMessage(msgObj))
            },
            flush: function(msgObj) {
                this.log(formatMessage(msgObj))
            }
        },
        InfoCenter = Class("InfoCenter", {
            construct: function(opt) {
                opt = opt || {}, this._moduleName = opt.moduleName || "Unknown", this._tmpl = opt.tmpl || "[%s][%s][%s] >>> %s";
                var _output = {};
                extend(_output, output), extend(_output, opt.output || {}), this._output = _output
            },
            methods: {
                _formatInfo: function(args, level) {
                    args = Array.prototype.slice.call(args);
                    var msgObj = {};
                    for (var key in opts) msgObj[key] = opts[key];
                    return msgObj.moduleName = this._moduleName, msgObj.date = (new Date).getTime(), msgObj.message = args, msgObj.tpl = this._tmpl, msgObj.level = level, msgObj
                },
                log: function() {
                    var msgObj = this._formatInfo(arguments, "LOG");
                    this._writeLog(msgObj), this._check() && this._output.log(msgObj)
                },
                debug: function() {
                    var msgObj = this._formatInfo(arguments, "DEBUG");
                    this._writeLog(msgObj), this._check() && this._output.debug(msgObj)
                },
                info: function() {
                    var msgObj = this._formatInfo(arguments, "INFO");
                    this._writeLog(msgObj), this._check() && this._output.info(msgObj)
                },
                warn: function() {
                    var msgObj = this._formatInfo(arguments, "WARN");
                    this._writeLog(msgObj), this._check() && this._output.warn(msgObj)
                },
                error: function() {
                    var msgObj = this._formatInfo(arguments, "ERROR");
                    this._writeLog(msgObj), this._check() && this._output.error(msgObj)
                },
                setTmpl: function(tmpl) {
                    return this._tmpl = tmpl, this
                },
                _writeLog: function(msgObj) {
                    msgObj && (buffer.length >= capacity && buffer.splice(0, 1), buffer.push(msgObj), this._save())
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
                on: function(type, listener) {
                    this._ep_createList();
                    var realListener = function(ev) {
                        listener(ev)
                    };
                    return type = type.toLowerCase(), this._ep_lists[type] = this._ep_lists[type] || [], this._ep_lists[type].push({
                        type: type,
                        listener: listener,
                        realListener: realListener
                    }), LOG.debug("on | " + this.__NAME__ + " | " + type + " | list length : " + this._ep_lists[type].length), this
                },
                un: function(type, listener) {
                    if (this._ep_createList(), type) {
                        type = type.toLowerCase();
                        var evLists = this._ep_lists[type];
                        if (evLists) {
                            var isRemoveAll = (evLists.length, !listener);
                            evLists && evLists.length > 0 && (isRemoveAll ? this._ep_lists[type] = [] : evLists.forEach(function(obj, index) {
                                obj && obj.listener === listener && (evLists[index] = null)
                            }))
                        }
                    } else this._ep_clearList();
                    return this
                },
                fire: function(ev) {
                    this._ep_createList();
                    var type = ev.type.toLowerCase(),
                        data = ev.data,
                        evLists = this._ep_lists[type];
                    return evLists && evLists.length > 0 && evLists.forEach(function(obj) {
                        try {
                            obj && obj.listener && obj.listener({
                                type: type,
                                data: data
                            })
                        } catch (i) {
                            LOG.log("eventPluginFireError---eventType is :" + type + " ;error message: " + i.message)
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
        bind = function(customEvtInstance, type, listener) {
            type = type.replace(/^on/i, "");
            var realListener = function(ev) {
                listener(ev)
            };
            return type = type.toLowerCase(), customListeners[type] = customListeners[type] || [], customListeners[type].push({
                type: type,
                listener: listener,
                realListener: realListener
            }), customEvtInstance
        },
        unbind = function(customEvtInstance, type, listener) {
            type = type.replace(/^on/i, "").toLowerCase();
            var evLists = customListeners[type];
            if (evLists) {
                var isRemoveAll = (evLists.length, !listener);
                return evLists && evLists.length > 0 && (1 == isRemoveAll ? customListeners[type] = [] : evLists.forEach(function(customEvt, index) {
                    customEvt.listener === listener && evLists.splice(index, 1)
                })), customEvtInstance
            }
        },
        fire = function(customEvtInstance, ev) {
            var type = ev.type.replace(/^on/i, "").toLowerCase();
            if (customEvtInstance.filters && -1 == customEvtInstance.filters.indexOf(type)) return customEvtInstance;
            var data = ev.data,
                evLists = customListeners[type];
            return evLists && evLists.length > 0 && evLists.forEach(function(customEvt) {
                try {
                    customEvt.listener({
                        type: type,
                        data: data
                    })
                } catch (b) {}
            }), customEvtInstance
        },
        CustomEvent = Class("CustomEvent", {
            methods: {
                filter: function(type) {
                    return this.filters = type, this
                },
                on: function(type, listener) {
                    return bind(this, type, listener)
                },
                un: function(type, listener) {
                    return unbind(this, type, listener)
                },
                fire: function(ev) {
                    return fire(this, ev)
                }
            }
        });

    var prefix = "window.MT.__callbacks__.",
        preprocess = function(url) {
            return RegExp("\\?").test(url) ? "&" : "?"
        },
        createScript = function(url, charset) {
            var script = document.createElement("SCRIPT");
            return script.setAttribute("type", "text/javascript"), charset && script.setAttribute("charset", charset), script.setAttribute("src", url), document.getElementsByTagName("head")[0].appendChild(script), script
        },
        removeScript = function(script) {
            script.clearAttributes && script.clearAttributes(), script && script.parentNode && script.parentNode.removeChild(script), script = null
        },
        jsonp = function(url, opt) {
            var timer, script, realUrl, rootNs, data = extend({}, opt.data),
                timeout = opt.timeout || 1e4,
                onsuccess = opt.onsuccess || function() {},
                onfailure = opt.onfailure || function() {},
                callbackName = opt.jsonpCallback || "cb" + Math.floor(2147483648 * Math.random()).toString(36),
                callback = opt.jsonp || "callback",
                namespace = opt.jsonp ? "" : prefix;
            rootNs = opt.jsonp ? f : MT.__callbacks__ = MT.__callbacks__ || {}, onsuccess && (data[callback] = namespace + callbackName, rootNs[callbackName] = function(data) {
                timer && clearTimeout(timer), onsuccess(data), delete rootNs[callbackName], removeScript(script)
            }, realUrl = url + preprocess(url) + jsonToQuery(data)), script = createScript(realUrl, opt.charset), timer = setTimeout(function() {
                removeScript(script), onfailure()
            }, timeout)
        };

    f.MT = f.MT || {}, f.MT.Class = Class, f.MT.ic = f.MT.ic || {}, f.MT.ic.InfoCenter = InfoCenter, f.MT.EventPlugin = EventPlugin, f.MT.customEvent = new CustomEvent, f.jsonp = jsonp;
}(window, document);

(function(e) {
    var UUID = function() {
            var uuid = 1;
            return function() {
                return uuid++
            }
        }(),
        ieStore = function() {
            var __NAME__ = "local_storage";
            return {
                _store: null,
                _getStore: function() {
                    if (!this._store) {
                        try {
                            this._store = document.createElement("input");
                            this._store.type = "hidden";
                            this._store.addBehavior("#default#userData");
                            document.body.appendChild(this._store)
                        } catch (e) {
                            var t = [];
                            for (var n in e) {
                                t.push(n + ": " + e[n])
                            }
                            document.title = t.join("\n");
                            return false
                        }
                    }
                    return this._store
                },
                get: function(name) {
                    var _store = this._getStore();
                    if (!_store) return false;
                    _store.load(__NAME__);
                    return _store.getAttribute(name)
                },
                add: function(obj) {
                    var _store = this._getStore();
                    if (!_store) return false;
                    _store.load(__NAME__);
                    _store.setAttribute(obj.name, obj.value);
                    _store.save(__NAME__)
                },
                remove: function(name) {
                    var _store = this._getStore();
                    if (!_store) return false;
                    _store.load(__NAME__);
                    _store.removeAttribute(name);
                    _store.save(__NAME__)
                },
                clear: function() {
                    var _store = this._getStore();
                    if (!_store) return false;
                    var doc = _store.XMLDocument;
                    var node = doc.selectSingleNode("ROOTSTUB");
                    for (var i = 0; i < node.attributes.length; ++i) {
                        var attribute = node.attributes[i];
                        _store.removeAttribute(attribute.baseName)
                    }
                    _store.save(__NAME__)
                }
            }
        }(),
        cookie = {
            add: function(obj) {
                if (obj.name) {
                    var str = obj.name + "=" + obj.value;
                    if (obj.expire) {
                        str += ";expires=" + (new Date((new Date).getTime() + obj.expire)).toGMTString()
                    }
                    if (obj.domain) {
                        str += ";domain=" + obj.domain
                    }
                    if (obj.path) {
                        str += ";path=" + obj.path
                    }
                    document.cookie = str
                }
            },
            remove: function(name, obj) {
                if (name) {
                    var str = name + "=1;expires=" + (new Date((new Date).getTime() - 864e5)).toGMTString();
                    obj = obj || {};
                    str += ";path=" + (obj.path || "/");
                    document.cookie = str;
                    return true
                }
                return false
            },
            get: function(name) {
                var t = document.cookie.split(/;\s*/),
                    index, map;
                for (index = 0; index < t.length; index++) {
                    map = t[index].split("=");
                    if (map[0] == name) {
                        return map[1]
                    }
                }
                return undefined
            }
        },
        store = {
            add: function(obj) {
                localStorage[obj.name] = obj.value
            },
            get: function(name) {
                return localStorage[name]
            },
            remove: function(name) {
                localStorage.removeItem(name)
            }
        },
        storage = e.localStorage ? store : ieStore;
    e.CookieUtil = cookie;
    e.StorageUtil = storage
})(window);
