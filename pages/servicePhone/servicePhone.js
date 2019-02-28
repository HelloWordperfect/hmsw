// pages/servicePhone/servicePhone.js
const app = getApp();
Page({

  data: {
    phone: [], //电话列表
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Public/config`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        wx.hideLoading();
        if (res.data.status == 1) {
          this.setData({
            phone: res.data.data.phone
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击拨打电话
  bindPhone(e) {
    let phone = e.currentTarget.dataset.phone
    console.log(phone)
    wx.makePhoneCall({
      phoneNumber: phone
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