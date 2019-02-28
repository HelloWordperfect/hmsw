// pages/address/address.js
const app = getApp();
let type,userId;
Page({

  data: {
    list: [], //地址列表
    type: '',
    iPhone:false,
  },

  onLoad: function(options) {
    console.log(options)
    if (options.type) {
      this.setData({
        type: options.type
      })
    }
    this.setData({
      iPhone: app.globalData.iPhone
    })
  },
  onShow() {
    userId = wx.getStorageSync('userId');
    wx.showLoading({
      title: '加载中'
    })
    //用户信息列表接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/myAddress`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        console.log({
          uid: userId
        })
        if (res.data.status == 1) {
          let datas = res.data.data;
          //找到默认地址的索引值
          let index = datas.findIndex((res) => res.status == 1)
          //或者 let index = datas.findIndex((res) => { retutn res.status == 1 })
          console.log(index)
          if (index != -1) {
            //有默认地址时
            //先找到默认地址从原数组删除
            let list = datas.splice(index, 1)
            console.log(list)
            //然后在把删除后的数组添加到默认地址的数组上
            let lists = list.concat(datas);
            console.log(lists)
            this.setData({
              list: lists
            })
          } else {
            this.setData({
              list: datas
            })
          }
        } else {
          console.log('获取地址失败')
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击选择收货地址
  bindAddress(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    app.globalData.address = '';
    app.globalData.address = this.data.list[index]
    console.log(app.globalData.address)
    wx.navigateBack({
      delta: 1
    })
  },
  //编辑地址
  bindRedact(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../addressDetails/addressDetails?id=${id}`
    })
  },
  //添加新地址
  bindNewAddress() {
    wx.navigateTo({
      url: '../addressDetails/addressDetails'
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