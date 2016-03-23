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