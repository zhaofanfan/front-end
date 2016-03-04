var CONF = {
        reg: {
            nameFormat: "^([a-zA-Z]|[\\u4e00-\\u9fa5])+$",
            phoneFormat: "^1[34578]\\d{9}$"
        },
        validMsg: {
            nullText: "格式错误，内容不能为空",
            accountNameText: "格式错误，姓名必须为字母或汉字的组合且不超过50个字符",
            phoneNumberText: "格式错误，请输入11位手机号",
            phoneNumberDuplicateText: "此手机号已重复，请输入正确手机号",
            terminalNoText: "终端号",
            merchantCodeText: "商户号",
            subBranchText: "分店名称"
        },
        API: {
            nameUnique_AJAX: "",
            mobileUnique_AJAX: "",
            roleList_AJAX: "${BasePath}/authRole/getAllRole.mt",
            authRes_AJAX: "${BasePath}/authRole/getAllIsAuthRes.mt",
            searchTerminal_AJAX: "${BasePath}/subAccount/searchTerminal.mt",
            addSubAccount_AJAX: "${BasePath}/subAccount/add.mt",
            editSubAccount_AJAX: "${BasePath}/subAccount/edit.mt?subAccountId="
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
                    terminalNo: '80006365',
                    merchantPrintNo: '849441357145001',
                    merchantPrintName: '深圳南山分店'
                }, {
                    terminalNo: '44444',
                    merchantPrintNo: '1357145001',
                    merchantPrintName: '深圳分店'
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
        checkUnique: function(url, checkData, callback) {
            var oInput = this;
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                data: checkData,
                success: function(data) {
                    callback && callback.apply(oInput, data);
                }
            });
        },
        validate: function() {
            if (!$.trim($('#accountName').val())) {
                $('#accountName').trigger('blur');
                return false;
            }
            if ($('#accountName').hasClass('ui_fm_error')) {
                return false;
            }

            if (!$.trim($('#phoneNumber').val())) {
                $('#phoneNumber').trigger('blur');
                return false;
            }
            if ($('#phoneNumber').hasClass('ui_fm_error')) {
                return false;
            }

            if (!$('#selectRole').val()) {
                $.addAlert('请选择角色', function() {
                    $('#selectRole').addClass("border-error");
                });
                return false;
            }
            
            var terminalId2Bind = [];
            $('#terminalBox .tbody .ui_checkbox_box_checked').each(function() {
                terminalId2Bind.push($(this).attr('data-sid'));
            });

            return !!terminalId2Bind.length ? terminalId2Bind : ($.addAlert("请至少选择一个终端绑定！"), false);
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

                me.checkUnique.call(this, CONF.API.nameUnique_AJAX, {
                    checkType: 'name',
                    checkValue: sValue
                }, function(ret) {

                });
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

                me.checkUnique.call(this, CONF.API.mobileUnique_AJAX, {
                    checkType: 'mobile',
                    checkValue: sValue
                }, function(ret) {

                });
            });

            $('.view_role_auth').click(function() {
                var win = $.addWin('<div id="subaccount_set_com">' +
                    '<div class="con clearfix">' +
                    '<div class="com_tree tree_1"></div>' +
                    '<div class="com_tree tree_2 ml20"></div>' +
                    '<div class="com_tree tree_3 ml20"></div>' +
                    '<div class="com_tree tree_4 ml20"></div>' +
                    '</div></div>', {
                        title: '设置权限',
                        width: 760
                    });

                SubAccountUtil.getAllIsAuthResByRoleId($('#selectRole').val());
            });

            $('#terminalBox .thead .btn').click(function() {
                var filterVal = $(this).prev('input.box').attr('data-val');
                var retData = me.filter(me.originalData, $(this).attr('data-filter-key'), filterVal);
                me.render(retData);
            });

            $('#selectAll').click(function() {
                var bChecked = $(this).children('input').is(':checked');
                var hCheckbox = $('#terminalBox .tbody .ui_checkbox_box');

                bChecked ? hCheckbox.addClass('ui_checkbox_box_checked') : hCheckbox.removeClass('ui_checkbox_box_checked');
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

            $('#terminalBox .btn_submit').click(function() {
                var result = SubAccountUtil.validate();
                if (result) {
                    var postObj = {

                    };
                    $.ajax({
                        type: 'post',
                        url: CONF.API.addSubAccount_AJAX,
                        dataType: 'json',
                        data: postObj,
                        success: function(data) {

                        }
                    });
                }
            });
        },
        initRoleSelectList: function() {
            $.ajax({
                type: "POST",
                url: CONF.API.roleList_AJAX,
                dataType: "json",
                success: function(data) {
                    var roleOptionsHtml = '<option value="">请选择</option>';
                    if (data && data.length > 0) {
                        $.each(data, function(index, item) {
                            roleOptionsHtml += '<option value="' + item.id + '">' + item.roleName + '</option>';
                        });
                    }
                    roleOptionsHtml += '<option value="">新增角色</option>';
                    $('#selectRole').html(roleOptionsHtml);
                }
            });
        },
        getAllIsAuthResByRoleId: function(roleId) {
            $.ajax({
                type: "POST",
                url: CONF.API.authRes_AJAX,
                dataType: "json",
                data: {
                    roleId: roleId
                },
                success: function(data) {
                    if (data && data.length > 0) {
                        $.each(data, function(index, item) {
                            $('#subaccount_set_com .tree_' + (index + 1), html).setTree({
                                title: {
                                    text: item.resName,
                                    checkbox: {
                                        name: item.id,
                                        checked: item.isAuth
                                    },
                                },
                                data: SubAccountUtil.buildAuthTreeData(item)
                            });
                        });
                    }
                }
            });
        },
        buildAuthTreeData: function(authItem) {
            var authTreeData = [];
            if (authItem.subMenuList && authItem.subMenuList.length > 0) {
                var obj,
                    children;
                $.each(authItem.subMenuList, function(subAuthIndex, subAuthItem) {
                    obj = {
                        text: subAuthItem.resName,
                        checkbox: {
                            name: subAuthItem.id,
                            checked: subAuthItem.isAuth
                        }
                    };
                    children = SubAccountUtil.buildAuthTreeData(subAuthItem);
                    !!children.length && (obj['children'] = children);
                    authTreeData.push(obj);
                });
            }
            return authTreeData;
        },
        searchTerminal: function(subAccountId) {
            $.ajax({
                type: "POST",
                url: CONF.API.searchTerminal_AJAX + (subAccountId ? "?subAccountId=" + subAccountId : ""),
                dataType: "json",
                success: function(data) {
                    SubAccountUtil.render(data);
                }
            });
        },
        bindCheckBox: function() {
            $('#terminalBox .tbody .ui_checkbox_box').uiCheckbox();
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
            $("#" + this.terminalContainerId).popupTipLayer({
                once: !0,
                content: '您可以使用鼠标滚轮翻页'
            });
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
            this.initRoleSelectList()
            this.polyfillPlaceholder();
            this.render(this.originalData);
            this.bindEvent();
        }
    },
    popupSuccessWin = function(content) {
        var successWin = $.addWin('<div id="successBox" class="success"><i class="success_img"></i><p>' + content + '</p><input type="button" value="确认" class="ui_submit ui_close"></div>', {
            title: '提示',
            width: 642
        });
        $('#successBox .ui_close').click(function() {
            $.removeWin(successWin);
        });
    };
$.fn.popupTipLayer = function(opts) {
    return this.each(function() {
        if (opts.once && !!$(this).attr('data-showtiplayerbefore'))
            return;
        var $layer = $('<div class="ui-tip-layer">' + opts.content + '</div>');
        $('body').append($layer);
        var offset = $(this).offset();
        var left = offset.left + ($(this).width() - $layer.outerWidth()) / 2;
        var top = offset.top + ($(this).height() - $layer.outerHeight()) / 2;
        $layer.css({
            left: left + 'px',
            top: top + 'px'
        }).fadeIn('slow');
        setTimeout(function() {
            $layer.fadeOut('slow', function() {
                $layer.remove();
            })
        }, 5E3);
        opts.once && $(this).attr('data-showtiplayerbefore', 1);
    }), this;
};
