// JavaScript Document
(function ($) {
	//设置ie6缓存图片
	if(!!window.ActiveXObject){
		!window.XMLHttpRequest && document.execCommand("BackgroundImageCache", false, true);
	}
	var info={"toConfig":"点击配置","waiting":"请稍候...","getChildErr":"获取子节点失败！","noChildMsg":"没有子节点信息！",
				"addNameErr":"名称不能为空且不能为纯数字，确定重新输入，取消不新增。","renameErr":"名称不能为空且不为能纯数字，请重新输入!",
				"noDel":"有子节点不可以删除","paramErr":"参数格式错误失败！","addErr":"请求地址不存在！"},//国际化默认信息
		typeRE=/^user|set|statistics|football|money|gold|billiards|basketball|golf|rugby|badminton|match|leaguematch$/;//树图际关键字
		hesSgfmdialog=false;
	//从页面获取国际化信息初始化
	$(document).ready(function(){
		if(window.sgfm && window.sgfm.treeInfo){
			$.extend(info, sgfm.treeInfo);
		}
		if($.sgfmdialog){hesSgfmdialog=true;}
	});

	//树初始化,用于对树结构的初始化，以及方法调用
	$.fn.sgfmtree = function(settings){
		var isMethodCall = (typeof settings == 'string'),//是否方法调用
		    args = Array.prototype.slice.call(arguments, 1),//获取第一个参数以外的所有参数
		    returnValue = this,//返回对象
		    instance = $.sgfmtree;//树插件工具

		// 如果是下划线开头的方法不让访问
		if(isMethodCall && settings.substring(0, 1) == '_') { return returnValue; }
		// 如果一个方法的调用执行方法
		if(isMethodCall) {
			this.each(function() {
				var methodValue;
				if(instance && $.isFunction(instance[settings])){ methodValue=instance[settings].apply(this,args);}	
				if(typeof methodValue !== "undefined"){returnValue = methodValue; return returnValue;}
			});
		}else{
			//回调函数初始化
			var callback = $.noop;
			if($.isFunction(args[0])){callback = args[0];}
			//初始化所有参数
			settings = init_params(settings);
			//初始化树结构
			this.each(function() {
				//调用初始化的方法
				$(this).empty().addClass("sgfmtree").html("<label style='line-height:18px'><ins class='st-loading-icon'>&#160;</ins>&#160"+info.waiting+"</label>");
				instance["_init"].call(this,settings,callback);
			});
		}
		// 返加jQuery对象	
		return returnValue;
	};

	//初始化所有参数
	function init_params(settings){
		if(!settings){settings = {};}
		if(!settings.url){settings.url=""}
		if(!settings.params){ settings.params=""}
		if(!settings.treetype){settings.treetype = ""}
		if(typeof settings.linkage === "string"){settings.linkage = settings.linkage.toLowerCase();}
		if(typeof settings.linkage !== "boolean" && "onlyoption" !== settings.linkage){settings.linkage = false;}
		if(!$.isFunction(settings.textload)){settings.textload = $.noop;}
		if(typeof settings.closeother !== "boolean"){settings.closeother = false;}
		if(isNaN(settings.opennum)){settings.opennum=1;}
		if(typeof settings.forSearchId !== "string"){settings.forSearchId="id";}
		if(typeof settings.selectedId !== "string"){settings.selectedId=false;}
		if(typeof settings.selectedClick !== "boolean"){settings.selectedClick=true;}
		return settings;
	}

	$.sgfmtree = {
		//对json对象加载为树结构
		_parse_json: function(js,settings,is_callback){
				     var textload=$.noop,opennum=1,forSearchId=false;
				     if(settings){
					     opennum=settings.opennum;
					     textload=settings.textload;
					     forSearchId=settings.forSearchId; 
				     }
				     //临时变量
				     var d = false, tmp,attr,metadata, i, j, ul1, ul2,mattr,len,isOpenCls,hasChildCls,jsdata,stCls;
				     //对象不存在返回false
				     if(!js) { return d; }
				     if($.isFunction(js)) { 
					     js = js.call(this);
				     }
				     if($.isArray(js)) {
					     d=document.createElement("ul");
					     len=js.length;
					     if(!len) { 
						     return false; 
					     } else{
						     i=0;
						     while(i<len){
							     tmp = this._parse_json(js[i++],settings, true);
							     d.appendChild(tmp);
						     };
						     //最后一个子节点增加最后节点样式
						     tmp.className="st-last";
						     d=$(d);
					     }
				     }
				     else{
					     if(typeof js == "string") { js = { data : {title:js} }; }
					     jsdata=js.data;
					     metadata=js.metadata;
					     if(!jsdata && jsdata !== "") { return d; }
					     d = document.createElement("li");
					     if(js.attr) {
						     for (attr in js.attr){
							     d.setAttribute(attr,js.attr[attr]);
						     }
					     }
					     $.data(d,"sgfmtree",jsdata);
					     $.data(d,"metadata",metadata);
					     var isOpen = opennum!==1 && $.isArray(js.children) && js.children.length >0;

					     isOpenCls=isOpen?"st-open":"st-closed";
					     hasChildCls=jsdata.haschild?isOpenCls:"st-n-child";
					     tmp=["<ins class ='"+hasChildCls+"' >&#160;</ins>"];

					     //-----------构造a-----------------------------------
					     if(typeof jsdata == "string") {
						     mattr={'href':'###',"title":jsdata}; 
					     } else {
						     mattr=jsdata.attr=jsdata.attr||{};
						     if(!mattr.href) { mattr.href = '###'; }
						     mattr.title = jsdata.title;
					     }
					     //增加订阅搜索信息
					     if(forSearchId && metadata && /^string|number$/.test(typeof metadata[forSearchId])){
						     mattr["searchId"]=metadata[forSearchId];
					     }

					     // 设置标签不可用点击
					     if(jsdata.disabled){
						     mattr["style"]="cursor:default;color:#aaa";
						     mattr["disabled"]="disabled";
					     }
					     //设置语言
					     if(jsdata.language){
						     mattr['class']=jsdata.language; 
					     }
					     //设置标签图标样式	
					     if( metadata && typeRE.test(metadata.treetype)){
						     stCls='st-'+metadata.treetype;
					     }else if(!jsdata.haschild){
						     stCls='st-n-child-icon';
					     }else if(isOpen){
						     stCls='st-open-icon';
					     }else{
						     stCls='st-closed-icon';
					     }
					     //组装a
					     tmp.push('<a');
					     for(attr in mattr){
						     tmp.push(" "+attr+"="+mattr[attr]);
					     }
					     tmp.push("><ins class='"+stCls+"'>&#160;</ins>");
					     tmp.push(jsdata.title);
					     tmp.push("</a>");
					     //---------------------------------------------
					     d.innerHTML=tmp.join('');
					     //增加IP信息
					     if(metadata){
						     if(metadata.navigateFlag === "001"){
							     var ins=document.createElement("ins");
							     ins.className="st-icon";
							     ins.innerHtml="&#160;"
								     d.appendChild(ins);
						     }else if(typeof metadata.mappingAddress !== "undefined" && metadata.mappingAddress != null){
							     var textValue = typeof metadata.mappingAddress === "string" ? metadata.mappingAddress : info.toConfig,
								     input=document.createElement("input");
							     input.type="text";
							     input.value=textValue;
							     input.readOnly=true;
							     input.className="st-ip";
							     d.appendChild(input);
							     textload.call(input,metadata);
						     }
					     }
					     //加载子节点
					     if(js.children) {
						     //if($.isFunction(js.children)) {
						     //	js.children = js.children.call(this, js);
						     //}
						     if($.isArray(js.children) && js.children.length) {
							     if(opennum>1){settings.opennum --;};
							     ul2 = this._parse_json(js.children,settings, true);
							     settings.opennum=opennum;
							     if(ul2.length) {
								     if(!isOpen){
									     ul2.hide();
								     }
								     d.appendChild(ul2[0]);
							     }
						     }
					     }
				     }
				     return d;
			     },


		//对json对象加载为树checkbox结构
		_parse_checkbox: function(js,opennum, is_callback){
					 if(isNaN(opennum)){opennum=1;}
					 //临时变量
					 var d = false, tmp,attr,metadata, i, j, ul1, ul2,mattr,len,isOpenCls,hasChildCls,jsdata,stCls,cls;
					 //对象不存在返回false
					 if(!js) { return d; }
					 if($.isFunction(js)) { 
						 js = js.call(this);
					 }
					 if($.isArray(js)) {
						 d=document.createElement("ul");
						 len=js.length;
						 if(!len) { 
							 return false; 
						 } else{
							 i=0;
							 while(i<len){
								 tmp = this._parse_checkbox(js[i++],opennum, true);
								 d.appendChild(tmp);
							 }
							 //最后一个子节点增加最后节点样式
							 tmp.className="st-last";
							 d=$(d);
						 }
					 }
					 else{
						 if(typeof js == "string") { js = { data : {title:js} }; }
						 jsdata=js.data;
						 metadata=js.metadata;
						 if(!js.data && js.data !== "") { return d; }
						 d =document.createElement("li"); 
						 if(js.attr) {
							 for (attr in js.attr){
								 d.setAttribute(attr,js.attr[attr]);
							 }
						 }
						 $.data(d,"sgfmtree",jsdata);
						 $.data(d,"metadata",metadata);

						 var isOpen = opennum!==1 && $.isArray(js.children) && js.children.length >0;
						 isOpenCls=isOpen?"st-open":"st-closed";
						 hasChildCls=jsdata.haschild?isOpenCls:"st-n-child";
						 tmp=["<ins class ='"+hasChildCls+"' >&#160;</ins>"];
						 //-----------构造a-----------------------------------
							 if(typeof jsdata == "string") {
								 mattr={'href':'###',"title":jsdata}; 
							 }else {
								 mattr=jsdata.attr=jsdata.attr||{};
								 if(!mattr.href) { mattr.href = '###'; }
								 mattr.title = jsdata.title;
								 if(jsdata.language) {
									 mattr['class']=jsdata.language; 
								 }
							 }	
						 if(metadata && typeRE.test(metadata.treetype)){
						     stCls='st-'+metadata.treetype;
						 }else{
							 stCls="st_checkbox";
							 if(metadata && metadata.checked === "yes"){
								 checkedCls="st-checked";
							 }else{
								 checkedCls="st-unchecked";
							 }
							 cls=mattr["class"]?mattr["class"]+' ':'';
							 mattr["class"]=cls+checkedCls;

						 }
					     tmp.push('<a');
					     for(attr in mattr){
						     tmp.push(" "+attr+"='"+mattr[attr]+"'");
					     }
					     tmp.push("><ins class='"+stCls+"'>&#160;</ins>");
					     metadata.redFont && tmp.push("<span class='f30'>"+metadata.redFont+"</span>");
					     tmp.push(jsdata.title);
					     tmp.push("</a>");
					     d.innerHTML=tmp.join('');
					     //---------------------------------------------
						 //加载子节点
						 if(js.children) {
							 //if($.isFunction(js.children)) {
							 //        js.children = js.children.call(this, js);
							 //}
							 if($.isArray(js.children) && js.children.length) {
							     if(opennum>1){opennum --;};
								 ul2 = this._parse_checkbox(js.children,opennum, true);
								 if(ul2.length) {
									 if(!isOpen){ul2.hide();}
									 d.appendChild(ul2[0]);
								 }
							 }
						 }
					 }
					 return d;
				 },
		//初始化树对象的事件
		_init:function(settings,callback){
			      var tree = this,
			      url = settings.url,
			      params = settings.params,
			      treetype = settings.treetype,
			      linkage = settings.linkage,
			      textload = settings.textload,
			      closeother = settings.closeother,
			      opennum = settings.opennum;
			      $(tree).data("url",url);
			      get_info(settings,params,function(json){
				      if(json.returncode == 0){
					      var instance =  $.sgfmtree,$tree=$(tree).empty(),
				      //初始化树
				      nt;
			      if($.isFunction(callback)){$(tree).data("fun",{"_callback":callback});}
			      var t;
			      if(treetype === "checkbox"){
				      t=new Date;
				      nt= instance["_parse_checkbox"](json.data,opennum);
				      console.log("_parse_checkbox:"+(new Date-t));
				      //树的初始化树事件
				      t=new Date;
				      instance["_checkbox_event"](nt,tree,linkage,closeother,opennum);
				      console.log("_checkbox_event:"+(new Date-t));
				      tree.appendChild(nt[0]);
				      if(linkage===true){
					      var trees = nt.find("li:has(ul)");
					      trees.each(function(){
						      var hasChecked = $(this).children("ul").has(".st-checked,.st-undetermined").length,
						      hasUnchecked = $(this).children("ul").has(".st-unchecked").length;
					      if(hasChecked && hasUnchecked ){
						      $(this).children("a").removeClass("st-checked st-unchecked").addClass("st-undetermined");
					      }else if(hasChecked){
						      $(this).children("a").removeClass("st-unchecked st-undetermined").addClass("st-checked");
					      }else{
						      $(this).children("a").removeClass("st-checked st-undetermined").addClass("st-unchecked");
					      }
					      });
				      }else if(linkage==="onlyoption"){
					      nt.find("li>a.st-checked").siblings("ul").find("li>a.st-unchecked").removeClass("st-unchecked").addClass("st-nchecked");
					      nt.find("li>a.st-unchecked").parent("li").has("a.st-checked").children("a").removeClass("st-unchecked").addClass("st-nchecked");
				      }
			      }else{
				      //树的初始化树事件
				      t=new Date();
				      nt= instance["_parse_json"](json.data,settings);
				      t=new Date-t; console.log("_parse_json:"+t);
				      t=new Date();
				      instance["_init_event"](nt,tree,closeother);
				      t=new Date-t; console.log("_init_event:"+t);
				      t=new Date();
				      tree.appendChild(nt[0]);
				      t=new Date-t; console.log("append:"+t);
			      }
			      //进行订阅选择
			      if(settings.selectedId){
				      var selectLi=$tree.find("a[searchId='"+settings.selectedId+"']");
				      if(settings.selectedClick){
					      selectLi.click()
				      }else{
					      selectLi.addClass("st-clicked");
				      }
				      selectLi.parents("ul:hidden").each(function(){
					      var $ul = $(this);
					      $ul.show();
					      $ul.siblings("ins.st-closed").removeClass("st-closed").addClass("st-open");
					      $ul.siblings("a").children("ins.st-closed-icon").removeClass("st-closed-icon").addClass("st-open-icon");
				      });
			      }
				      }
			      },$.noop);
		      },
		//初始化树的事件
		_checkbox_event:function(obj,tree,linkage,closeother){
					var instance = this,$obj=$(obj);
					$obj.delegate("li > ins:first-child","click",function(){
						instance["_node_open_close"].apply(this,[instance,tree,closeother]);
					}).delegate("a","click",function(){
						var callback = $(tree).data("fun")._callback;
						if($.isFunction(callback)){callback.apply($(this).parent().get(0));
							instance["_checkbox_click"].call(this,linkage);return false;
						}
					});
				},
		_checkbox_click:function(linkage){
					var $this = $(this),removeClass,addClass,removeChildClass;
					if(linkage==="onlyoption"){
						if($this.is(".st-checked")){
							$this.removeClass("st-checked").addClass("st-unchecked")
								$this.siblings("ul").find("li > a.st-nchecked").removeClass("st-nchecked").addClass("st-unchecked");
							$this.parent().parentsUntil("","li").not(":has(a.st-checked)").children("a.st-nchecked").removeClass("st-nchecked").addClass("st-unchecked");
						}else if($this.is(".st-unchecked")){
							$this.removeClass("st-unchecked").addClass("st-checked");
							$this.siblings("ul").find("li > a.st-unchecked").removeClass("st-unchecked").addClass("st-nchecked");
							$this.parent().parentsUntil("","li").has("a.st-checked").children("a.st-unchecked").removeClass("st-unchecked").addClass("st-nchecked");
						}
						return;
					}
					if($this.is(".st-checked")){
						removeClass=removeChildClass="st-checked";addClass="st-unchecked";
					}else if($this.is(".st-unchecked")){
						removeClass=removeChildClass="st-unchecked";addClass="st-checked";
					}else{
						removeClass="st-undetermined";addClass="st-checked";
						removeChildClass="st-unchecked st-undetermined";
					}
					//处理节点的选中状态
					$this.removeClass(removeClass).addClass(addClass);
					//处理节点中的了节点选中状态_当节点的选中状态影响子节点和父节点时才需要处理
					if(linkage===true){
						$this.siblings("ul").find("li > a").removeClass(removeChildClass).addClass(addClass);
						var trees = $this.parent().parentsUntil("","li");
						trees.each(function(){
							var hasChecked = $(this).children("ul").has(".st-checked,.st-undetermined").length > 0,
							hasUnchecked = $(this).children("ul").has(".st-unchecked").length > 0;
						if(hasChecked && hasUnchecked ){
							$(this).children("a").removeClass("st-checked st-unchecked").addClass("st-undetermined");
						}else if(hasChecked){
							$(this).children("a").removeClass("st-unchecked st-undetermined").addClass("st-checked");
						}else{
							$(this).children("a").removeClass("st-checked st-undetermined").addClass("st-unchecked");
						}
						});
					}
				},

		//初始化树的事件
		_init_event:function(obj,tree,closeother){
				    var instance,$obj,$obj=$(obj);	
				    instance = this;
				    $obj.delegate("li>ins:first-child","click",function(){
				    	instance["_node_open_close"].apply(this,[instance,tree,closeother]);
				    }).delegate("a","dblclick",function(){
					    instance["_node_open_close"].apply($(this).prev()[0],[instance,tree]);return false;
				    }).delegate("a:not([disabled])",{
					    "click":function(){
						    $(tree).find("a.st-clicked").removeClass("st-clicked");
						    $(this).addClass("st-clicked");
						    var callback = $(tree).data("fun")._callback;
						    if($.isFunction(callback)){callback.apply($(this).parent().get(0));}
						    return false;
					    },
					    "mouseout":function(){
						    $(this).removeClass("st-hovered");
					    },
					    "mouseover":function(){
						    $(this).addClass("st-hovered");
					    }
				    });
			    },

		//子节点打开和关闭
		_node_open_close:function(obj,tree,closeother){
					 var li = $(this).parent("li"),ins = this;
			if(li.data("sgfmtree").haschild){
				if(li.has("ul").length > 0){
					$(this).siblings("ul").slideToggle(100,function(){
						if($(this).is(":hidden")){
							$(ins).removeClass("st-open").addClass("st-closed");
							$(ins).siblings("a").children("ins.st-open-icon").removeClass("st-open-icon").addClass("st-closed-icon");
						}else{
							$(ins).removeClass("st-closed").addClass("st-open");
							$(ins).siblings("a").children("ins.st-closed-icon").removeClass("st-closed-icon").addClass("st-open-icon");
							//关闭其它兄弟节点
							if(closeother){
								$(ins).parent().siblings("li:has(ul)").children("ul").slideUp(100).siblings("ins").removeClass("st-open").addClass("st-closed");
							}
						}
					});
				}else{
					var temHtml = $(this).siblings("a").html(),instance = $.sgfmtree,li_json = this,$li=$(li_json),url = $(this).parent().data("sgfmtree").url,params = $(this).parent().data("sgfmtree").params;
					if(!url){url = $(tree).data("url");}
					if((typeof url ==="string")&& $.trim(url)!==""){
					$(this).siblings("a").html(info.waiting).prepend("<ins class='st-loading-icon'>&#160;</ins>");
						
						//子节点打开 修改，修改
						get_info({"url":url},params,function(json){
							if(json.returncode == 0 && $.isArray(json.data)){
								if(json.data.length > 0){
									var temJson = obj["_parse_json"](json.data).hide();
									$li.parent().append(temJson);
									obj["_init_event"](temJson,tree);
									$(temJson).slideDown(100);
									$li.removeClass("st-closed").addClass("st-open");
									$li.siblings("a").html(temHtml).children("ins.st-closed-icon").removeClass("st-closed-icon").addClass("st-open-icon");
									if(closeother){
										$li.parent().siblings("li:has(ul)").children("ul").slideUp(100).siblings("ins").removeClass("st-open").addClass("st-closed");
									}
								}else{
									$li.siblings("a").html(temHtml).children("ins").removeClass("st-closed-icon").addClass("st-n-child-icon");
									$li.removeClass("st-closed").addClass("st-n-child");
									$li.data("sgfmtree",$.extend($li.data("sgfmtree"),{haschild:false}));
								}
							}else{
								/*
								 * todo 增加错误提示
								 */
								$.sgfmdialog({"info":info.getChildErr,level:1},function(){$li.siblings("a").html(temHtml);});
								
							}

						},function(){
							/*
							 * todo 增加错误提示
							 */
							$.sgfmdialog({"info":info.getChildErr,level:1},function(){$li.siblings("a").html(temHtml);});
							return true;
						});
			
					}else{
						/*
						 * todo 增加错误提示
						 */
						$.sgfmdialog({"info":info.noChildMsg,level:1},function(){$li.siblings("a").html(temHtml);});
					}
				}
			}
		},
		_get_node:function(obj){
		},
		//修改选中节点名称
		rename:function(fun){
			var tmp = $(this).find("a.st-clicked"),
				li = tmp.parent(),
			    html = tmp.html(),
			    textvalue = $.trim(tmp.text());
			tmp.html(tmp.children())
			.after("<input type='text' class='treetext' value='"+ textvalue +"' maxlength='50' />")
			.siblings(":text")
			.blur(function(){
				var $this=$(this);
				if($.trim(this.value) === "" || /^[\d]+$/.test(this.value)){
					if(hesSgfmdialog){
						$.sgfmdialog(info.renameErr,function(){
							$this.focus().select();
						});
					}else{
						alert(info.renameErr);
						$this.focus().select();
					}
				}else{ //名称没有修改
					//名称进行更新
					var c = tmp.children(),//获取节点信息
						text = $.trim(this.value)//获取当前文本信息
						isModif = text !== textvalue;//是否修改了
					if($.isFunction(fun) && fun.apply(li) && isModif){
						tmp.text($.trim(this.value)).prepend(c).siblings(":text").remove();
					}else if($.isPlainObject(fun) && isModif){
						var params = fun.params,txtparamname = fun.txtparamname,metadata = li.data("metadata");
						if(typeof params === "string"){
							params = $.trim(params);
							if(params !== ""){params += "&";}
							params += txtparamname + "=" + this.value;
						}else{
							if(!$.isPlainObject(params)){params = {};}
							params[txtparamname] = this.value;
						}
						get_info.call(li,fun,params,function(json){
							tmp.text(text).prepend(c).siblings(":text").remove();
							if(json.data){
								$.sgfmtree["_refreshlist"].call(this.get(0),json.data[0],true);
							}
							
							//调用回调函数
							if($.isFunction(fun.callback)){fun.callback.call(this.get(0),json)}
						},function(){
							tmp.html(html).siblings(":text").remove();
						});
						
					}else{
						tmp.html(html).siblings(":text").remove();
					}
				}	
			})
			.keyup(function(event){
				if (event.keyCode == '13') {
					this.blur();
				}				   
			}).click(function(){return false;}).select().focus();
		},
		//删除选中节点
		remove:function(fun){
			var li = $(this).find("a.st-clicked").parent();
			if(!li.data("sgfmtree").haschild)
			{
				if($.isFunction(fun) && fun.apply(li) ){
					if(li.is(":only-child")){
						li.parent().siblings("ins:first").removeClass("st-open").addClass("st-n-child");
						if(li.parent().parent().data("sgfmtree")){li.parent().parent().data("sgfmtree").haschild =  false;}
						li.parent().remove();
						
					}else{
						if(li.is(".st-last"))
						{
							li.prev("li").addClass("st-last");
						}
						//增加最后一个内容
						li.remove();
					}
				}else if($.isPlainObject(fun)){	
					//删除节点的后台处理
					get_info.call(li,fun,false,function(){
						if(this.is(":only-child")){
							this.parent().siblings("ins:first").removeClass("st-open").addClass("st-n-child");
							if(this.parent().parent().data("sgfmtree")){this.parent().parent().data("sgfmtree").haschild =  false;}
							this.parent().remove();
							
						}else{
							if(this.is(".st-last"))
							{
								this.prev("li").addClass("st-last");
							}
							//增加最后一个内容
							this.remove();
						}

						if($.isFunction(fun.callback)){fun.callback.call(this.get(0));}
					});
				}
			}else{
				$.sgfmdialog(info.noDel);
			}
		},
		//增加节点
		add_node:function(fun){
			var parentLi = $(this).find("a.st-clicked").parent(),ul,ishide,tree = this;
			if(parentLi.length===0){
				parentLi = $(this);
			}
			if(!parentLi.is(":has(ul)")){
				if(parentLi.data("sgfmtree") && parentLi.data("sgfmtree").haschild){
					parentLi.children("ins:first").click();
				}else{
					parentLi.append("<ul>");
					if(parentLi.parent().parent().data("sgfmtree")){
						parentLi.parent().parent().data("sgfmtree").haschild =  true;
					}else{
						parentLi.parent().parent().data("sgfmtree",{"haschild":true});
					}

				}
			}
			parentLi.children("ul").show();
			ul = parentLi.children("ul");
			var li = $("<li>").append("<ins class='st-n-child'>&#160;</ins>").append($("<a>").append("<ins class='st-n-child-icon'>&#160;</ins>"));
			ul.append(li).siblings("ins:first").removeClass("st-open").addClass("st-open");
			
						 		li.children("a").after($("<input type='text' class='treetext' value='' maxlength='50' />")
										.blur(function(){
											var txt = this;
											if($.trim(this.value) !=="" && !/^[\d]+$/.test(this.value) && ($.isFunction(fun) && fun.apply(this))){
												var c = li.children("a").children();
												li.children("a").text($.trim(this.value)).prepend(c);	
												$(this).remove();
												$.sgfmtree["_init_event"].apply($.sgfmtree,[li,tree]);
												li.data("sgfmtree",{"title":$.trim(this.value),"haschild":false});
											
											}else{
												if($.trim(this.value) !=="" && !/^[\d]+$/.test(this.value) && $.isPlainObject(fun)){
													var params = fun.params,txtparamname = fun.txtparamname,metadata = li.parent().parent().data("metadata");
													if(typeof params === "string"){
														params = $.trim(params);
														if(params !== ""){params += "&";}
														params += txtparamname + "=" + $.trim(this.value);
													}else{
														if(!$.isPlainObject(params)){params = {};}
														params[txtparamname] = $.trim(this.value);
													}
													get_info.call(li,fun,params,function(json){
														var c = this.children("a").children(),text=$.trim(txt.value);
														this.children("a").text(text).prepend(c);	
														$(txt).remove();
														$.sgfmtree["_init_event"].apply($.sgfmtree,[this,tree]);
														if(json.data){
															$.sgfmtree["_refreshlist"].call(this.get(0),json.data[0]);
														}
														//触发点击节点，可能有问题
														this.children("a").click();
														if($.isFunction(fun.callback)){fun.callback.call(this.get(0),json);}
													},function(){
														if(this.is(":only-child")){
															this.parent().siblings("ins:first").removeClass("st-open").addClass("st-n-child");
															if(this.parent().parent().data("sgfmtree")){this.parent().parent().data("sgfmtree").haschild =  false;}
															this.parent().remove();
														}else{
															if(this.is(".st-last"))
															{
																this.prev("li").addClass("st-last");
															}
															//增加最后一个内容
															this.remove();
														}
													});
														
												}else{
													if(hesSgfmdialog){
														$.sgfmdialog(info.addNameErr,0,function(isConfirm){
															if(isConfirm){
																$(txt).focus().select();
															}else{
																if(li.is(":only-child")){
																	li.parent().siblings("ins:first").removeClass("st-open").addClass("st-n-child");
																	if(li.parent().parent().data("sgfmtree")){li.parent().parent().data("sgfmtree").haschild =  false;}
																	li.parent().remove();
																}else{
																	if(li.is(".st-last"))
																	{
																		li.prev("li").addClass("st-last");
																	}
																	//增加最后一个内容
																	li.remove();
																}
															}
																		
														});
													}else{
														if(confirm(info.addNameErr)){
															$(txt).focus().select();
														}else{
															if(li.is(":only-child")){
																li.parent().siblings("ins:first").removeClass("st-open").addClass("st-n-child");
																if(li.parent().parent().data("sgfmtree")){li.parent().parent().data("sgfmtree").haschild =  false;}
																li.parent().remove();
															}else{
																if(li.is(".st-last"))
																{
																	li.prev("li").addClass("st-last");
																}
																//增加最后一个内容
																li.remove();
															}
														}
													}
												}
											}
										})
										.keyup(function(event){	
											if (event.keyCode == '13') {
												this.blur();
											}
										}));
			
			li.addClass("st-last").prev().removeClass("st-last");
			li.addClass("st-last").children(":text").focus();
			ul.parent().data("sgfmtree") ? ul.parent().data("sgfmtree").haschild =  true : ul.parent().data("sgfmtree",{"haschild":true});
			ul.parent().siblings("li:has(ul)").children("ul").slideUp(100).siblings("ins").removeClass("st-open").addClass("st-closed");
		},
		add_ico:function(fun){
			
			var li = $(this).find("a.st-clicked").parent();
			if($.isFunction(fun) && fun.apply(li)){
				toggle_ico.apply(li);
			}else if($.isPlainObject(fun)){
				get_info.call(li,fun,false,function(json){
					toggle_ico.apply(this);
					if(json.data){
						$.sgfmtree["_refreshlist"].call(this.get(0),json.data[0],true);
					}
					if($.isFunction(fun.callback)){fun.callback.call(this.get(0),json)}
				});
			}else{
				/*
				 * todo 错误信息的处理
				 */
				$.sgfmdialog(info.paramErr);
			}
			
		},
		//刷新当前节点内容
		_refreshlist:function(data,isModif){
			var li = $(this),tmp,js,isOpen=false;
			if(typeof data == "string") { data = { data : {title:data} }; }
			if(!data.data && data.data !== "") { return this; }
			if(data.attr) { li.attr(data.attr); }
			if(isModif){
				li.data("sgfmtree", $.extend(li.data("sgfmtree")||{},data.data||{})); 
				li.data("metadata", $.extend(li.data("metadata")||{},data.metadata||{})); 
			}else{
				li.data("sgfmtree", data.data); 
				li.data("metadata", data.metadata); 
			}
			isOpen = li.is(":has(ul:visible)");
			var metadata=li.data("metadata"),sgfmtree=li.data("sgfmtree");
			
			tmp = li.children("a");
			if(typeof sgfmtree == "string") { tmp.attr('href','###')["text"](sgfmtree); }
			else {
				if(!data.attr) { data.attr = {}; }
				if(!data.attr.href) { data.attr.href = '###';}
				data.attr.title = sgfmtree.title;
				tmp.attr(data.attr)["text"](sgfmtree.title);
			}
			if(typeRE.test(metadata.treetype)){
				tmp.prepend("<ins class='st_"+metadata.treetype+"'>&#160;</ins>");
			}else{
				if(!sgfmtree.haschild){
					tmp.prepend("<ins class='st-n-child-icon'>&#160;</ins>");
				}else if(isOpen){
					tmp.prepend("<ins class='st-open-icon'>&#160;</ins>");
				}else{
					tmp.prepend("<ins class='st-closed-icon'>&#160;</ins>");
				}
			}	
			// 设置标签不可用点击
			if(sgfmtree.disabled){
				tmp.css({cursor:"default",color:"#AAA"}).attr("disabled","disabled");
			}
				
			if(!sgfmtree.haschild){
				li.children("ins").removeClass("st-open st-closed").addClass("st-n-child");
			}else if(isOpen){
				li.children("ins").removeClass("st-closed st-n-child").addClass("st-open");
			}else{
				li.children("ins").removeClass("st-open st-n-child").addClass("st-closed");
			}
		},
		//刷新当前节点内容
		refreshlist:function(json,isModif){
			var li = $(this).find("a.st-clicked").parent();
			if(json.returncode == 0){
				$.sgfmtree["_refreshlist"].call(li.get(0),json.data[0],isModif);
			}else{
				/*
				 * todo 这里增加错误提示
				 */
				$.sgfmdialog(json.errmsg,json.returncode);
			}
		},
		get_select:function(){
			return $(this).find("a.st-clicked").parent();
		},
		//获取选择框选中的对象
		get_checked:function(callback){
			var $this=$(this);
			if(typeof callback ==="undefined"){
				return $this.find("li:has(>a.st-checked)");
			}else if($.isPlainObject(callback) || typeof callback === "string"){
				if(typeof callback === "string"){callback={"type":callback};}
				var tmp=[],dataname=callback.dataname,type=callback.type,checkedTree;
				if(typeof type === "string"){type=type.toLowerCase();}
				if("all"===type){
					checkedTree=$this.find("li:has(>a.st-checked),li:has(>a.st-undetermined)");
				}else if("partchecked"===type){
					checkedTree=$this.find("li:has(>a.st-undetermined)");
				}else if("notchild"===type){
					checkedTree=$this.find("li:has(>a.st-checked):not(:has(ul))");
				}else if("parent"===type){
					checkedTree=$this.find("li:has(>a.st-checked):has(ul)");
				}else if("allparent"===type){
					checkedTree=$this.find("li:has(>a.st-checked):has(ul),li:has(>a.st-undetermined):has(ul)");
				}else{
					checkedTree=$this.find("li:has(>a.st-checked)");
				}
				if(typeof dataname === "string"){
					if("all" === dataname.toLowerCase()){
						tmp = checkedTree.map(function(){
							return $(this).data("metadata");
						}).get();
					}else{
						tmp = checkedTree.map(function(){
							var data = $(this).data("metadata");
							if(data){
								return data[dataname];  
							}
						}).get();
					}
				}else{
					tmp = false;
				}
				if($.isFunction(callback.callback)){
					return callback.callback.call(checkedTree,tmp);
				}else{
					if(tmp){
						return tmp;
					}else{
						return checkedTree;
					}
				}
			}else if($.isFunction(callback)){
				return callback.apply($this.find("li:has(>a.st-checked)"));
			}
		}
	};
	
	//图标切换
	function toggle_ico(){
		var icon = this.children("ins.st-icon");
		if(icon.length === 0){
			this.children("a").after("<ins class='st-icon'>&#160;</ins>");
		}else{
			icon.remove();
		}
	}
	
	//获取信息，返回true有链接已经发送请求，返回false链不正确没有发送请求
	function get_info(settings,params,callback,errorcall){
		var type = settings.ajaxtype ? settings.ajaxtype : "POST";
		if(!params){params = settings.params;}
		if(settings.url){
			$.ajax({
				"url": settings.url,
				"context": this,
				"data": params,
				"type": type,
				"cache":false,
				"dataType": "json",
				"success": function(html){
					if(html.returncode == 0){
						var start,end;
						callback.call(this,html);
					}else{
						/*
						 * todo 这里增加错误提示
						 */
						if(typeof html.errmsg === "string"){
							var retruncode = /^[123]$/.test(html.returncode) ? html.returncode : 3;
							$.sgfmdialog(html.errmsg,retruncode);
						}
						if($.isFunction(errorcall)){
							errorcall.call(this);
						}
					}
				},
				"error": function(jqXHR,textStatus,errorThrown){
					/*
					 * todo 对请求错误信息进行处理
					 */
					 //$.sgfmdialog(errorThrown,1);
//					if(settings.haserrmsg){
						//$.sgfmdialog(errorThrown,1);
//					}
					if($.isFunction(errorcall)){
						if(!errorcall.call(this)){
							$.sgfmdialog(errorThrown,1);
						}
					}
				}
			});
			return true;
		}else{
			/*
			 * todo 对请求错误信息进行处理
			 */
//			if(settings.haserrmsg){
				
//			}
			if($.isFunction(errorcall)){
				if(!errorcall.call(this)){
					$.sgfmdialog(info.addErr,1);
				}
			}
			return false;
		}
	}
	
})(jQuery);
