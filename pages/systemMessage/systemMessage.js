// pages/systemMessage/systemMessage.js
let clientX, clientEndX, clientMoveX, clientY, clientEndY, clientMoveY;
const app = getApp();
let userId;
Page({

  data: {
    moveDis: false, //判断是否移动
    moveDete: false, //判断是否显示删除按钮，然后跳转页面（只在js中使用）
    list: [], //消息列表
    indexs: '',
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
  },
  onShow() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/message`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        console.log(res);
        wx.hideLoading()
        if (res.data.status == 1) {
          this.setData({
            list: res.data.data
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //手指触碰事件
  bindStart(e) {
    let indexs = e.currentTarget.dataset.index
    this.setData({
      moveDis: false,
      indexs: indexs
    })
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  },
  //手指离开
  bindChend(e) {
    clientEndX = e.changedTouches[0].clientX;
    clientEndY = e.changedTouches[0].clientY;
    let move = clientX - clientEndX;
    let moveY = Math.abs(clientY - clientEndY);
    console.log(move)
    if (move >= 50 && moveY < 200) {
      console.log('移动了')
      this.setData({
        moveDis: true,
        moveDete: true
      })
    } else {
      console.log('不移动')
      this.setData({
        moveDis: false,
      })
    }
  },
  //点击商品
  bindDatails(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id)
    console.log(this.data.list)
    if (this.data.moveDete == false) {
      console.log('点击跳转商品')
      wx.navigateTo({
        url: `../messageDetails/messageDetails?id=${id}`
      })
    } else {
      console.log('点击不跳转')
      this.setData({
        moveDete: false
      })
    }
  },
  //点击删除按钮
  catchDelete(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    if (this.data.moveDete == true) {
      console.log('点击删除')
      this.setData({
        moveDis: true
      })
      wx.showModal({
        title: '温馨提示',
        content: '您是否要删除收藏的该商品？',
        success: res => {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.showLoading({
              title: '加载中',
            })
            wx.request({
              method: 'POST',
              url: `${app.globalData.api}Index/delMessage`,
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
                    moveDis: false
                  })
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                  })
                  setTimeout(() => {
                    this.onShow();
                  }, 500)
                }
              },
              fail: err => {
                console.log(err);
              }
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      console.log('点击不删除')
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