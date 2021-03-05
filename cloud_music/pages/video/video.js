// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: '', // 导航的标识
    videoList: [], // 视频列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航数据
    this.getVideoGroupListData()
    
  },

  // 获取导航数据
  async getVideoGroupListData () {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
    // 获取视频列表数据
    this.getVideoList(this.data.navId)
  },
  // 获取视频列表数据
  async getVideoList (navId) {
    let videoListData = await request('/video/group', {id: navId})
    // 关闭消息提示框
    wx.hideLoading();
    let index = 0

    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      videoList,
      // 关闭下拉刷新
      isTriggered: false
    })
  },
  // 点击切换导航回调
  changeNav (event) {
    let navId = event.currentTarget.id; // 通过id向event传参的时候如果传的是number会自动转换成string
    // let navId = event.currentTarget.dataset.id;
    this.setData({
      // 右移0位，强行转化为数字
      navId: navId>>>0,
      videoList: []
    })

    // 动态获取当前视频数据
    this.getVideoList(this.data.navId)
    wx.showLoading({
      title: '正在加载',
    })
  },
  // 点击播放/继续回调
  handlePlay (event) {
     /*
      问题： 多个视频同时播放的问题
    * 需求：
    *   1. 在点击播放的事件中需要找到上一个播放的视频
    *   2. 在播放新的视频之前关闭上一个正在播放的视频
    * 关键：
    *   1. 如何找到上一个视频的实例对象
    *   2. 如何确认点击播放的视频和正在播放的视频不是同一个视频
    * 单例模式：
    *   1. 需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象，
    *   2. 节省内存空间
    * */

    let vid = event.currentTarget.id;
    // 关闭上一个视频this.setData()
    // this.vid !== vid && this.videoContext && this.videoContext.stop()
    // this.vid = vid
    this.setData({
      videoId: vid
    })
    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);

    // 判断当前的视频之前是否播放过，是否有播放记录, 如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime)
    }

    this.videoContext.play()
  },
  // 监听视频播放进度回调
  handleTimeUpdate (event) {
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime}
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    if (videoItem) {
      videoItem.currentTime = event.detail.currentTime
    } else {
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },
  // 视频播放结束时回调
  handleEnded (event) {
    let {videoUpdateTime} = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1)
    this.setData({
      videoUpdateTime
    })
  },
  // 自定义下拉刷新回调  scroll-view
  handleRefresher () {
    this.getVideoList(this.data.navId)
  },
  // 上拉触底的回调
  async handleToLower () {
    console.log('到底了');
    let videoListData = await request('/video/group', {id: this.data.navId})
    console.log(videoListData);
    let {videoList} = this.data
    videoList.push(...videoListData.datas)
    this.setData({
      videoList
    })
  },
  // 跳转至搜索界面
  toSearch () {
    wx.navigateTo({
      url: '/pages/search/search',
    })
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
    console.log("页面下拉刷新");
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("页面上拉触底");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    if(from === 'button'){
      return {
        title: '来自button的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }else {
      return {
        title: '来自menu的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }
  }
})