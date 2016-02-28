var CONF = {
        reg: {
            nameFormat: "^[a-zA-Z\u4e00-\u9fa5]$",
            phoneFormat: "^1[34578]\d{9}$"
        },
        validMsg: {
            phoneNumberText: "请输入11位手机号",
            terminalNoText: "终端号",
            merchantCodeText: "商户号",
            subBranchText: "分店名称"
        },
        htmlTemplate: {
            sectionWrapperTpl: "",
            sectionTpl: ""
        }
    },
    SubAccountUtil = {
        pageSize: 100,
        activeIndex: 1,
        byteLength: function(str) {
            return (str || "").replace(/[^\x00-\xff]/g, "00").length;
        },
        filter: function(dataArr, filterKey, filterVal) {
            var i,
                len = dataArr.length,
                obj,
                retArr;
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
        polyfillPlaceholder: function() {
            var terminalNoInput = $('#terminalNoInput');
            var merchantCodeInput = $('#merchantCodeInput');
            var subBranchInput = $('#subBranchInput');

            terminalNoInput.val(CONF.validMsg.terminalNoText);
            merchantCodeInput.val(CONF.validMsg.merchantCodeText);
            subBranchInput.val(CONF.validMsg.subBranchText);

            terminalNoInput.on('focus', function() {
                $(this).val() == CONF.validMsg.terminalNoText && ($(this).val(''))
            }).on('blur', function() {
                $(this).val().length <= 0 && ($(this).val(CONF.validMsg.terminalNoText))
            });
            merchantCodeInput.on('focus', function() {
                $(this).val() == CONF.validMsg.merchantCodeText && ($(this).val(''))
            }).on('blur', function() {
                $(this).val().length <= 0 && ($(this).val(CONF.validMsg.merchantCodeText))
            });
            subBranchInput.on('focus', function() {
                $(this).val() == CONF.validMsg.subBranchText && ($(this).val(''))
            }).on('blur', function() {
                $(this).val().length <= 0 && ($(this).val(CONF.validMsg.subBranchText))
            });
        },
        render: function() {
            var i,
                j,
                size = data.length,
                pageCount = Math.ceil(size / this.pageSize),
                sections = [],
                html = [];
            for (i = 0; size > i; i++) {
                sections[i] = this.formatString(data[i], CONF.htmlTemplate.sectionTpl);
            }
            for (j = 0; pageCount > j; j++) {
                html[j] = CONF.htmlTemplate.sectionWrapperTpl.replace("{{sectionTpl}}", sections.slice(this.pageSize * j, this.pageSize * (j + 1)));
            }
            $("#terminalInfo").html(html.join(""));
        },
        bindMouseWheel: function() {
            $("#terminalInfo").mousewheel(function(ev, delta) {

            });
        }
    };
