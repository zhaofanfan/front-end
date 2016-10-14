/*
 Ajax 三级省市联动
 http://code.ciaoca.cn/
 日期：2012-7-18
 
 settings 参数说明
 -----
 provUrl: 请求省份的接口
 cityUrl: 请求城市/地区的接口
 prov: 默认省份编码
 provName: 默认省份
 city: 默认城市编码
 cityName: 默认城市
 dist: 默认地区（县）编码
 distName: 默认地区（县）
 required: 必选项
 ------------------------------ */
(function($) {
    $.fn.citySelect = function(settings) {
        if (this.length < 1) {
            return;
        }

        // 默认值
        settings = $.extend({
            provUrl: null,
            cityUrl: null,
            prov: null,
            provName: null,
            city: null,
            cityName: null,
            dist: null,
            distName: null,
            required: true
        }, settings);
        
        var box_obj = this;
        var prov_obj = box_obj.find(".prov");
        var city_obj = box_obj.find(".city");
       	var dist_obj = box_obj.find(".dist");
        var prov_val = settings.prov;
        var city_val = settings.city;
        var dist_val = settings.dist;
        //var select_prehtml = (settings.required) ? "" : "<option value=''>请选择</option>";
        //始终保留一个空option，没值情况下select始终拿第一个option的值
        var select_prehtml = "<option value=''>请选择</option>";
        var prov_json;

        // 赋值市级函数
        var cityStart = function(bInitialize) {
            //var prov_id = prov_obj.get(0).selectedIndex;
            
            city_obj.empty().attr("disabled", true);
            dist_obj.empty().attr("disabled", true);
            city_obj.next().text('请选择城市');
            dist_obj.next().text('请选择地区');

            $.ajax({ 
                url: settings.cityUrl,
                type: 'POST',
				data: {areaNo: prov_obj.val()},
                dataType: 'json',  
                success: function(city_json) {      
                    // 遍历赋值市级下拉列表
                    temp_html = select_prehtml;
                    
                    var cityName = null;
                    city_json != null && $.each(city_json, function(i, city) {
                        temp_html += "<option value='" + city.areaNo + "'>" + city.areaName + "</option>";
                        city.areaNo == settings.city && (cityName = city.areaName);
                    });
                    city_obj.html(temp_html).attr("disabled", false).css({"display": "", "visibility": ""});

                    if (bInitialize) {
                    	city_obj.val('');
                    	if (cityName) {
                    		city_obj.val(settings.city);
                    		city_obj.next().text(cityName);
                    		$.addToolTip(city_obj.next());
                    	}
                        distStart(!0);   
                    }
                }
            });
        };

        // 赋值地区（县）函数
        var distStart = function(bInitialize) {
			if (!dist_obj.length) return;

            //var city_id = city_obj.get(0).selectedIndex;
          	
            dist_obj.empty().attr("disabled", true);
            dist_obj.next().text('请选择地区');
            !!city_obj.val() && $.ajax({ 
                url: settings.cityUrl,
                type: 'POST',
				data: {areaNo: city_obj.val()},
                dataType: 'json',  
                success: function(dist_json) {
                    // 遍历赋值市级下拉列表
                    temp_html = select_prehtml;

                    var distName = null;
                    dist_json != null && $.each(dist_json, function(i, dist) {
                        temp_html += "<option value='" + dist.areaNo + "'>" + dist.areaName + "</option>";
                        dist.areaNo == settings.dist && (distName = dist.areaName);
                    });
                    dist_obj.html(temp_html).attr("disabled", false).css({"display": "", "visibility": ""});

                    if (bInitialize && distName) {
                        dist_obj.val(settings.dist);
                        dist_obj.next().text(distName);
                        $.addToolTip(dist_obj.next());
                    }
                }
            });
        };

        var init = function() {
            // 遍历赋值省份下拉列表
            temp_html = select_prehtml;

            var provName = null;
            $.each(prov_json, function(i, prov) {
                temp_html += "<option value='" + prov.areaNo + "'>" + prov.areaName + "</option>";
                prov.areaNo == settings.prov && (provName = prov.areaName);
            });
            prov_obj.html(temp_html);

            // 若有传入省份与市级的值，则选中。（setTimeout为兼容IE6而设置）
            setTimeout(function() {
                if (settings.prov != null) {
                    prov_obj.val(settings.prov);
                    prov_obj.next().text(provName || settings.provName);
                    $.addToolTip(prov_obj.next());
                    cityStart(!0);
                }
            }, 1);

            // 选择省份时发生事件
            prov_obj.bind("change", function() {
                cityStart();
            });

            // 选择市级时发生事件
            city_obj.bind("change", function() {
                distStart();
            });
        };

        // 设置省市json数据
        if (typeof (settings.provUrl) == "string") {
            $.ajax({ 
                url: settings.provUrl,
                type: 'GET',
                dataType: 'json',  
                success: function(json) {
                    prov_json = json;
                    !!prov_json && init();
                }
            });
        }
    };
})(jQuery);

