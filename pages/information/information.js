// pages/information/information.js
Page({

  data: {

  },

  onLoad: function (options) {

  },
  //跳转系统消息
  bindMessge(){
    wx.navigateTo({
      url:'../systemMessage/systemMessage'
    })
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