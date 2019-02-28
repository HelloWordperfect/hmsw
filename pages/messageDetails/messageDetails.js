// pages/messageDetails/messageDetails.js
const app = getApp();
let userId;
Page({

  data: {
    datas: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    userId = wx.getStorageSync('userId');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/message_xq`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        id: options.id
      },
      success: res => {
        wx.hideLoading()
        console.log(res);
        if (res.data.status == 1) {
          this.setData({
            datas: res.data.data
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/readMessage`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        id: options.id
      },
      success: res => {
        console.log(res);

      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //分享
  onShareAppMessage() {
    console.log(app.globalData.applet)
    return {
      title: app.globalData.applet,
      path: 'pages/index/index'
    };
  },
})