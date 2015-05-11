/**
 * Created by Administrator on 2014/10/23.
 */
/**
 * Created by qiangqiang on 2014/8/28.
 */
(function ($) {
    $.selectPicker = function (el, options) {
        var select = $(el);
        var vars = {};
        vars = $.extend(vars, $.selectPicker.defaults, options);
        vars.suffix = "_selectPicker";
        vars.commenHtmlStructure =
            '<div  class="<%this.classPrefix%>' + vars.suffix + '">' +
            '<ul class="list">' +
            ' <% for(var i=0;i<this.options.length;i++){%>' +
            '<li  data-value="<%this.options[i].value%>"><%this.options[i].text%></li>' +
            '<%}%>' +
            '</ul>' +
            '</div>';
        vars.hiddenInput = '<input type="hidden" class="selected_value"  name="<%this.name%>" value=""/>';
        vars.triggerHtml = '<span class="trigger"></span>';
        vars.commonSelectHtml = '<span class="display" tabindex="0"></span>';
        vars.inputSelectHtml = '<input type="text" class="display" value=""/>';
        vars.refreshStructure =
            '<% for(var i=0;i< this.options.length;i++){%>' +
            '<li  data-value="<%this.options[i].value%>"><%this.options[i].text%></li>' +
            '<%}%>';

        var methods = {
            init: function () {
                this.htmlBuild.setup();
                if (vars.isInput) {
                    methods.selectWithInput.setup();
                    if (vars.triangle) this.selectWithTrigger.setup();
                } else {
                    methods.commonSelect.setup();
                    methods.selectWithTrigger.setup();
                }
                methods.updateStyle({itemHeight: vars.itemHeight, width: vars.width, displayHeight: vars.displayHeight});
                if (vars.isComplete) methods.formPretend.setup();
                //如果禁用
                if (select.is(":disabled"))
                    vars.selectWrapper.addClass("select_disabled");
                //如果只读
                if (select.is("[readOnly]"))
                    vars.selectWrapper.addClass("select_readOnly");
                //如果没有选项return
                if (select[0].length === 0) return;
                //初始化一开始的选中值
                var index = methods.originalSelect.index();
                index < 0 ? publicMethod.reset() : publicMethod.setByIndex(index); // jshint ignore:line
            },
            htmlBuild: {
                setup: function () {
                    vars.optionSelected = methods.originalSelect.getSelectedOption();
                    vars.displayHeight = vars.displayHeight ? vars.displayHeight : vars.itemHeight;
                    vars.width = vars.width ? vars.width : select.css("width");
                    vars.baseData = {};
                    vars.baseData.options = methods.originalSelect.optionsList();
                    vars.baseData.classPrefix = vars.classPrefix;
                    var html = methods.templateEngine(vars.commenHtmlStructure, vars.baseData);
                    select.hide();
                    select.after(html);
//处理select完成，保存索引
                    vars.selectWrapper = select.next("." + vars.classPrefix + vars.suffix);
                    vars.ulContainer = vars.selectWrapper.find(".list");
                }
            },
            formPretend: {
                setup: function () {
                    var obj = {};
                    obj.name = (select.attr("name") === "") ? "" : select.attr("name");
                    var html = methods.templateEngine(vars.hiddenInput, obj);
                    vars.selectWrapper.prepend(html);
                    vars.hiddenInput = vars.selectWrapper.find(".selected_value");
                    select.removeAttr("name");
                    this.initVal();
                },
                updateVal: function (value) {
                    vars.hiddenInput.val((value !== undefined) ? value : "");
                    //vars.hiddenInput.attr("name", (select.attr("name") == "") ? "" : select.attr("name"));
                },
                initVal: function () {
                    var firstOption = select.find("option").eq(0);
                    vars.hiddenInput.val(( vars.optionSelected.length !== 0) ? ( vars.optionSelected.val()) : (firstOption ? firstOption.val() : ""));
                    vars.hiddenInput.attr("name", (select.attr("name") !== "") ? "" : select.attr("name"));
                }

            },
            commonSelect: {
                setup: function () {
                    vars.selectWrapper.prepend(vars.commonSelectHtml);
                    vars.display = vars.selectWrapper.find(".display");

                    methods.addChange(false);
                    methods.addBlur();

                    vars.selectWrapper.on("mousedown", ".display", function (e) {
                        methods.toggle();
                    });
                    this.initVal();
                },
                updateStyle: function (obj) {
                    vars.display.css({"height": obj.height, "line-height": obj.height + "px", width: obj.width});
                },
                updateVal: function (value) {
                    vars.display.text(value ? value : "");
                },
                initVal: function () {
                    var firstOption = select.find("option").eq(0);
                    vars.display.text(( vars.optionSelected.length !== 0) ? ( vars.optionSelected.text()) : (firstOption ? firstOption.text() : ""));
                }
            },
            selectWithInput: {
                setup: function () {
                    vars.selectWrapper.prepend(vars.inputSelectHtml);
                    vars.display = vars.selectWrapper.find(".display");
                    vars.display.on("blur", function () {
                        vars.time = setTimeout(function () {
                            vars.selectWrapper.blur();
                            clearTimeout(vars.time);
                        }, 150);
                    });
                    methods.addChange(true);
                    methods.addBlur();
                    vars.selectWrapper.on("mousedown", ".display", function (e) {
                        methods.toggle();
                    });
                    this.initVal();
                },
                updateStyle: function (obj) {
                    vars.display.css({"height": obj.height - (vars.display.outerHeight() - vars.display.height()), "line-height": obj.height + "px", width: obj.width - (vars.display.outerWidth() - vars.display.width())});
                },
                updateVal: function (value) {
                    vars.display.val(value ? value : "");
                },
                initVal: function () {
                    var firstOption = select.find("option").eq(0);
                    vars.display.val(( vars.optionSelected.length !== 0) ? ( vars.optionSelected.text()) : (firstOption ? firstOption.text() : ""));
                }
            },
            selectWithTrigger: {
                setup: function () {
                    vars.selectWrapper.prepend(vars.triggerHtml);
                    vars.trigger = vars.selectWrapper.find(".trigger");
                    vars.selectWrapper.on("click", ".trigger", function () {
                        vars.display.focus();
                        methods.toggle();
                    });
                    this.updateStyle({height: vars.trigger.outerHeight(true) / 2});
                },
                updateStyle: function (obj) {
                    vars.trigger.css({"top": "50%", "margin-top": "-" + obj.height + "px"});
                }
            },
            originalSelect: {
                index: function () {
                    var index = -1;
                    var list = select.find("option");
                    var optionSelected = this.getSelectedOption();
                    if (optionSelected.length === 0) return index;
                    list.each(function (i) {
                        if ($(this).is(optionSelected)) index = i;
                    });
                    return index;
                },
                optionsList: function () {
                    var options = [];
                    var optionsList = select.find("option");
                    optionsList.each(function () {
                        var optionsObj = {"value": "", "text": "", selected: false};
                        optionsObj.value = $(this).val();
                        optionsObj.text = ($(this).text() === "") ? "&nbsp;" : $(this).text();
                        options.push(optionsObj);
                    });
                    return options;
                },
                getSelectedOption: function () {
                    if (typeof select.attr("size") == "undefined" || select.attr("size") == 1) {
                        if (select.find("[selected]").length === 0) return $("");
                    }
                    return  select.find("option:selected");
                }
            },
            addChange: function (isInput) {
                vars.ulContainer.on("mousedown", function (e) {
                    e.preventDefault();
                });
                vars.selectWrapper.on("mousedown", "li", function (e) {
                    e.preventDefault();
                    methods.setSelected.apply(this);
                    methods.close();
                    vars.change(e);
                });
            },
            setSelected: function () {
                $(this).siblings("li").removeAttr("data-selected");
                $(this).attr("data-selected", "selected");
                if (vars.isCascade) {
                    var index = publicMethod.index();
                    if (index >= 0) {
                        select.find("option").removeAttr("selected");
                        select.find("option").eq(index).attr("selected", "selected");
                    }
                }
                if (!vars.isInput) {
                    methods.commonSelect.updateVal($(this).text());
                } else {
                    methods.selectWithInput.updateVal($(this).text());
                }
                if (vars.isComplete)
                    methods.formPretend.updateVal($(this).data("value"));
            },
            addBlur: function () {
                vars.display.on("blur", function (e) {
                    methods.close();
                });
            },
            toggle: function () {
                if (vars.selectWrapper.hasClass("select_disabled")) return;
                if (vars.selectWrapper.hasClass("select_readOnly")) return;
                vars.ulContainer.is(":hidden") ? methods.open() : methods.close();// jshint ignore:line
            },
            close: function () {
                vars.ulContainer.removeClass("active");
                if (vars.trigger) {
                    vars.trigger.removeClass("active");
                }
            },
            open: function () {
                vars.ulContainer.addClass("active");
                if (vars.trigger) {
                    vars.trigger.addClass("active");
                }
            },
            updateStyle: function (obj) {
                var size = select[0].size;
                var length = select[0].length;
                var css = {};
                css.width = obj.width ? obj.width : vars.width;
                css.itemHeight = obj.itemHeight ? obj.itemHeight : vars.itemHeight;
                css.ulHeight = size === 0 ? length * css.itemHeight : ((length < size) ? length * css.itemHeight : size * css.itemHeight);
                css.displayHeight = obj.displayHeight ? obj.displayHeight : vars.displayHeight;
                vars.ulContainer.css({"height": css.ulHeight, "line-height": css.itemHeight + "px", top: parseInt(css.displayHeight) + vars.topOffset, width: (vars.width - (vars.ulContainer.outerWidth() - vars.ulContainer.width()))});
                vars.selectWrapper.css({"width": css.width, height: css.displayHeight});
                methods.commonSelect.updateStyle({height: css.displayHeight - (vars.display.outerHeight() - vars.display.height()), width: css.width - (vars.display.outerWidth() - vars.display.width())});
                if (vars.isInput) {
                    methods.selectWithInput.updateStyle({height: css.displayHeight - (vars.display.outerHeight() - vars.display.height()), width: css.width});
                }
            },
            clear: function () {
                if (typeof vars.defaults == "object") {
                    if (!vars.isInput) {
                        vars.display.text(vars.defaults.text);
                    } else {
                        vars.display.val(vars.defaults.value);
                    }
                    if (vars.isComplete)
                        methods.formPretend.updateVal(vars.defaults.value);
                } else {
                    var index = publicMethod.index();
                    if (index >= 0) {
                        var list = vars.ulContainer.find("li");
                        list.eq(index).removeAttr("data-selected");
                        if (vars.isCascade) {
                            select.find("option").removeAttr("selected");
                            select.find("option").eq(index).removeAttr("selected");
                        }
                    }
                    if (!vars.isInput) {
                        vars.display.text("");
                    } else {
                        vars.display.val("");
                    }
                    if (vars.isComplete)
                        methods.formPretend.updateVal("");
                }
            },
            templateEngine: function (template, data) {
                var re = /<%([^%>]+)?%>/g, match = "", html = "var tpl ='';", cursor = 0, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;

                function add(substr, isQuotes) {
                    substr ? (substr = substr.replace('\'', '\\"'), substr.match(reExp) ? (html += substr) : (isQuotes ? (  html += 'tpl+=\'' + substr + '\';') : (  html += 'tpl+=' + substr + ';'))) : (html += "");// jshint ignore:line
                }

                while (!!(match = re.exec(new RegExp(template)))) {
                    add(template.slice(cursor, match.index), true);
                    add(match[1], false);
                    cursor = match.index + match[0].length;
                }
                add(template.slice(cursor, template.length), true);
                html += "return tpl";
                html = html.replace(/[\r\t\n]/g, '');
                try {
                    return new Function(html).apply(data);// jshint ignore:line
                } catch (e) {
                    console.error("模版错误", e);
                }
            }
        };
        var publicMethod = {
            refresh: function () {
                vars.baseData.options = methods.originalSelect.optionsList();
                var html = methods.templateEngine(vars.refreshStructure, vars.baseData);
                vars.ulContainer.find("li").remove();
                vars.ulContainer.append(html);
                methods.updateStyle({itemHeight: vars.itemHeight, width: vars.width, displayHeight: vars.displayHeight});
                if (select[0].length === 0) {
                    methods.clear();
                    return;
                }
                var index = methods.originalSelect.index();
                index < 0 ? publicMethod.reset() : publicMethod.setByIndex(index);// jshint ignore:line
            },
            isSelected: function () {
                return vars.ulContainer.find("[data-selected=selected]").length === 0 ? false : true;
            },
            index: function () {
                var index = -1;
                var list = vars.ulContainer.find("li");
                list.each(function (i) {
                    if ($(this).is("[data-selected=selected]")) index = i;
                });
                return index;
            },
            val: function () {

                return vars.isComplete ? vars.hiddenInput.val() : (vars.isCascade ? select.val() : (this.isSelected() ? vars.ulContainer.find("[data-selected=selected]").data("value") : ""));
            },
            text: function () {
                return vars.isInput ? vars.selectWrapper.find(".display").val() : vars.selectWrapper.find(".display").text();
            },
            reset: function () {
                if (typeof vars.defaults == "number") publicMethod.setByIndex(vars.defaults);
                if (typeof vars.defaults == "object") {
                    var index = publicMethod.index();
                    if (index >= 0) {
                        var list = vars.ulContainer.find("li");
                        list.eq(index).removeAttr("data-selected");
                        if (vars.isCascade) {
                            select.find("option").removeAttr("selected");
                            select.find("option").eq(index).removeAttr("selected");
                        }
                    }
                    if (!vars.isInput) {
                        vars.display.text(vars.defaults.text);
                    } else {
                        vars.display.val(vars.defaults.value);
                    }
                    if (vars.isComplete)
                        methods.formPretend.updateVal(vars.defaults.value);
                }
            },
            setByIndex: function (index) {
                var list = vars.ulContainer.find("li");
                (index < list.length && index >= 0) && methods.setSelected.apply(list.eq(index));// jshint ignore:line
            },
            setByVal: function (value) {
                var target = vars.ulContainer.find("[data-value=" + value + "]");
                target && methods.setSelected.apply(target);// jshint ignore:line
            },
            setByText: function (text) {
                var list = vars.ulContainer.find("li");
                list.each(function () {
                    if ($(this).text() == text) $(this).click();
                });
            },
            setValByIndex: function (index, value) {
                vars.ulContainer.eq(index).attr("data-value", value);
            },
            getTextByIndex: function (index) {
                return vars.ulContainer.eq(index).data("value");
            },
            getTextByVal: function (value) {
                return vars.ulContainer.find("[data-value=" + value + "]").text();
            },
            updateStyle: methods.updateStyle,
            click: function (callback) {
                var that = this;
                vars.selectWrapper.on("click", ".display", function (e) {
                    callback && (typeof callback == "function") && callback.apply(that, [e]);// jshint ignore:line
                });
            },
            blur: function (callback) {
                var that = this;
                vars.selectWrapper.on("blur", function (e) {
                    callback && (typeof callback == "function") && callback.apply(that, [e]);// jshint ignore:line
                });
            },
            focus: function (callback) {
                var that = this;
                vars.selectWrapper.on("focus", ".display", function (e) {
                    callback && (typeof callback == "function") && callback.apply(that, [e]);// jshint ignore:line
                });
            },
            change: function (callback) {
                var that = this;
                vars.selectWrapper.on("mousedown", ".list > li", function (e) {
                    callback && (typeof callback == "function") && callback.apply(that, [e]);// jshint ignore:line
                });
            },
            trigger: function (event) {
                var index = publicMethod.index();
                switch (event) {
                    case "change":
                        index >= 0 && vars.ulContainer.find("li").eq(index).mousedown();// jshint ignore:line
                }
            },
            getName: function () {
                if (vars.isComplete) {
                    return vars.hiddenInput.attr("name");
                } else {
                    return select.attr("name");
                }
            },
            disabled: function () {
                methods.clear();
                methods.close();
                if (vars.isComplete) vars.hiddenInput.attr("disabled", "disabled");
                vars.selectWrapper.addClass("select_disabled");
            },
            readOnly: function () {
                methods.close();
                if (vars.isComplete) vars.hiddenInput.attr("readOnly", "readOnly");
                vars.selectWrapper.addClass("select_readOnly");
            },
            enabled: function () {
                if (vars.selectWrapper.is(".select_disabled")) {
                    if (vars.isComplete) vars.hiddenInput.removeAttr("disabled", "disabled");
                    vars.selectWrapper.removeClass("select_disabled");
                }
                if (vars.selectWrapper.is(".select_readOnly")) {
                    if (vars.isComplete) vars.hiddenInput.removeAttr("readOnly", "readOnly");
                    vars.selectWrapper.removeClass("select_readOnly");
                }
            }
        };
        $.data(el, "selectPicker", publicMethod);
        methods.init();
    };
    $.selectPicker.defaults = {
        isInput: false,
        "triangle": true,
        "classPrefix": "",
        "itemHeight": "40",
        "displayHeight": undefined,
        "width": undefined,
        "isCascade": false,
        "isComplete": true,
        "defaults": 0,
        "topOffset": 0,
        "change": function (e) {
        }
    };
    $.fn.selectPicker = function (options) {
        if (options === undefined) options = {};
        if (typeof options == "object") {
            $(this).each(function () {
                ($(this).data("selectPicker") === undefined) && ($.selectPicker(this, options));// jshint ignore:line
            });
        } else {
            var methodWithReturn = "val text index isSelected";
            if (typeof options == "string") {
                if (methodWithReturn.search(options) >= 0) {
                    var selectPicker = $(this).data("selectPicker");
                    if (selectPicker === undefined) return;
                    switch (options) {
                        case "val":
                            return selectPicker.val();
                        case "text":
                            return selectPicker.text();
                        case "index":
                            return selectPicker.index();
                        case "isSelected":
                            return selectPicker.isSelected();
                        case "name":
                            return selectPicker.getName();
                    }
                } else {
                    var argus = arguments;
                    $(this).each(function () {
                        var selectPicker = $(this).data("selectPicker");
                        if (selectPicker === undefined) return;
                        switch (options) {
                            case "refresh":
                                selectPicker.refresh();
                                break;
                            case "click":
                                selectPicker.click.apply(this, [argus[1]]);
                                break;
                            case "blur":
                                selectPicker.blur.apply(this, [argus[1]]);
                                break;
                            case "focus":
                                selectPicker.focus.apply(this, [argus[1]]);
                                break;
                            case "change":
                                selectPicker.change.apply(this, [argus[1]]);
                                break;
                            case "setByIndex":
                                selectPicker.setByIndex(argus[1]);
                                break;
                            case "setByVal":
                                selectPicker.setByVal(argus[1]);
                                break;
                            case "setByText":
                                selectPicker.setByText(argus[1]);
                                break;
                            case "updateStyle":
                                selectPicker.updateStyle(argus[1]);
                                break;
                            case "reset":
                                selectPicker.reset();
                                break;
                            case "trigger":
                                selectPicker.trigger.apply(this, [argus[1]]);
                                break;
                            case "disabled":
                                selectPicker.disabled.apply(this);
                                break;
                            case "enabled":
                                selectPicker.enabled.apply(this);
                                break;
                            case "readOnly":
                                selectPicker.readOnly.apply(this);
                                break;
                        }
                    });
                }
            }
        }
    };
})(jQuery);