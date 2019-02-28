// pages/orderDetails/orderDetails.js
const app = getApp();
let userId, id;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    datas: '', //订单信息
    list: [], //商品信息
  },

  onLoad: function(options) {
    console.log(options)
    userId = wx.getStorageSync('userId');
    id = options.id;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/orderXq`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        id: id,
        uid: userId
      },
      success: res => {
        wx.hideLoading()
        console.log(res);
        console.log({
          id: id,
          uid: userId
        })
        if (res.data.status == 1) {
          this.setData({
            datas: res.data.data,
            list: res.data.data.goods_list
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //跳转商品详情
  bindShop(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../shopDetails/shopDetails?id=${id}`
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