/*
 Ajax无刷新分页插件
 日期：2015-9-20
 
 settings 参数说明
 -----
 url： {String} 请求数据的接口
 page：{Number} 请求第几页的数据
 queryParam: {Object} 请求的一些额外参数
 container: {Object} 数据填充的容器jQuery对象
 rowTpl: {String} 数据填充的模板
 firstColIsOrder: {Boolean} 第一列是否是序号列
 callback: {Function} 请求成功后的回调
 ------------------------------ */
! function($) {
    $.fn.ajaxPager = function(settings) {
        settings = $.extend({
            url: '',
            page: 1,
            queryParam: null,
            container: null,
            rowTpl: '',
            firstColIsOrder: !1,
            callback: function() {}
        }, settings || {});

        return this.each(function() {

            var me = $(this);
            var $table = settings['container'];
            var data = settings['queryParam'] || {};
            
            var $first = null;
            var $previous = null;
            var $next = null;
            var $last = null;
            var $totalCount = null;
            var $totalPage = null;
        
            function drawNavItems() {
                me.empty();
                var html = [];
                html.push('<div class="fl"><span>每页</span> ');
                html.push(  '<select class="ui_select ui_fm_select">');
                html.push(      '<option value="10">10</option>'); 
                html.push(      '<option value="20">20</option>');
                html.push(      '<option value="30">30</option>');
                html.push(      '<option value="50">50</option>');
                html.push(      '<option value="100">100</option>');
                html.push(  '</select> <span>条，</span>');
                html.push(  '<div class="total_item">共<i>0</i>条/<i>0</i>页</div>');
                html.push('</div>'); 
                html.push('<div class="fr pager_area_right">'); 
                html.push(  '<span class="disabled">首页</span>');  
                html.push(  '<span class="disabled">上一页</span>');
                html.push(  '<input class="ui_input" value="1" />'); 
                html.push(  '<span class="disabled">下一页</span>');
                html.push(  '<span class="disabled">尾页</span>');
                html.push('</div>');
                 
                me.append(html.join(''));
                
                $table.width() > 0 && me.width($table.width() - 20 + 'px');

                $first = me.find('.pager_area_right span').eq(0);
                $previous = me.find('.pager_area_right span').eq(1);
                $next = me.find('.pager_area_right span').eq(2);
                $last = me.find('.pager_area_right span').eq(3);
                $totalCount = me.find('i').eq(0);
                $totalPage = me.find('i').eq(1);

                me.find('.ui_select').uiSelect();
                me.find('.ui_input').uiInput();
                
                var pageSize = settings['queryParam']['pageSize'];
                if (pageSize) {
                	me.find('select').val(pageSize);
                	me.find('select').next().text(pageSize);
                } else {
                	data['pageSize'] = me.find('select').val() || 10;
                }

                bindEvents();
                getData();
            }

            function updateNavItems(json) {
                var page = parseInt(json['pageIndex'], 10);
                var totalPage = parseInt(json['totalPage'], 10);

                page == 1 ? ($first.addClass('disabled'), $previous.addClass('disabled')) : ($first.removeClass('disabled'), $previous.removeClass('disabled'));
                (totalPage == 0 || page == totalPage) ? ($next.addClass('disabled'), $last.addClass('disabled')) : ($next.removeClass('disabled'), $last.removeClass('disabled'));

                me.find('input').data('page', page).val(page);
                $totalCount.html(json['totalCount']);
                $totalPage.html(totalPage);

                $first.attr('data-page', 1);
                $previous.attr('data-page', page - 1);
                $next.attr('data-page', page + 1);
                $last.attr('data-page', totalPage);
            }

            function bindEvents() {
                me.find('span').on('click', function() {
                    !$(this).hasClass('disabled') && getData(parseInt($(this).attr('data-page'), 10));
                });

                me.find('select').on('change', function() {
                    getData(1);
                });

                me.find('input').on('keydown', function(ev) {
                    if (ev.which == 13) {
                        var page = $(this).val();
                        var totalPage = parseInt($totalPage.html(), 10);
                        page && /^[1-9]\d*$/.test(page) && page != $(this).data('page') && page <= totalPage && getData(page); 
                    }
                });
            }

            function renderTable(json, rowTpl) {
                var aHtml = [];
                var page = json['pageIndex'];
                var pageSize = json['pageSize'];
                var data = json['data'];
                for (var i = 0; i < data.length; i++) {
                    var row = rowTpl;
                    settings['firstColIsOrder'] && (row = row.replace('{index}', (page - 1) * pageSize + i + 1));
                    row = $.formatString(row, data[i]);
                    aHtml.push(row.replace(/null/g, ''));
                }
                var $tbody = $table.find('tbody');
                !$tbody.length ? $table.append('<tbody/>') : $tbody.empty();
                $table.find('tbody').append(aHtml.join(''));
            }

            function getData(page) { 
                data['pageIndex'] = page || settings['page'] || 1;
                data['pageSize'] = me.find('select').val() || 10;
                var $modal = null;
                $.ajax({ 
                    url: settings['url'],
                    type: 'post',
                    data: data,
                    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                    dataType: 'json', 
                    beforeSend: function() {
                    	if (settings['beforeSend']) {
                    		settings['beforeSend']();
                    	} else {
                       /* 	$modal = $.topDialog({
                            	'width':40,
                                'height':40
                            }).showModal(); */
                    		var cssObj = {
                    			message: '<i class="loading-gif"></i>',
                    			css: {
	                    	        //margin: '-32px',
	                    	        width: 'auto',
	                    	        top: '50%',
	                    	        left: '50%',
	                    	        border: 'none',
	                    	        backgroundColor: 'transparent'
                				}
                    		};
                    		!$table.find('tbody').children().length ? $.blockUI(cssObj) : $table.block(cssObj);
                        }
                    },
                    success: function(json) {
                    	$table.find('tbody').empty();
                        $table.next('.ui_list_none').remove();
                        if (json == null || !json['data'] || !json['data'].length) {
                        	$table.after('<div class="ui_list_none"><span class="tip">暂时没有数据</span></div>');
                        } else {
                    		renderTable(json, settings['rowTpl']);
                    		updateNavItems(json);
                    	}

                        //$modal && $modal.close().remove();
                        $table.unblock(), $.unblockUI();
                        settings['callback'] && settings['callback']();
                        //鼠标悬浮显示全称
                        var ellipsis = $(".ellipsis", $table);
                        $.each(ellipsis, function() {
                            if (this.scrollWidth > this.offsetWidth) {
                                //超出
                                $(this).hover(function() {
                                    var top = $(this).offset().top + $(this).height();
                                    var left = $(this).offset().left + $(this).width() / 2;
                                    $(this).after('<p class="xgd_tooltip" style="top:' + top + 'px;left:' + left + 'px;">' + $(this).html() + '</p>');
                                }, function() {
                                    $(this).next().remove();
                                })
                            }
                        });
                    },
                    error: function() {}
                });  
            }

            drawNavItems();
        });
    }
}(jQuery);


