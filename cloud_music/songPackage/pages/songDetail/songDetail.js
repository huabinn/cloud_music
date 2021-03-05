// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'
const appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,       //是否播放歌曲
    song: {},            //歌曲详情对象
    musicId: '',         // 音乐id
    musicLink: '',       // 音乐的链接
    currentTime: '00:00',  // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0,       // 实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中 路由传参 ，对参数的长度有限制，如果参数长度过长会自动截取掉
    let musicId = options.musicId
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId)
    
    // 判断是否有音乐在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay: true
      })
    }
    // 创建控制音乐播放器实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager()

    /*
    * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
    * 解决方案：
    *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
    *
    * */

    // 监视音乐的播放/暂停/停止状态
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)
      // 修改全局音乐播放状态
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐
      PubSub.publish('switchType', 'next')
      // 将进度条的长度还原成0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })

    // 监听音乐实时播放进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },

  // 修改播放状态功能函数
  changePlayState (isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局音乐播放状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  // 获取音乐详情功能回调
  async getMusicInfo (musicId) {
    let songData = await request('/song/detail', {ids: musicId})
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: songData.songs[0].name,
    })
    // 初始自动播放
    this.musicControl({isPlay: true}, musicId)
  },
  // 点击播放暂停回调
  handleMusicPlay () {
    let isPlay = !this.data.isPlay
    // this.setData({
    //   isPlay
    // })
    let {musicId, musicLink} = this.data
    this.musicControl(isPlay, musicId, musicLink)
  },

  // 控制音乐播放/暂停功能函数
  async musicControl (isPlay, musicId, musicLink) {
    
    if (isPlay) {      //播放音乐
      if (!musicLink) {
        let musicLinkData = await request('/song/url', {id: musicId})
        let musicLink = musicLinkData.data[0].url
        this.setData({
          musicLink
        })
      }
      this.backgroundAudioManager.src = this.data.musicLink
      // title 必填
      this.backgroundAudioManager.title = this.data.song.name
    } else {           //暂停音乐
      this.backgroundAudioManager.pause()
    }
  },

  handleSwitch (event) {
    let type = event.currentTarget.id
    PubSub.subscribe('musicId', (msg, musicId) => {
      // 获取音乐详情信息
      this.getMusicInfo(musicId)
      // 自动播放当前音乐
      this.musicControl({isPlay: true}, musicId)
      // 取消订阅  不取消订阅的话会多次执行
      PubSub.unsubscribe('musicId')
    })
    // 发布消息给 recommendSong 页面
    PubSub.publish('switchType', type)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})