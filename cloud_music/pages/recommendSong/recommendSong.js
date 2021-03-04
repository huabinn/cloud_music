// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js'
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',             //天
    month: '',           //月
    recommendList: '',   //每日推荐数据
    index: 0,            //点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })

    // 获取每日推荐数据
    this.getRecommendList()
    PubSub.subscribe('switchType', (msg, type) => {
      let {recommendList, index} = this.data
      if (type === 'pre') {      //上一首
        index -= 1
      } else {                   //下一首
        index += 1
        console.log('播放下一首');
      }
      index = (index + recommendList.length) % recommendList.length
      // 更新对应的下标
      this.setData({
        index
      })
      let musicId = recommendList[index].id
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },

  // 获取用户每日推荐数据
  async getRecommendList () {
    let recommendListData = await request('recommend/songs')
    this.setData({
      recommendList: recommendListData.recommend
    })
  },

  // 跳转至播放页面
  toSongDetail (event) {
    let {song, index} = event.currentTarget.dataset
    this.setData({
      index
    })
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + song.id,
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