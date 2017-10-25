
define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",
	"dijit/form/HorizontalSlider",
	"dijit/form/HorizontalRuleLabels",
	"dijit/form/HorizontalRule",
	"dijit/form/VerticalRuleLabels",
	"dijit/form/VerticalRule",
	"dijit/form/VerticalSlider",
	"mxui/dom",
	"dojo/dom-construct",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/string"
],
function (declare, _WidgetBase, HorizontalSlider, HorizontalRuleLabels, HorizontalRule, VerticalRuleLabels, VerticalRule, VerticalSlider, dom, domConstruct,lang, domStyle, dojoString) {
	return declare("Slider.widget.slider", [ _WidgetBase ], {
		name : '',
		sliderWidth  : 300,
		sliderHeight  : 50,
		direction : 'horizontal',
		onchangemf : '',
		includeEmpty : false,
		emptyCaption : '',
		enumExceptions : '',
 
	
	//IMPLEMENTATION
	isInactive : false,
	hasChanged : false,
	context : null,
	slideEnum : null,
	currentNr : 0,
	slider : null,
	exceptions: null,
	
	getSlideEnum : function(context) {
		this.context = context;
		// var trackClass = context.getTrackClass ? context.getTrackClass() : context.trackClass; //MWE: getTrackClass() does not exist anymore in 3.0
		// if (trackClass == '')
		// 	return;
		
		var meta = mx.meta.getEntity(context.getEntity());;
		this.slideEnum = [];
		if (this.enumExceptions != '')
			this.exceptions = this.enumExceptions.split(",");
		
		if(meta && meta.getAttributeType(this.name) == 'Enum') {
			this.slideEnum = meta.getEnumMap(this.name);
			var spliceList = [];
			if (this.exceptions)
				for (var j = 0; j < this.exceptions.length; j++) {
					var exception = this.exceptions[j].replace(/^ /gi, '');
					for (var i = 0; i < this.slideEnum.length; i++) {
						if (this.slideEnum[i].key == exception)
							spliceList.push(i);
					}
				}
			for (var i = 0; i < spliceList.length; i++) {
				this.slideEnum.splice(spliceList[i]-i, 1);
			}
			
			if (this.includeEmpty == true) {
				var emptyValue = {
					'key': '',
					'caption': this.emptyCaption
				}
				this.slideEnum.unshift(emptyValue);
			}
		}
	},
	
	renderSlide : function (mxobject) {
		var enumArray = [];
		var longestStr = '';
		if (this.slideEnum && this.slideEnum.length > 0) {
			domConstruct.empty(this.domNode);
			var currentValue = mxobject.get(this.name);
			for (var i = 0; i < this.slideEnum.length; i++) {
				var strSize = (this.slideEnum[i].caption).length;
				if (this.slideEnum[i].key == currentValue)
					this.currentNr = i;
				
				if (strSize > longestStr)
					longestStr = strSize;
				enumArray.push(this.slideEnum[i].caption);
			}
			var enumcount = this.slideEnum.length;
			if (this.direction == "horizontal") {
				var sliderRuleLabels = new HorizontalRuleLabels({
					container: 'bottomDecoration',
					labels: enumArray,
					style: 'cursor: pointer',
					onMouseUp : lang.hitch(this, function (e) {
						var value = e.target.innerHTML;
						if (value.indexOf("<") > -1)
							value = dojoString.trim(value.substring(0, value.indexOf("<") || value.length));
						
						if (value != "") {
							for (var i = 0; i < this.slideEnum.length; i++) {
								if (this.slideEnum[i].caption == value) {
									this.currentNr = i;
									this.slider.attr("value", i);
									return;
								}
							}
						}
					})

				}, dom.create("div"));
				
				var sliderRule = new HorizontalRule({
					count: enumcount,
					container: 'bottomDecoration',
					style: 'width: 100%; height: 5px;'
				}, dom.create("div"));
				
				this.slider = new HorizontalSlider({
					name: "slider_widget",
					value: this.currentNr,
					minimum: 0,
					maximum: enumcount-1,
					intermediateChanges: true,
					discreteValues: enumcount,
					style: "width:"+this.sliderWidth+"px; height: 30px;",
					// onMouseUp: lang.hitch(this, this.execclick),
					// onBlur: lang.hitch(this, this.execclick),
					onChange: lang.hitch(this, this.execclick)
					// lang.hitch(this, function(value) {
					// 	this.hasChanged = true;
					// 	this.onChange();
					// })
				});
				
				this.slider.addChild(sliderRule);
				this.slider.addChild(sliderRuleLabels);
				sliderRuleLabels.startup();
				sliderRule.startup();
				this.slider.startup();
				domStyle.set(this.slider.progressBar, "background", "none");
				this.domNode.appendChild(this.slider.domNode);
				domStyle.set(this.slider.containerNode, 'textAlign', 'left');
			} else {
				// Vertical slider is rendered bottom up, so reversing the enum so it still starts at the top.
				enumArray = enumArray.reverse();
				this.slideEnum = this.slideEnum.reverse();
				var flipped = enumArray.length - (this.currentNr+1);
				
				var sliderRuleLabels = new VerticalRuleLabels({
					container: 'rightDecoration',
					style : 'cursor: pointer',
					labels: enumArray,
					onMouseUp : lang.hitch(this, function (e) {
						var value = e.target.innerHTML;
						if (value.indexOf("<") > -1)
							value = dojoString.trim(value.substring(0, value.indexOf("<") || value.length));
						
						if (value != "") {
							for (var i = 0; i < this.slideEnum.length; i++) {
								if (this.slideEnum[i].caption == value) {
									this.currentNr = i;
									this.slider.attr("value", i);
									return;
								}
							}
						}
					})
				}, dom.create("div"));
				
				var sliderRule = new VerticalRule({
					count: enumcount,
					container: 'rightDecoration',
					style: 'width: 5px;'
				}, dom.create("div"));
				
				this.slider = new VerticalSlider({
					name: "slider_widget",
					value: flipped,
					minimum: 0,
					maximum: enumcount-1,
					intermediateChanges: true,
					discreteValues: enumcount,
					style: "height: "+this.sliderHeight+"px;",
					// onMouseUp: lang.hitch(this, this.execclick),
					// onBlur: lang.hitch(this, this.execclick),
					onChange: lang.hitch(this, this.execclick)
					// lang.hitch(this, function(value) {
					// 	this.hasChanged = true;
					// 	this.onChange();
					// })
				});
				
				this.slider.addChild(sliderRule);
				this.slider.addChild(sliderRuleLabels);
				sliderRuleLabels.startup();
				sliderRule.startup();
				this.slider.startup();
				domStyle.set(this.slider.progressBar, "background", "none");
				domStyle.set(this.domNode, 'height', (this.sliderHeight+50)+"px"); // IE fix.
				this.domNode.appendChild(this.slider.domNode);
			}
		}
		this.slider.attr('disabled', this.isInactive);
	},
	
	execclick : function() {
		// if (this.hasChanged == true){ 
		// 	this.hasChanged = false;
			if (this.onchangemf != '' && this.context && this.context.getGuid()) {
				var context = new mendix.lib.MxContext();
				context.setContext(this.context.getEntity(), this.context.getGuid());
				mx.ui.action(this.onchangemf,{
					context		: context,
					callback	: function() {
						// ok	
					},
					error		: function() {
						// error
					}
				});
			}
		// }
	},
	
	postCreate : function(){
		//housekeeping
		domConstruct.empty(this.domNode);
		domStyle.set(this.domNode, {
			"height" : this.sliderHeight+"px",
			"width" : this.sliderWidth+"px"
		});
		
		this.exceptions = [];
		
	},
	
	resize: function (box) {
		console.log(this.id + ".resize");
	},

	_setDisabledAttr : function(value) {
		this.isInactive = !!value;
		if (this.slider)
			this.slider.attr('disabled', !!value);
	},
	
	_getValueAttr : function () {
		if (this.slideEnum && this.slider)
			return this.slideEnum[this.slider.attr('value')].key;
		else
			return '';
	},
	
	onChange : function () {
	},
	
	_setValueAttr : function(value) {
		if (this.slideEnum && this.slideEnum.length > 0 && this.slider.attr("value") != value)
			for (var i = 0; i < this.slideEnum.length; i++)
				if (this.slideEnum[i].key == value) {
					this.currentNr = i;
					if (this.slider)
						this.slider.attr("value", i);
				}
	},
	
	update : function(context, callback){
		this.getSlideEnum(context);
		if (context && context.getGuid()) 
			mx.data.get({
				guid: context.getGuid(),
				callback: lang.hitch(this, this.renderSlide)
			});
		else
			logger.warn(this.id + ".applyContext received empty context");
		callback && callback();
	},
	
	uninitialize : function(){
		this.slider && this.slider.destroyRecursive();
	}
});
});
require(["Slider/widget/slider"]);
