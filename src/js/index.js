// 信息 + 图片渲染到页面上
// ，点击按钮
// 音频的播放与暂停  切歌
//  图片旋转
// 进度条运动与拖拽


var root = window.player;
var dataList = [];
var len = 0;
var audio = root.audioManager;
var contolIndex = null;
var timer = null;
// 获取数据
function getData(url) {
	$.ajax({
		type: 'GET',
		url: url,
		success: function (data) {
			// root.render(data[0]);
			dataList = data;
			len = data.length;
			contolIndex = new root.controlIndex(len);
			// audio.getAudio(data[0].audio);

			bindEvent();
			bindTouch();

			$('body').trigger('play:change', 0);

		},
		error: function () {
			console.log('error');
		}
	})
}
// 绑定点击事件
function bindEvent() {
	$('body').on('play:change', function (e, index) {
		audio.getAudio(dataList[index].audio);
		root.render(dataList[index]);
		if (audio.status == 'play') {
			audio.play();
			rotated(0);
		}
		$('.img-box').attr('data-deg', 0);
		$('.img-box').css({
			transform: 'rotateZ(' + 0 + 'deg)',
			transition: 'none'
		})

		//渲染总时间
		root.pro.renderAllTime(dataList[index].duration);
	});
	$('.prev').on('click', function (e) {
		var i = contolIndex.prev();
		$('body').trigger('play:change', i);

		root.pro.start(0);

		if (audio.status == 'pause') {
			audio.pause();

			root.pro.stop();
		}
	});
	$('.next').on('click', function (e) {
		var i = contolIndex.next();
		$('body').trigger('play:change', i);

		root.pro.start(0)

		if (audio.status == 'pause') {
			audio.pause();

			root.pro.stop();
		}
	});
	$('.play').on('click', function (e) {
		if (audio.status == 'pause') {
			audio.play();

			root.pro.start();

			var deg = $('.img-box').attr('data-deg') || 0;
			rotated(deg);
		} else {
			audio.pause();

			root.pro.stop();
			clearInterval(timer);
		}
		$('.play').toggleClass('playing');
	})
}
function rotated(deg) {
	// console.log(deg);
	clearInterval(timer);
	deg = parseInt(deg);
	timer = setInterval(function () {
		deg += 2;
		$('.img-box').attr('data-deg', deg);
		$('.img-box').css({
			transform: 'rotateZ(' + deg + 'deg)',
			transition: 'transform 0.2s linear'
		})
	}, 200);
}
getData('../mock/data.json');



//拖拽
function bindTouch() {
	var offset = $('.pro-bottom').offset();
	var left = offset.left;
	var width = offset.width;

	$('.spot').on('touchstart', function () {
		root.pro.stop();
	}).on('touchmove', function (ev) {
		var x = ev.changedTouches[0].clientX;
		var per = (x - left) / width;
		if (per > 0 && per <= 1) {
			root.pro.upDate(per);
		}
	}).on('touchend', function (ev) {
		var x = ev.changedTouches[0].clientX;
		var per = (x - left) / width;
		if (per > 0 && per < 1) {
			var cutTime = per * dataList[contolIndex.index].duration;
			audio.playTo(cutTime);
			audio.status='play';

			audio.muted = true;
			audio.play();


			$('.play').addClass('playing');
			root.pro.start(per);

		}
	});
}