/*
 autoComplete插件
 日期：2015-10-12
 
 options 参数说明
 -----
 delay：{Number} keyup事件的触发间隔
 max：{Number} 最多返回多少条记录
 scroll: {Boolean} 列表项是否有滚动条
 scrollHeight: {Number} 有滚动条时列表项的最大高度
 dependElem: {Object} 依赖的元素
 clearOnBlur：{Boolean} 无匹配结果时失去焦点清空输入
 ------------------------------ */
;(function($) {

    $.fn.extend({
        autoComplete: function(options) {
            options = $.extend({}, $.Autocompleter.defaults, {
                delay: $.Autocompleter.defaults.delay,
                max: options && !options.scroll ? 10 : 150,
                dependElem: null,
                clearOnBlur: true
            }, options);

            return this.each(function() {
                new $.Autocompleter(this, options);
            });
        }
    });

    $.Autocompleter = function(input, options) {

        var KEY = {
            ENTER: 13,
            UP: 38,
            DOWN: 40,
            DEL: 46,
            ESC: 27,
            PAGEUP: 33,
            PAGEDOWN: 34,
            SPACE: 32
        };

        // Create $ object for input element
        var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);
        
        var initialValue = options['initialValue'];
        !!initialValue ? 'string' == typeof initialValue ? $input.val(initialValue) : ($input.val(initialValue['text']), $input.attr('ac_data', JSON.stringify(initialValue))) : '';

        var timeout;
        var previousValue = "";
        var hasFocus = 0;
        var lastKeyPressCode;
        var config = {
            mouseDownOnSelect: false
        };

        var select = $.Autocompleter.Select(options, input, selectCurrent, config);

        // only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
        $input.bind("keyup.autocomplete", function(event) {
            // a keypress means the input has focus
            // avoids issue where input had focus before the autocomplete was applied
            hasFocus = 1;
            // track last key pressed
            lastKeyPressCode = event.keyCode;
            switch (event.keyCode) {

                case KEY.UP:
                    event.preventDefault();
                    if (select.visible()) {
                        select.prev();
                    } else {
                        onChange();
                    }
                    break;

                case KEY.DOWN:
                    event.preventDefault();
                    if (select.visible()) {
                        select.next();
                    } else {
                        onChange();
                    }
                    break;

                case KEY.PAGEUP:
                    event.preventDefault();
                    if (select.visible()) {
                        select.pageUp();
                    } else {
                        onChange();
                    }
                    break;

                case KEY.PAGEDOWN:
                    event.preventDefault();
                    if (select.visible()) {
                        select.pageDown();
                    } else {
                        onChange();
                    }
                    break;

                case KEY.ENTER:
                    if (select.visible()) {
                        event.preventDefault();
                        selectCurrent();
                    }
                    break;

                case KEY.ESC:
                    select.hide();
                    break;

                default:
                    clearTimeout(timeout);
                    timeout = setTimeout(onChange, options.delay);
                    break;
            }
        }).focus(function() {
            hasFocus++;
        }).blur(function() {
            hasFocus = 0;

            //options.clearOnBlur && select.hasNoResult() && $(this).val('');
            options.clearOnBlur && !$(this).attr('ac_data') && $(this).val('');

            if (!config.mouseDownOnSelect) {
                hideResults();
            }
        }).click(function() {
            if (hasFocus++ > 1 && !select.visible()) {
                onChange();
            }
        });

        function selectCurrent() {
            var selected = select.selected();
            if (!selected)
                return false;

            var v = selected.text;
            previousValue = v;

            $input.attr("ac_data", JSON.stringify(selected));
            $input.val(v);
            options.onSelect && options.onSelect.apply($input);
            hideResultsNow();
            return true;
        }

        function onChange() {
            if (lastKeyPressCode == KEY.DEL) {
                select.hide();
                return;
            }

            var currentValue = $input.val();

            //if (currentValue == previousValue)
                //return;

            previousValue = currentValue;

            if (currentValue.length >= options.minChars) {
                $input.addClass(options.loadingClass);
                if (!options.matchCase)
                    currentValue = currentValue.toLowerCase();
                $input.removeAttr('ac_data');
                request(currentValue, receiveData, hideResultsNow);
            } else {
                stopLoading();
                select.hide();
            }
        }

        function hideResults() {
            clearTimeout(timeout);
            timeout = setTimeout(hideResultsNow, 200);
        }

        function hideResultsNow() {
            select.hide();
            clearTimeout(timeout);
            stopLoading();
        }

        function receiveData(q, data) {
/*          if (data && data.length && hasFocus) {
                stopLoading();
                select.display(data, q);
                select.show();
            } else {
                hideResultsNow();
            }   */

            if (hasFocus) {
                stopLoading();
                select.display(data, q);
                !!data && !!data.length && select.show();
            }
        }

        function request(term, success, failure) {
            if (!options.matchCase)
                term = term.toLowerCase();
            if ((typeof options.url == "string") && (options.url.length > 0)) {

                var extraParams = {
                    timestamp: +new Date()
                };
                $.each(options.extraParams, function(key, param) {
                    extraParams[key] = typeof param == "function" ? param() : param;
                });

                if (options.dependElem) {
                    extraParams['parentCode'] = options.dependElem.val();
                    var cache = options.dependElem.attr('ac_data') ? JSON.parse(options.dependElem.attr('ac_data')) : null;
                    !!cache && (extraParams['parentCode'] = cache['code'] || cache['text']);
                }
                $.ajax({
                    url: options.url,
                    type: 'POST',
                    data: $.extend({
                        keyWord: $.trim(term),
                        limit: options.max
                    }, extraParams),
                    dataType: 'json',
                    success: function(data) {
                        success(term, data);
                    }
                });
            }
        }

        function stopLoading() {
            $input.removeClass(options.loadingClass);
        }
    };

    $.Autocompleter.defaults = {
        inputClass: "ac_input",
        resultsClass: "ac_results",
        loadingClass: "ac_loading",
        minChars: 1,
        delay: 200,
        matchCase: false,
        max: 100,
        extraParams: {},
        selectFirst: true,
        width: 0,
        scroll: false,
        scrollHeight: 180
    };

    $.Autocompleter.Select = function(options, input, select, config) {
        var CLASSES = {
            ACTIVE: "ac_over"
        };

        var listItems,
            active = -1,
            data,
            term = "",
            needsInit = true,
            element,
            list;

        // Create results
        function init() {
            if (!needsInit)
                return;
            element = $("<div/>")
                .hide()
                .addClass(options.resultsClass)
                .css("position", "absolute")
                .appendTo(document.body);

            list = $("<ul/>").appendTo(element).mouseover(function(event) {
                if (target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
                    active = $("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
                    $(target(event)).addClass(CLASSES.ACTIVE);
                }
            }).mouseout(function() {
            	$("li", list).removeClass(CLASSES.ACTIVE);
            }).click(function(event) {
                $(target(event)).addClass(CLASSES.ACTIVE);
                select();
                input.focus();
                return false;
            }).mousedown(function() {
                config.mouseDownOnSelect = true;
            }).mouseup(function() {
                config.mouseDownOnSelect = false;
            });

            if (options.width > 0)
                element.css("width", options.width);

            needsInit = false;
        }

        function target(event) {
            var element = event.target;
            while (element && element.tagName != "LI")
                element = element.parentNode;
            return element || [];
        }

        function moveSelect(step) {
            listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
            movePosition(step);
            var activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
            if (options.scroll) {
                var offset = 0;
                listItems.slice(0, active).each(function() {
                    offset += this.offsetHeight;
                });
                if ((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
                    list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
                } else if (offset < list.scrollTop()) {
                    list.scrollTop(offset);
                }
            }
        }

        function movePosition(step) {
            active += step;
            if (active < 0) {
                active = listItems.size() - 1;
            } else if (active >= listItems.size()) {
                active = 0;
            }
        }

        function limitNumberOfItems(available) {
            return options.max && options.max < available ? options.max : available;
        }

        function fillList() {
            if (!data || !data.length) {
                //$('<li>未匹配到结果</li>').appendTo(list);
                return;
            }
			
            list.empty();
            var max = limitNumberOfItems(data.length);
            for (var i = 0; i < max; i++) {
                if (!data[i])
                    continue;
                var li = $("<li/>").html(data[i].text).addClass(i % 2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
                $.data(li, "ac_data", data[i]);
            }
            listItems = list.find("li");
            if (options.selectFirst) {
                listItems.slice(0, 1).addClass(CLASSES.ACTIVE); 
                //$(input).attr("ac_data", JSON.stringify(listItems.slice(0, 1).data("ac_data")));
                active = 0;
            }
        }

        return {
            display: function(d, q) {
                init();
                data = d;
                term = q;
                fillList();
            },
            hasNoResult: function() {
                return data && !data.length;
            },
            next: function() {
                moveSelect(1);
            },
            prev: function() {
                moveSelect(-1);
            },
            pageUp: function() {
                if (active != 0 && active - 8 < 0) {
                    moveSelect(-active);
                } else {
                    moveSelect(-8);
                }
            },
            pageDown: function() {
                if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
                    moveSelect(listItems.size() - 1 - active);
                } else {
                    moveSelect(8);
                }
            },
            hide: function() {
                element && element.hide();
                listItems && listItems.removeClass(CLASSES.ACTIVE);
                active = -1;
            },
            visible: function() {
                return element && element.is(":visible");
            },
            current: function() {
                return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
            },
            show: function() {
                var offset = $(input).offset();
                element.css({
                    width: typeof options.width == "string" || options.width > 0 ? options.width : $(input).outerWidth(true),
                    top: offset.top + input.offsetHeight - parseInt($(input).css('borderBottomWidth'), 10),
                    left: offset.left
                }).show();
                if (options.scroll) {
                    list.scrollTop(0);
                    list.css({
                        maxHeight: options.scrollHeight,
                        overflow: 'auto'
                    });
                }
            },
            selected: function() {
                var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
                return selected && selected.length && $.data(selected[0], "ac_data");
            },
            emptyList: function() {
                list && list.empty();
            },
            unbind: function() {
                element && element.remove();
            }
        };
    };
})(jQuery);

! function($) {
	$.fn.yearmonthpicker = function(options) {
		options = $.extend($.fn.yearmonthpicker.defaults, options);

		var formatDate = function(oDate, sFormat) {
		    var fillZero = function(num) {
		        return num += '', num.replace(/^(\d)$/, '0$1');
		    }
		    oDate = oDate || new Date;
		    var cfg = {
		        YYYY: oDate.getFullYear(),
		        YY:   oDate.getFullYear().toString().substring(2),
		        M:    oDate.getMonth() + 1,
		        MM:   fillZero(oDate.getMonth() + 1)
		    }
		    sFormat || (sFormat = options.format);
		    return sFormat.replace(/([A-Z])(\1)*/gi, function(key) {
		        return cfg[key.toUpperCase()];
		    });
		};

		var getDate = function(iYear, iMonth) {
			return new Date(iYear, iMonth - 1, 1);
		};

		var createYearMonthPicker = function(input) {
			var yearmonthpicker = $('<div class="yearmonthpicker"' + (options && options.id ? 'id="' + options.id + '"' : '') + '></div>'),
				yearpicker = $('<div class="year_container"><a href="javascript:;" class="year_prev"></a><div class="year_select"><span class="year"></span><ul class="year_list"></ul></div><a href="javascript:;" class="year_next"></a></div>'),
				monthpicker = $('<div class="month_container"><table><tbody></tbody></table></div>');

			var monthHtml = [];
			for (var i = 1; i < 13; i++) {
				monthHtml.push((i % 4 == 1 ? '<tr>' : '') + '<td><a data-month="' + i + '">' + i + '月</a></td>' + (i % 4 ? '' : '</tr>'));
			}
			monthpicker.find('tbody').append(monthHtml.join(''));

			var getCurrentYear = function() {
				return parseInt(yearpicker.find('.year').data('year'), 10);
			};

			var setPos = function () {
				var offset = input.offset(), top = offset.top + input[0].offsetHeight - 1, left = offset.left, position = "absolute";
				if (top + yearmonthpicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
					top = offset.top - yearmonthpicker[0].offsetHeight + 1;
				}
				if (top < 0) {
					top = 0;
				}
				if (left + yearmonthpicker[0].offsetWidth > $(window).width()) {
					left = $(window).width() - yearmonthpicker[0].offsetWidth;
				}
				
				yearmonthpicker.css({
					left: left,
					top: top,
					position: position
				});
			};

			var onClose = function() {
				var iYear = $('.year', yearpicker).data('year');
				var iMonth = $('a.active', monthpicker).data('month');
				input.val(formatDate(getDate(iYear, iMonth))); 
				input.data('open', false).blur();

				options.onChange.call(input);
				yearmonthpicker.remove();
				$(document).off('mousedown.ymp');
				$(window).off('resize.ymp', setPos);
			};

			var changeYear = function(iDelta) {
				if ($('.year', yearpicker).hasClass('open')) {
					$('.year', yearpicker).removeClass('open');
					$('.year_list', yearpicker).empty();
				}
				var iYear = getCurrentYear() + iDelta;
				yearpicker.find('.year').data('year', iYear).text(iYear);				
			};

			var oNow = new Date();
			var iYear = oNow.getFullYear();
			var iMonth = oNow.getMonth() + 1;

			if (input.val()) {
				var aMatch = input.val().match(/\d+/g);
				iYear = aMatch ? parseInt(aMatch[0], 10) : iYear;
				iMonth = aMatch ? parseInt(aMatch[1], 10) : iMonth;
			}

			yearpicker.find('.year').data('year', iYear).text(iYear);
			monthpicker.find('a[data-month=' + iMonth + ']').addClass('active');

			yearpicker.find('.year_prev').on('click', function() {
				changeYear(-1);
			});

			yearpicker.find('.year_next').on('click', function() {
				changeYear(1);
			});

			yearpicker.find('.year').click(function() {
				var iNow = parseInt($(this).data('year'), 10),
					yearFrom = iNow - 3,
					yearTo = iNow + 4,
					aHtml = [];
				for (var i = yearFrom; i < yearTo; i++)
					aHtml.push('<li data-year="'+ i + '">' + i +'</li>');

				$('.year_list', yearpicker).html(aHtml.join('')).show();
				$('.year', yearpicker).addClass('open');
				$('.year_list li', yearpicker).hover(function() {
					$(this).addClass('hover');
				}, function() {
					$(this).removeClass('hover');
				}).click(function() {
					var iYear = $(this).data('year');
					$('.year', yearpicker).removeClass('open').data('year', iYear).text(iYear);
					$(this).parent().empty().hide();
				});
			});

			monthpicker.find('tbody').on('click', 'a', function() {
				$('a.active', monthpicker).removeClass('active');
				$(this).addClass('active');
				onClose();
			});

			yearmonthpicker.append(yearpicker)
				.append(monthpicker);

			input.data('open', true);
			setPos();
			$('body').append(yearmonthpicker);

			$(document).off('mousedown.ymp').on('mousedown.ymp', function(e) {
				var oTarget = $(e.target);
				if (!oTarget.is(yearmonthpicker) && !oTarget.is(input) 
					&& !oTarget.closest(yearmonthpicker).length) {
					onClose();
				}
			});

			$(window).off('resize.ymp', setPos).on('resize.ymp', setPos);
		};

		return this.each(function() {
			options.isCurrent && $(this).val(formatDate());
			$(this).focus(function() {
				!$(this).is(':disabled') && !$(this).data('open') && createYearMonthPicker($(this));
			});
		});
	};
	$.fn.yearmonthpicker.defaults = {
		isCurrent: !0,
		format: 'yyyy年MM月',
		onChange: function() {}
	};
}(jQuery);