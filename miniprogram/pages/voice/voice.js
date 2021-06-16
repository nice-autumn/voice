// pages/voice/voice.js
const app = getApp();
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
const innerAudioContext = wx.createInnerAudioContext();
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    exhibitList: [],  //资源列表
    audioSrc: null, //需要播放的音频资源
    iconUrl:null, //需要播放的音频的图片资源
    audioName:null, //需要播放音频的名称
    isPlayAudio: false,
    audioSeek: 0, //音频当前时间
    audioDuration: 0, //音频总时间
    showTime1: '00:00',
    showTime2: '00:00',
    durationIntval: 0,
    audioTime: 0, //进度条变化的值
    content: '',//内容
    src:'', //
  },
  onUnload: function () {
    //初始化音频播放参数
    this.setData({
      showTime1: '00:00',
      showTime2: '00:00',
      durationIntval: 0,
      audioTime: 0, //进度条变化的值
      isPlayAudio: false,
      audioSeek: 0, //音频当前时间
      isPlayAudio: false,
    })
    //音频播放停止
    innerAudioContext.stop()
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
  },
  onLoad: function (options) {//初始化音频控件
    this.initAudio();
    this.loadaudio();
  },
  exhibitClick:function(e){
   
    let index=e.currentTarget.dataset.index;
    // console.log(this.data.exhibitList)
    var that = this;
    //获取音频资源链接
    let audiourl = this.data.exhibitList[index].audioUrl;
    // console.log(audiourl)
    let iconUrl = e.currentTarget.dataset.iconurl;
    let audioName = this.data.exhibitList[index].name;
       console.log(this.data.exhibitList[index])
    //判断当前音频是否为免费音频
    let isFree = e.currentTarget.dataset.isfree;
    let audioVipType = e.currentTarget.dataset.viptype;
  
    if (isFree == 1){
       //初始化播放参数
      this.setData({
        audioSrc: audiourl,
        index:index,
        iconUrl:iconUrl,
        audioName: audioName,
        showTime1: '00:00',
        showTime2: '00:00',
        durationIntval: 0,
        audioTime: 0, //进度条变化的值
        isPlayAudio: false,
        audioSeek: 0, //音频当前时间
        isPlayAudio: false,
        activeIndex:index,
       
      })

     this.playAudio();
     this.setData({
       showView:true
     })
    }
  },
  handleLeft:function(){
   
    let that=this;
    let id= parseInt(that.data.index)  ;
    let num= id-1;
    console.log(num) 
    if(num-1<-1){
      wx.showToast({
        title: '已到第一个',
      })
    }
    let aUrl=that.data.exhibitList[num].audioUrl
    let iUrl=that.data.exhibitList[num].iconUrl;
    // console.log(iUrl)
    let aName=that.data.exhibitList[num].name;
    let iFre=that.data.exhibitList[num].isFree;
    let AvipType=that.data.exhibitList[num].vipType;
    // console.log(aName,iFre,iUrl)
   
   
    if(iFre == 1){
      this.setData({
        audioSrc: aUrl,
        index:num,
        iconUrl:iUrl,
        audioName: aName,
        showTime1: '00:00',
        showTime2: '00:00',
        durationIntval: 0,
        audioTime: 0, //进度条变化的值
        isPlayAudio: false,
        audioSeek: 0, //音频当前时间
        isPlayAudio: false,
        activeIndex:num,
       
      })
      this.playAudio();
      this.setData({
        showView:true
      })
    }
  },
  initAudio: function(){
    var t = this;
    //设置src
    innerAudioContext.src = this.data.audiosrc;
    
    innerAudioContext.onCanplay(() => {
      //初始化duration
      innerAudioContext.duration
      setTimeout(function () {
        //延时获取音频真正的duration
        var duration = innerAudioContext.duration;
        var min = parseInt(duration / 60);
        var sec = parseInt(duration % 60);
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        t.setData({ audioDuration: innerAudioContext.duration, showTime2: `${min}:${sec}` });
      }, 1000)
    })
  },
  sliderChange:function (e) {
    var that = this;
    innerAudioContext.src = this.data.audioSrc;
    //获取进度条百分比
    var value = e.detail.value;
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    //更改状态
    this.setData({ audioSeek: value, isPlayAudio: true });
    // console.log(value)//拖动的时间
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    //播放歌曲
    innerAudioContext.play();
  },
  playAudio:function() {
    //获取播放状态和当前播放时间
    var isPlayAudio = this.data.isPlayAudio;
    // console.log(isPlayAudio)
    var seek = this.data.audioSeek;
    let animate=this.data.animateActive;
    
    innerAudioContext.pause();
    //更改播放状态
    this.setData({ 
      isPlayAudio: !isPlayAudio ,
      animateActive:!animate
    })


    console.log(this.data.animateActive)
    if (isPlayAudio) {
      //如果在播放则记录播放的时间seek，暂停
      this.setData({ audioSeek: innerAudioContext.currentTime });
      // console.log(innerAudioContext.currentTime)
    } else {
      //如果在暂停，获取播放时间并继续播放
      innerAudioContext.src = this.data.audioSrc;
      if (innerAudioContext.duration != 0) {
        this.setData({ audioDuration: innerAudioContext.duration });
      }
      //跳转到指定时间播放
      innerAudioContext.seek(seek);
      innerAudioContext.play();
    }
  },
  loadaudio:function() {
    var that = this;
    //设置一个计步器
    this.data.durationIntval = setInterval(function () {
      //当歌曲在播放时执行
      if (that.data.isPlayAudio == true) {
        //获取歌曲的播放时间，进度百分比
        var seek = that.data.audioSeek;
    

        var duration = innerAudioContext.duration;
        var time = that.data.audioTime;
        time = parseInt(100 * seek / duration);

        // console.log(time) //总时间为100
        //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
        var min = parseInt((seek + 1) / 60);
        var sec = parseInt((seek + 1) % 60);
        //填充字符串，使3:1这种呈现出 03：01 的样式
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        var min1 = parseInt(duration / 60);
        var sec1 = parseInt(duration % 60);
        // console.log(sec, min)
        if (min1.toString().length == 1) {
          min1 = `0${min1}`;
        }
        if (sec1.toString().length == 1) {
          sec1 = `0${sec1}`;
        }
        //当进度条完成，停止播放，并重设播放时间和进度条
        if (time >= 100) {
          innerAudioContext.stop();
          that.setData({ audioSeek: 0, audioTime: 0, audioDuration: duration, isPlayAudio: false, showTime1: `00:00` });
          return false;
        }
        //正常播放，更改进度信息，更改播放时间信息
        that.setData({ audioSeek: seek + 1, audioTime: time, audioDuration: duration, showTime1: `${min}:${sec}`, showTime2: `${min1}:${sec1}` });
      }
    }, 1000);
  },

})
