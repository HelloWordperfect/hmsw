// pages/myCenter/myCenter.js
const app = getApp();
let phone, userId,address;
Page({

  data: {
    phone: '', //判断是否绑定手机号
    datas: '', //用户信息
  },

  onLoad: function(options) {
    //获取省市县的三维数组
    address = wx.getStorageSync('address');
    if (address.length <= 0) {
      wx.request({
        method: 'POST',
        url:`${app.globalData.api}Public/getRegion`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success:res=>{
          console.log(res);
          if (res.data.status == 1) {
            wx.setStorageSync('address', res.data.data);
          }
        },
        fail:err=>{
          console.log(err);
        }
      });
    }
  },
  onShow() {
    userId = wx.getStorageSync('userId');
    //获取用户信息接口
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/userInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        console.log({
          uid: userId
        })
        wx.hideLoading()
        wx.stopPullDownRefresh();
        console.log(res);
        if (res.data.status == 1) {
          phone = res.data.data.phone;
          this.setData({
            phone: phone,
            datas: res.data.data
          })
          console.log(this.data.phone)
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //跳转我的收藏
  bindCollect() {
    wx.navigateTo({
      url: '../collect/collect'
    })
  },
  //我的足迹
  bindFootprint() {
    wx.navigateTo({
      url: '../footprint/footprint'
    })
  },
  //跳转订单
  bindOrder(e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `../order/order?type=${type}`
    })
  },
  //跳转关于我们
  bindAbout(){
    wx.navigateTo({
      url: '../about/about'
    })
  },
  //跳转积分明细
  bindIntegral() {
    wx.navigateTo({
      url: '../integral/integral'
    })
  },
  //兑换积分
  bindConvertIntegral() {
    wx.navigateTo({
      url: '../convertIntegral/convertIntegral'
    })
  },
  //跳转绑定手机号
  bindPhone() {
    wx.navigateTo({
      url: '../boundPhone/boundPhone'
    })
  },
  //跳转收获地址
  bindAddress() {
    wx.navigateTo({
      url: '../address/address'
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      phone: '', //判断是否绑定手机号
      datas: '', //用户信息
    })
    this.onShow();
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