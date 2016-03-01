var CONF = {
        reg: {
            nameFormat: "^[a-zA-Z]|[\\u4e00-\\u9fa5]$",
            phoneFormat: "^1[34578]\\d{9}$"
        },
        validMsg: {
            nullText: "格式错误，内容不能为空",
            accountNameText: "格式错误，姓名必须为字母或汉字的组合且不超过50个字符",
            phoneNumberText: "格式错误，请输入11位手机号",
            terminalNoText: "终端号",
            merchantCodeText: "商户号",
            subBranchText: "分店名称"
        },
        htmlTemplate: {
            sectionWrapperTpl: '<div class="section">{{rows}}</div>',
            rowTpl: '<ul class="row clearfix">' + 
                        '<li class="one"><span data-sid="{id}" class="ui_checkbox_box"><input type="checkbox" name=""></span></li>' + 
                        '<li class="two">{terminalNo}</li>' + 
                        '<li class="three">{merchantPrintNo}</li>' + 
                        '<li class="four">{merchantPrintName}</li>' + 
                    '</ul>'
        }
    },
    SubAccountUtil = {
        terminalContainerId: 'wrap',
        pageSize: 10,
        originalData: (function() {
            var i = 0;
            var data = [];
            while (i < 2500) {
                data.push({
                    terminalNo: '80006365', merchantPrintNo: '849441357145001', merchantPrintName: '深圳南山分店'
                    }, {
                    terminalNo: '44444', merchantPrintNo: '1357145001', merchantPrintName: '深圳分店'
                });
                i++;
            }
            return data;
        })(),
        byteLength: function(str) {
            return (str || "").replace(/[^\x00-\xff]/g, "00").length;
        },
        isValidName: function(name) {
            return new RegExp(CONF.reg.nameFormat).test(name) && this.byteLength(name) <= 50
        },
        isValidMobile: function(mobile) {
            return new RegExp(CONF.reg.phoneFormat).test(mobile)
        },
        filter: function(dataArr, filterKey, filterVal) {
            if (!filterVal) return this.originalData;
            var i,
                len = dataArr.length,
                obj,
                retArr = [];
            for (i = 0; len > i; i++) {
                obj = dataArr[i];
                (obj[filterKey] && obj[filterKey].indexOf(filterVal) > -1) && retArr.push(obj);
            }
            return retArr;
        },
        formatString: function(obj, tpl) {
            var result = String(tpl);
            for (var key in obj)
                result = result.replace(new RegExp('\{' + key + '\}', 'gm'), obj[key] || '');
            return result;
        },
        showOrHide: function() {
            $.getUrlParam = function(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null)
                    return unescape(r[2]);
                return null;
            };
            var sAction = $.getUrlParam('action');
            if ('modify' === sAction) {
                $('.alias_block').removeClass('display_ib').addClass('hide');
                $('.status_block').removeClass('hide').addClass('display_ib');
                $('.modify_alias_block').removeClass('hide');
                $('.phone_number_block').addClass('hide');
            }
        },
        polyfillPlaceholder: function() {
            $('input.box').each(function() {
                $(this).val(CONF.validMsg[$(this).attr('name') + 'Text']);

                $(this).on('focus', function() {
                    $(this).val() == CONF.validMsg[$(this).attr('name') + 'Text'] && ($(this).val(''))
                }).on('blur', function() {
                    $(this).val().length <= 0 && ($(this).val(CONF.validMsg[$(this).attr('name') + 'Text']));
                    CONF.validMsg[$(this).attr('name') + 'Text'] == $(this).val() ? $(this).removeAttr('data-val') : $(this).attr('data-val', $(this).val())
                });
            });
        },
        bindEvent: function() {
            var me = this;
            $('#accountName').blur(function() {
                var sValue = this.value.replace(/\s+/g, '');
                if (!sValue) {
                    $(this).addFmErrorTip(CONF.validMsg.nullText);
                    return;
                }
                if (!me.isValidName(sValue)) {
                    $(this).addFmErrorTip(CONF.validMsg.accountNameText);
                    return;
                }
                this.value = sValue;
            });

            $('#phoneNumber').blur(function() {
                var sValue = this.value.replace(/\s+/g, '');
                if (!sValue) {
                    $(this).addFmErrorTip(CONF.validMsg.nullText);
                    return;
                }
                if (!me.isValidMobile(sValue)) {
                    $(this).addFmErrorTip(CONF.validMsg.phoneNumberText);
                    return;
                }
                this.value = sValue;
            });

            $('#terminalBox .thead .btn').click(function() {
                var filterVal = $(this).prev('input.box').attr('data-val');
                var retData = me.filter(me.originalData, $(this).attr('data-filter-key'), filterVal);
                me.render(retData);
            })
        },
        bindCheckBox: function() {
            $('#terminalBox .tbody .ui_checkbox_box').uiCheckbox();

            $('#selectAll').click(function() {
                var bChecked = $(this).children('input').is(':checked');
                var hCheckbox = $('#terminalBox .tbody .ui_checkbox_box');

                bChecked ?  hCheckbox.addClass('ui_checkbox_box_checked') : hCheckbox.removeClass('ui_checkbox_box_checked');
                hCheckbox.children('input').prop('checked', bChecked);  
            });

            $('#terminalBox .tbody').delegate('.ui_checkbox_box', 'click', function() {
                var bAllChecked = !0;
                $('#terminalBox .tbody input[type=checkbox]').each(function() {
                    !$(this).prop('checked') && (bAllChecked = !1);
                    return bAllChecked;
                });

                bAllChecked ? $('#selectAll').addClass('ui_checkbox_box_checked') : $('#selectAll').removeClass('ui_checkbox_box_checked');
                $('#selectAll').children('input').prop('checked', bAllChecked);
            });
        },
        render: function(data) {
            var i,
                j,
                size = data.length,
                pageCount = Math.ceil(size / this.pageSize),
                sections = [],
                html = [];
            for (i = 0; size > i; i++) {
                sections[i] = this.formatString(data[i], CONF.htmlTemplate.rowTpl);
            }
            for (j = 0; pageCount > j; j++) {
                html[j] = CONF.htmlTemplate.sectionWrapperTpl.replace("{{rows}}", sections.slice(this.pageSize * j, this.pageSize * (j + 1)).join(""));
            }
            $("#" + this.terminalContainerId).html(html.join(""));
            this.initPagination();
            this.bindCheckBox();
        },
        initPagination: function() {
            var me = this;
            $("div.holder").jPages({
                containerID: me.terminalContainerId,
                first: "首页",
                previous: "上页",
                next: "下页",
                last: "尾页",
                perPage: 1,
                scrollBrowse: true,
                callback: function(pages, items) {
                    //console.log(pages);
                    //console.log(items);
                }
            });
        },
        init: function() {
            this.showOrHide();
            this.polyfillPlaceholder();
            this.render(this.originalData);
            this.bindEvent();
        }
    }, popupSuccessWin = function(content) {
        var successWin = $.addWin('<div id="successBox" class="success"><i class="success_img"></i><p>' + content + '</p><input type="button" value="确认" class="ui_submit ui_close"></div>', {
            title: '提示',
            width: 642
        });
        $('#successBox .ui_close').click(function() {
            $.removeWin(successWin);
        });        
    };
