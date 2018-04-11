function SD(){
	this.sdArr = [];//生成的数独数组	
	this.errorArr = [];//错误的格子。
	this.blankNum = 30;//空白格子数量 
	this.backupSdArr = [];//数独数组备份。
}

SD.prototype={  //为SD对象添加原型函数
	constructor:SD, //将SD的构造函数指定为SD
	init:function(blankNum){
		this.createDoms(); //生成九宫格
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
				this.blankNum = this.setLevel()||blankNum || this.blankNum;		
		this.drawCells();
		this.createBlank(this.blankNum);
        this.createBlankCells();
        this.createButtons();
		this.addStyle();
		this.isMobile();
	},
	reset:function(){
		//重置程序。
		this.setLevel()
	},
	again:function(){
		//重玩本局
		this.errorArr = [];
		$(".sdli").removeClass('lineSelected blankCell wrong');		
		this.createBlankCells();
	},
	setLevel:function(){
		//用户输入难度。
		$('.level-modal').modal('show');
	},
	createSdArr:function(){
		//生成数独数组。
		var that = this;
		try{
			this.sdArr = [];
			this.setThird(2,2);
			this.setThird(5,5);
			this.setThird(8,8);
			var allNum = [1,2,3,4,5,6,7,8,9];
			outerfor:
			for(var i=1;i<=9;i++){
				innerfor:
				for(var j=1;j<=9;j++){
					if(this.sdArr[parseInt(i+''+j)]){
						continue innerfor;
					}
					var XArr = this.getXArr(j,this.sdArr);
					var YArr = this.getYArr(i,this.sdArr);
					var thArr = this.getThArr(i,j,this.sdArr);
					var arr = getConnect(getConnect(XArr,YArr),thArr);
					var ableArr = arrMinus(allNum,arr);

					if(ableArr.length == 0){
						this.createSdArr();
						return;
						break outerfor;
					}

					var item;
					//如果生成的重复了就重新生成。
					do{
						item = ableArr[getRandom(ableArr.length)-1];
					}while(($.inArray(item, arr)>-1));

					this.sdArr[parseInt(i+''+j)] = item;
				}
			}
			this.backupSdArr = this.sdArr.slice();
		}catch(e){
			//如果因为超出浏览器的栈限制出错，就重新运行。
			that.createSdArr();
		}
	},
	getXArr:function(j,sdArr){
		//获取所在行的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(this.sdArr[parseInt(a+""+j)]){
				arr.push(sdArr[parseInt(a+""+j)])
			}
		}
		return arr;
	},
	getYArr:function(i,sdArr){
		//获取所在列的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(sdArr[parseInt(i+''+a)]){
				arr.push(sdArr[parseInt(i+''+a)])
			}
		}
		return arr;
	},
	getThArr:function(i,j,sdArr){
		//获取所在三宫格的值。
		var arr = [];
		var cenNum = this.getTh(i,j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a =0;a<9;a++){
			if(sdArr[thIndexArr[a]]){
				arr.push(sdArr[thIndexArr[a]]);
			}
		}
		return arr;
	},
	getTh:function(i,j){
		//获取所在三宫格的中间位坐标。
		var cenArr = [22,52,82,25,55,85,28,58,88];
		var index = (Math.ceil(j/3)-1) * 3 +Math.ceil(i/3) -1;
		var cenNum = cenArr[index];
		return cenNum;
	},
	setThird:function(i,j){
		//为对角线上的三个三宫格随机生成。
		var numArr = [1,2,3,4,5,6,7,8,9];
		var sortedNumArr= numArr.sort(function(){return Math.random()-0.5>0?-1:1}); //随机打乱数组
		var cenNum = parseInt(i+''+j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a=0;a<9;a++){
			this.sdArr[thIndexArr[a]] = sortedNumArr[a];
		}
	},
	drawCells:function(){
		//将生成的数组填写到九宫格
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sd").eq(j-1).find(".sdli").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	},
	createBlank:function(num){
		//生成指定数量的空白格子的坐标。
		var blankArr = [];
		var numArr = [1,2,3,4,5,6,7,8,9];
		var item;
		for(var a =0;a<num;a++){
			do{
				item = parseInt(numArr[getRandom(9) -1] +''+ numArr[getRandom(9) -1]);
			}while($.inArray(item, blankArr)>-1);
			blankArr.push(item);
		}
		this.blankArr = blankArr;
	},
	createBlankCells:function(){
		//在创建好的数独中去除一部分格子的值，给用户自己填写。把对应格子变成可编辑,并添加事件。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom;

		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sd").eq(y-1).find(".sdli").eq(x-1);
			dom.attr('contenteditable',true).html('').addClass('blankCell');		
			this.backupSdArr[blankArr[i]] = undefined;
		}

		$(".blankCell").click(function(event) {
            $('.sdli').removeClass('selected');   
            $(this).addClass('selected');
            var y = $(this).index();
            $('.sdli').removeClass('lineSelected wrong');
			$(this).parent().find('.sdli').addClass('lineSelected');
			for(i=0;i<9;i++){
				var change = $('.soduku').find('.sd').eq(i);
				change.find('.sdli').eq(y).addClass('lineSelected');
			}
            keyBoard();       
			})
		// 点击数字格子时，失去横竖特效
		$('.sdli:not(".blankCell")').click(function(event) {
			for(i=0;i<9;i++){
				var change = $('.soduku').find('.sd').eq(i);
				change.find('.sdli').removeClass('lineSelected');
			}
		})
		
	},
	checkRes:function(){
		//检测用户输入结果。检测前将输入加入数组。检测单个的时候将这一个的值缓存起来并从数组中删除，检测结束在赋值回去。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom,done,temp;
		this.getInputVals();
		this.errorArr.length = 0;
		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;
			temp = this.backupSdArr[blankArr[i]];
			this.backupSdArr[blankArr[i]] = undefined;
			this.checkCell(x,y);
			this.backupSdArr[blankArr[i]] = temp;

		}
		done = this.isAllInputed();
		if(this.errorArr.length == 0 && done ){
			$('.gameinfo').html('你赢啦<img src="img/win.gif" alt="">');
			$('.isWin').html('小意思,再来一把');
			$('.undone').modal('show');
			$('.isWin').click(function(){
				sd.setLevel();
			});
		}else{
			if(!done){
				$('.gameinfo').html('游戏<br>未完成</br><img class="win" src="img/air.gif" alt="">');
				$('.isWin').html('人家再试试');
				$('.undone').modal('show');
			}
			this.showErrors();
		}
	},
	checkCell:function(i,j){
		//检测一个格子中输入的值，在横竖宫里是否已存在。
		var index = parseInt(i+''+j);
		var backupSdArr = this.backupSdArr;
		var XArr = this.getXArr(j,backupSdArr);
		var YArr = this.getYArr(i,backupSdArr);
		var thArr = this.getThArr(i,j,backupSdArr);
		var arr = getConnect(getConnect(XArr,YArr),thArr);			
		var val = parseInt($(".sd").eq(j-1).find(".sdli").eq(i-1).html());
		if($.inArray(val, arr)>-1){
			this.errorArr.push(index);
		}
	},
	getInputVals:function(){
		//将用户输入的结果添加到数组中。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom,theval;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sd").eq(y-1).find(".sdli").eq(x-1);
			theval = parseInt(dom.text())||undefined;
			this.backupSdArr[blankArr[i]] = theval;
		}
	},
	isAllInputed:function(){
		//检测是否全部空格都有输入。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sd").eq(y-1).find(".sdli").eq(x-1);
			if(dom.text()==''){
				return false
			}
		}
		return true;
	},
	showErrors:function(){
		//把错误显示出来。
		var errorArr = this.errorArr,len = this.errorArr.length,x,y,dom;
		for(var i =0;i<len;i++){
			x = parseInt(errorArr[i]/10);
			y = errorArr[i]%10;	
			$('.gameinfo').html('Boom~<br>错误</br><img class="win" src="img/wrong.gif" alt="">');
			$('.isWin').html('我瞅瞅');
			$('.undone').modal('show');
			$(".sd").eq(y-1).find(".sdli").eq(x-1).addClass('wrong');
		}
	},
	createDoms:function(){
        // 生成九宫格
		String.prototype.times = String.prototype.times || function(n) { return (new Array(n+1)).join(this);}; 
        var html = ('<div class="row sd clearfix">' + 
		'<div class="col sdli"><input type="text" class="numInput"></div >'.times(9) + '</div>').times(9);
		$(".soduku").prepend(html);
		
		//九宫格添加样式
		for(var k=0;k<9;k++){
			$(".sd:eq("+k+") .sdli").eq(8).addClass('br');
			$(".sd:eq("+k+") .sdli").eq(0).addClass('bl');
		}
		$(".sd:eq(0) .sdli").addClass('bt');
		$(".sd:eq(8) .sdli").addClass('bb');
    },
    createButtons:function(){
        var btnWidth = Math.floor($(window).width()/6);
        for(i=1;i<11;i++){
            var num = '<button type="button" class="btn col"><div class="num">'+i+'</div></button>';
            if(i<6){
                $('.numfirst').append(num);
            }else if(i>5 && i<10){
                $('.numsecond').append(num);
            }else{
                var f = '<button type="button" class="btn col"><img src="img/x.png" id="clear" class="num" alt=""></button>';
                $('.numsecond').append(f)
            }
        }
    },
    addStyle:function(){
		var functionWidth = parseInt($('.num').width())+4;
		console.log(functionWidth);
        $('.num').css({'height':functionWidth});
        var sdWidth = $('.sdli').width();
		$('.sdli').css({'height':sdWidth,'line-height':sdWidth+'px'});
		btHeight = parseInt(sdWidth)+2;
		$('.bb,.bt').css({'height':btHeight});
		$('.br,.bl').css({'width':btHeight});
	},
	isMobile:function(){
		var windowWidth = $(window).width();
		if (windowWidth < 600){
			$(".sdli[contenteditable=true]").prop('contenteditable', false);
		}
	}
}

// 点击数字填写
function keyBoard(){
    $('.num').each(function(){
        $('.num').click(function(){
            var id = $(this).attr('id');
            if(id == 'clear'){
                $('.selected').html('');
            }else{
            var input = $(this).html();
            var inputNum = parseFloat(input);
            $('.selected').html(inputNum);
            }
        })
    })
}

//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//两个简单数组的并集。
function getConnect(arr1,arr2){
	var i,len = arr1.length,resArr = arr2.slice();
	for(i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

//两个简单数组差集，arr1为大数组
function arrMinus(arr1,arr2){
	var resArr = [],len = arr1.length;
	for(var i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

// 模态框按钮
$('.setLevel-wrap').click(function(){
	$(this).addClass('active');
	$(this).siblings().removeClass('active');
})
