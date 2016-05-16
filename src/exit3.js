//##############################################################################
// src/exit.js
//##############################################################################
//var stats = new Stats();
//
//stats.setMode(0); // 0: fps, 1: ms
//stats.domElement.style.position = 'absolute';
//stats.domElement.style.left = '0px';
//stats.domElement.style.top = '0px';
//
//document.body.appendChild(stats.domElement);


var lab = new ENJ.Lab('stage');
lab.active=true;

if (window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame) {
  CRE.Ticker.timingMode = 'raf';
}

CRE.Ticker.addEventListener('tick' , update);

function update(event) {
//    if (CRE.Tween.hasActiveTweens() || ENJ.invalid) {
//        lab.update();
//        ENJ.invalid = false;
//    }

  if (lab && lab.active) {
    lab.update(event);
  }

  //stats.update();
  //requestAnimationFrame(update);
}
//update();

RES.addEventListener('complete', function() {
  lab.progress(1.0);


//  var scene = new ENJ.Scene_2();
//  var script = new ENJ.Script_2();
  var scene = new ENJ.Scene_3();
  var script = new ENJ.Script_3();

  scene.set({
    x: 60, scaleX: ENJ.scaleY, scaleY: ENJ.scaleY
  });
  //ENJ.invalid = true;
  //update();
  /*var prevBtn =  new jQuick('#prev-btn');
  var nextBtn =  new jQuick('#next-btn');
  var gotoBtn =  new jQuick('#goto-btn');
  var editor = new jQuick('#editor');

  prevBtn.on('click',function(){
    script.prev();
    var val = parseInt(editor.val());
    editor.val(val - 1);
  });

  nextBtn.on('click',function(){
    script.next();
    var val = parseInt(editor.val());
    editor.val(val + 1);
  });

  gotoBtn.on('click',function(){
    var val = parseInt(editor.val());
    script.skip(val - 1);
  });

  script.addEventListener('stepComplete',function(){
    editor.val(script.currentIndex + 1);
  });*/

  new ENJ.Experiment(lab, scene, script);

});

RES.addEventListener('progress', function(evt) {
  //console.log(evt.progress);
  lab.progress(evt.progress);
  //bar.style.width = '' + evt.progress * 100 +'%';
});

RES.loadManifest({
  path: '../../assets/',
  manifest: [
    { id: "手", src: "手.png" },
    { id: "水滴", src: "水滴.png" },
    { id: "水流", src: "水流.png" },
    { id: "纸巾", src: "纸巾.png" },
    { id: "转子", src: "转子.png" },
    { id: "袋子", src: "袋子.png" },
    { id: "粉末", src: "粉末.png" },
    { id: "剪刀", src: "剪刀.png" },
    { id: "引流棒", src: "引流棒.png" },
    { id: "标签", src: "标签.png" },
    { id: "吸球", src: "吸球.png" },
    { id: "吸嘴", src: "吸嘴.png" },
    { id: "蝴蝶夹", src: "蝴蝶夹.png" },
    { id: "滴定架", src: "滴定架.png" },
    { id: "滴定管", src: "滴定管.png" },
    { id: "滴定管液体", src: "滴定管液体.png" },
    { id: "磁力搅拌器", src: "磁力搅拌器.png" },
    { id: "磁力搅拌器旋钮", src: "磁力搅拌器旋钮.png" },
    { id: "PH仪", src: "PH仪.png" },
    { id: "PH仪面板", src: "PH仪面板.png" },
    { id: "PH电极", src: "PH电极.png" },
    { id: "PH电极套", src: "PH电极套.png" },
    { id: "酱油瓶", src: "酱油瓶.png" },
    { id: "酱油瓶盖", src: "酱油瓶盖.png" },
    { id: "酱油", src: "酱油.png" },
    { id: "容量瓶", src: "容量瓶.png" },
    { id: "容量瓶盖", src: "容量瓶盖.png" },
    { id: "容量瓶液体", src: "容量瓶液体.png" },
    { id: "量筒", src: "量筒.png" },
    { id: "量筒液体", src: "量筒液体.png" },
    { id: "盖子甲", src: "盖子甲.png" },
    { id: "试剂瓶", src: "试剂瓶.png" },
    { id: "试剂瓶液体", src: "试剂瓶液体.png" },
    { id: "氢氧化钠标签", src: "氢氧化钠标签.png" },
    { id: "甲醛标签", src: "甲醛标签.png" },
    { id: "移液管", src: "移液管.png" },
    { id: "移液管液体", src: "移液管液体.png" },
    { id: "移液管架", src: "移液管架.png" },
    { id: "蒸馏水瓶", src: "蒸馏水瓶.png" },
    { id: "烧杯", src: "烧杯.png" },
    { id: "烧杯液体", src: "烧杯液体.png" },
    { id: "关闭按钮", src: "关闭按钮.png" },
    { id: "结果报告3", src: "结果报告3.png" },
    { id: "背景", src: "背景.png" }
  ]
});

//var $ = jQuick;







