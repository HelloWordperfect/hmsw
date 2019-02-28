// pages/convertIntegral/convertIntegral.js
const app = getApp();
let userId;
Page({

  data: {
    mark: '', //序列号
    password: '', //密码
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
  },
  //输入序列号
  bindMark(e) {
    this.setData({
      mark: e.detail.value
    })
  },
  //输入密码
  bindPassword(e) {
    this.setData({
      password: e.detail.value
    })
  },
  //点击兑换按钮
  bindConvert() {
    if (!this.data.mark) {
      wx.showToast({
        title: '序列号不能为空',
        icon: 'none'
      })
    } else if (!this.data.password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/exchangeCredit`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          uid: userId,
          serial_number: this.data.mark,
          password: this.data.password
        },
        success: res => {
          wx.hideLoading();
          console.log(res);
          console.log({
            uid: userId,
            serial_number: this.data.mark,
            password: this.data.password
          })
          if (res.data.status == 1) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            setTimeout(() => {
              this.setData({
                mark: '', //序列号
                password: '', //密码
              })
            }, 200)
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      });
    }
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