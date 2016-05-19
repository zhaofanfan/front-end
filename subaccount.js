/**
 * 子账号管理
 * @authors zhaofan@xinguodu.com
 * @date    2016-03-04 10:12:47
 * @version $V1.0$
 */
var CONF = {
        reg: {
            nameFormat: "^([a-zA-Z]|[\\u4e00-\\u9fa5])+$",
            aliasFormat: "^([0-9a-zA-Z]|[\\u4e00-\\u9fa5])+$",
            phoneFormat: "^1[34578]\\d{9}$"
        },
        validMsg: {
            nullText: "格式错误，内容不能为空",
            accountNameText: "格式错误，姓名为4-50位字符的汉字或字母组合",
            aliasNameText: "格式错误，别名为4-50位字符的汉字、字母或数字组合",
            phoneNumberText: "格式错误，请输入11位手机号",
            accountNameDuplicateText: "姓名在您的商户账号下重复，请输入别名信息以供子账号的识别",
            phoneNumberDuplicateText: "此手机号已使用，请更换其他手机号",
            terminalNoText: "终端号",
            merchantCodeText: "商户号",
            subBranchText: "分店名称"
        },
        API: {
            roleList_AJAX: basePath + "/authRole/getAllRole.mt",
            authRes_AJAX: basePath + "/authRole/getAllIsAuthRes.mt",
            verifyUnique_AJAX: basePath + "/subAccount/verifyUnique.mt",
            searchTerminal_AJAX: basePath + "/subAccount/searchTerminal.mt",
            getSubAccount_AJAX: basePath + "/subAccount/getAccountInfo.mt",
            addSubAccount_AJAX: basePath + "/subAccount/add.mt",
            editSubAccount_AJAX: basePath + "/subAccount/edit.mt",
            toSubAccountList_URL: basePath + "/subAccount/toSubAccount.mt",
            toRoleAuth_URL: basePath + "/authRole/toRoleAuth.mt"
        },
        subAccountStatus: {
            0: "未激活",
            1: "可用",
            2: "注销",
            3: "删除",
            4: "停用"
        },
        htmlTemplate: {
            roleAuthTreeTpl: '<div id="subaccount_set_com">' +
                '<div class="con clearfix">' +
                '<div class="com_tree tree_1"></div>' +
                '<div class="com_tree tree_2 ml20"></div>' +
                '<div class="com_tree tree_3 ml20"></div>' +
                '<div class="com_tree tree_4 ml20"></div>' +
                '</div></div>',
            sectionWrapperTpl: '<div class="section">{{rows}}</div>',
            rowTpl: '<ul class="row clearfix">' +
                '<li class="one"><span data-sid="{id}" data-bound="{bound}" class="ui_checkbox_box"><input type="checkbox" name=""></span></li>' +
                '<li class="two">{terminalNo}</li>' +
                '<li class="three">{merchantPrintNo}</li>' +
                '<li class="four" title="{merchantPrintName}">{merchantPrintName}</li>' +
                '</ul>',
            successWinTpl: '<div id="successBox" class="success"><i class="success_img"></i><p>{{content}}</p><input type="button" value="确认" class="ui_submit ui_close"></div>'
        }
    },
    SubAccountUtil = {
        terminalContainerId: 'wrap',
        pageSize: 10,
        originalData: null,
        terminalId2Bind: [],
        byteLength: function(str) {
            return (str || "").replace(/[^\x00-\xff]/g, "00").length;
        },
        isValidName: function(name) {
            var nLength = this.byteLength(name);
            return new RegExp(CONF.reg.nameFormat).test(name) && (nLength >= 4 && nLength <= 50)
        },
        isValidAlias: function(alias) {
            var nLength = this.byteLength(alias);
            return new RegExp(CONF.reg.aliasFormat).test(alias) && (nLength >= 4 && nLength <= 50)
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
            if ('modify' === $.getUrlParam('action')) {
                $('.alias_block').removeClass('display_ib').addClass('hide');
                $('.status_block').removeClass('hide').addClass('display_ib');
                $('.modify_alias_block').removeClass('hide');
                $('.phone_number_block').addClass('hide');
                $('#opLabel').text('修改子账号');
            }
        },
        polyfillPlaceholder: function() {
            $('input.box').each(function() {
                $(this).val(CONF.validMsg[$(this).attr('name') + 'Text']);

                $(this).on('focus', function() {
                    $(this).val() == CONF.validMsg[$(this).attr('name') + 'Text'] && ($(this).val(''));
                    $(this).on('keydown', function(ev) {
                        ev.which == 13 && ($(this).attr('data-val', $(this).val()), $(this).next('button').trigger('click'));
                    });
                }).on('blur', function() {
                    $(this).val().length <= 0 && ($(this).val(CONF.validMsg[$(this).attr('name') + 'Text']));
                    CONF.validMsg[$(this).attr('name') + 'Text'] == $(this).val() ? $(this).removeAttr('data-val') : $(this).attr('data-val', $(this).val());
                    $(this).off('keydown');
                });
            });
        },
        verifyUnique: function(url, verifyData, callback) {
            var oInput = this;
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                data: verifyData,
                success: function(data) {
                    callback && callback.call(oInput, data);
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

            if (!$('.alias_block').hasClass('hide') && $('#aliasName').hasClass('ui_fm_error')) {
                return false;
            }
            if (!$('.modify_alias_block').hasClass('hide') && $('#modifyAliasInput').hasClass('ui_fm_error')) {
                return false;
            }

            if (!$('.phone_number_block').hasClass('hide')) {
                if (!$.trim($('#phoneNumber').val())) {
                    $('#phoneNumber').trigger('blur');
                    return false;
                }
                if ($('#phoneNumber').hasClass('ui_fm_error')) {
                    return false;
                }
            }

            if (!$('#selectRole').val()) {
                $.addAlert('请选择角色', function() {
                    $('#selectRole').addClass("border-error");
                });
                return false;
            }

            if (!$('#terminalBlock').is(':visible')) {
                return true;
            }

            /*          var terminalId2Bind = [];
                        $('#terminalBox .tbody .ui_checkbox_box_checked').each(function() {
                            terminalId2Bind.push($(this).attr('data-sid'));
                        });*/

            return !!this.terminalId2Bind.length ? this.terminalId2Bind : ($.addAlert("请至少选择一个终端绑定！"), false);
        },
        bindEvent: function() {
            var me = this;
            $('#accountName,#aliasName,#modifyAliasInput').keyup(function() {
                /["'<>《》~!@#￥%;\]\[\^\*\?\？&+=]/.test($(this).val()) && $(this).val($(this).val().replace(/["'<>《》~!@#￥%;\]\[\^\*\?\？&+=]/g, ""));
            });
            $('#aliasName,#modifyAliasInput').blur(function() {
                var sValue = this.value.replace(/\s+/g, '');
                if (!me.isValidAlias(sValue)) {
                    $(this).addFmErrorTip(CONF.validMsg.aliasNameText);
                    return;
                }
                this.value = sValue;
            });
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

                var verifyObj = {
                    verifyType: 'name',
                    verifyValue: sValue
                };
                'modify' === $.getUrlParam('action') && (verifyObj['subAccountId'] = $.getUrlParam('subAccountId'));
                me.verifyUnique.call(this, CONF.API.verifyUnique_AJAX, verifyObj, function(ret) {
                    var sAction = $.getUrlParam('action');
                    if (!ret.success) {
                        $(this).addFmErrorTip(CONF.validMsg.accountNameDuplicateText);
                        var that = this;
                        setTimeout(function() {
                            $(that).removeClass('ui_fm_error').data('tip').remove();
                        }, 5E3);
                        'modify' === sAction ? !$.trim($('#modifyAliasInput').val()) && $('#modifyAliasInput').val(ret.msg) : !$.trim($('#aliasName').val()) && $('#aliasName').val(ret.msg);
                    } else {
                        'modify' === sAction ? !$.trim($('#modifyAliasInput').val()) && $('#modifyAliasInput').val(sValue) : !$.trim($('#aliasName').val()) && $('#aliasName').val(sValue);
                    }
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

                var verifyObj = {
                    verifyType: 'mobile',
                    verifyValue: sValue
                };
                'modify' === $.getUrlParam('action') && (verifyObj['subAccountId'] = $.getUrlParam('subAccountId'));
                me.verifyUnique.call(this, CONF.API.verifyUnique_AJAX, verifyObj, function(ret) {
                    if (!ret.success) {
                        $(this).addFmErrorTip(CONF.validMsg.phoneNumberDuplicateText);
                    }
                });
            });

            $('#selectRole').change(function() {
                '0000' === $(this).val() ? (window.location.href = CONF.API.toRoleAuth_URL) : (SubAccountUtil.getAllIsAuthResByRoleId($(this).val(), function(data) {
                    data && $.each(data, function(index, item) {
                        if ("交易明细" == item.resName) {
                            item.isAuth ? $('#terminalBlock').show() : $('#terminalBlock').hide();
                        }
                    });
                }));
            });

            $('.view_role_auth').click(function() {
                roleAuthWin = $.addWin(CONF.htmlTemplate.roleAuthTreeTpl, {
                    title: '角色权限',
                    width: 760
                });
                SubAccountUtil.getAllIsAuthResByRoleId($('#selectRole').val(), SubAccountUtil.renderAuthTree);
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

                hCheckbox.each(function() {
                    var terminalId = $(this).attr('data-sid');
                    var nIndex = jQuery.inArray(terminalId, SubAccountUtil.terminalId2Bind);

                    bChecked ? nIndex > -1 ? void 0 : SubAccountUtil.terminalId2Bind.push(terminalId) : (nIndex > -1 && SubAccountUtil.terminalId2Bind.splice(nIndex, 1));
                });
            });

            $('#terminalBox .tbody').delegate('.ui_checkbox_box', 'click', function() {
                var bAllChecked = !0;
                $('#terminalBox .tbody input[type=checkbox]').each(function() {
                    !$(this).prop('checked') && (bAllChecked = !1);
                    return bAllChecked;
                });

                bAllChecked ? $('#selectAll').addClass('ui_checkbox_box_checked') : $('#selectAll').removeClass('ui_checkbox_box_checked');
                $('#selectAll').children('input').prop('checked', bAllChecked);

                var terminalId = $(this).attr('data-sid');
                var nIndex = jQuery.inArray(terminalId, SubAccountUtil.terminalId2Bind);
                nIndex > -1 ? SubAccountUtil.terminalId2Bind.splice(nIndex, 1) : SubAccountUtil.terminalId2Bind.push(terminalId);
            });

            $('#subAccountBox .btn_submit').click(function() {
                SubAccountUtil.submitData();
            });
        },
        submitData: function() {
            var result = this.validate();
            if (result) {
                var sAction = $.getUrlParam('action');
                var postObj = {
                    personName: $('#accountName').val(),
                    roleId: $('#selectRole').val(),
                    bindTerminalNo: jQuery.type(result) === 'array' ? result.join(',') : ''
                };
                sAction === 'modify' ? (postObj['id'] = $.getUrlParam('subAccountId'), postObj['subMerchantUserId'] = $.getUrlParam('subMerchantUserId'), postObj['aliasName'] = $('#modifyAliasInput').val(), postObj['status'] = $('#selectStatus').val()) : (postObj['mobilePhone'] = $('#phoneNumber').val(), postObj['aliasName'] = $('#aliasName').val());
                $.ajax({
                    type: 'post',
                    url: sAction === 'modify' ? CONF.API.editSubAccount_AJAX : CONF.API.addSubAccount_AJAX,
                    dataType: 'json',
                    data: postObj,
                    success: function(data) {
                        !!data.success ? (sAction === 'modify' ? popupSuccessWin('恭喜你，修改子账号已成功！') : popupSuccessWin('恭喜您！子账号已设置成功，敬请获取短信密码进行登录！')) : $.addAlert(data.msg);
                    }
                });
                /*              setTimeout(function() {
                                    $('#terminalBox .btn_submit').css('cursor', 'not-allowed');
                                }, 1E3);*/
            }
        },
        initRoleSelectList: function(callback) {
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
                    roleOptionsHtml += '<option value="0000">新增角色</option>';
                    $('#selectRole').html(roleOptionsHtml).uiSelectReg();
                    callback && callback();
                }
            });
        },
        getAllIsAuthResByRoleId: function(roleId, handler) {
            $.ajax({
                type: "POST",
                url: CONF.API.authRes_AJAX,
                dataType: "json",
                data: {
                    roleId: roleId
                },
                success: function(data) {
                    if (data && data.length > 0) {
                        handler(data);
                        $('#subAccountBox').removeAreaLoading();
                    }
                }
            });
        },
        renderAuthTree: function(data) {
            $.each(data, function(index, item) {
                $('#subaccount_set_com .tree_' + (index + 1)).setTree({
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
            $.alignWin(roleAuthWin);
            $('#subaccount_set_com .ui_checkbox_box').addClass('ui_checkbox_box_disabled');
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
        getSubAccountInfo: function(subAccountId, callback) {
            $.ajax({
                type: "POST",
                url: CONF.API.getSubAccount_AJAX,
                dataType: "json",
                data: {
                    subAccountId: subAccountId
                },
                success: function(data) {
                    if (data.subAccountVo) {
                        callback && callback(data.subAccountVo);
                    } else {
                        $.addAlert("获取帐号信息异常，请稍后重试！如果重试还是提示异常，请联系嘉联！");
                    }
                },
                error: function() {
                    $.addAlert("获取帐号信息异常，请稍后重试！如果重试还是提示异常，请联系嘉联！");
                }
            });
        },
        searchTerminal: function(subAccountId, boundOnly, callback) {
            var me = this;
            $.ajax({
                type: "POST",
                url: CONF.API.searchTerminal_AJAX + (subAccountId ? "?subAccountId=" + subAccountId : ""),
                dataType: "json",
                success: function(data) {
                    if (!!data && '[object Array]' == Object.prototype.toString.call(data)) {
                        var myData = [];
                        for (var i = 0, size = data.length; size > i; i++) {
                            !!data[i]['bound'] && me.terminalId2Bind.push(data[i]['id']);
                            boundOnly && !!data[i]['bound'] ? myData.push(data[i]) : void 0;
                        }
                        me.originalData = boundOnly ? myData : data;
                        SubAccountUtil.render(me.originalData);
                    }
                    callback && callback();
                    $('#subAccountBox').removeAreaLoading();
                }
            });
        },
        bindCheckBox: function() {
            var _this = this;
            $('#terminalBox .tbody .ui_checkbox_box').each(function() {
                //!!$(this).attr('data-bound') && $(this).children('input').prop('checked', true);
                jQuery.inArray($(this).attr('data-sid'), _this.terminalId2Bind) > -1 && $(this).children('input').prop('checked', true);
            }).uiCheckbox();
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
            this.bindCheckBox();
            $("div.holder").empty();
            var bVisible = $('#terminalBlock').is(':visible');
            pageCount > 1 ? (!bVisible && $('#terminalBlock').show(), this.initPagination(), !bVisible && $('#terminalBlock').hide(), bVisible && $("#" + this.terminalContainerId).popupTipLayer({
                once: !0,
                content: '您可以使用鼠标滚轮翻页'
            })) : $("#" + this.terminalContainerId).css('min-height', 'auto');
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
            this.bindEvent();
        }
    },
    popupSuccessWin = function(content) {
        var successWin, timer = null;

        function toSubAccountList() {
            clearTimeout(timer);
            $.removeWin(successWin);
            window.location.href = CONF.API.toSubAccountList_URL;
        }
        successWin = $.addWin(CONF.htmlTemplate.successWinTpl.replace('{{content}}', content), {
            title: '提示',
            width: 642,
            fn: function(win) {
                $('.close', win).click(function() {
                    toSubAccountList();
                });
            }
        });
        $('#successBox .ui_close').click(function() {
            toSubAccountList();
        });
        timer = setTimeout(function() {
            $('#successBox .ui_close').trigger('click');
        }, 5E3);
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
        }, 3E3);
        opts.once && $(this).attr('data-showtiplayerbefore', 1);
    }), this;
};

$(function() {
    $.ajaxSetup({
        beforeSend: $('#subAccountBox').addAreaLoading()
    });
});
