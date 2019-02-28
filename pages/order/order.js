// pages/cart/cart.js
let clientX, clientEndX, clientMoveX, clientY, clientEndY, clientMoveY;
const app = getApp();
let userId;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    navList: [], //导航分类
    navIndex: '', //选中的导航状态
    list: [], //列表数据
    currPage: 1, //当前页数
    totalPage: '', //总页数
    remind: '0', //提醒是否超过上限
    payment: true, //能否点击支付按钮
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
    console.log(options)
    let type = options.type;
    let navList = [
      { name: '未付款', index: '-1' },
      { name: '待发货', index: '1' },
      { name: '待收货', index: '2' },
      { name: '已完成', index: '3' }]
    this.setData({
      navList: navList,
      navIndex: type
    })
    this.getList();
  },
  //导航的点击事件
  bindNav(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      navIndex: index,
      list: [], //列表数据
      currPage: 1, //当前页数
      totalPage: '', //总页数
    })
    this.getList();
  },
  //订单列表数据
  getList() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/myOrder`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        status: this.data.navList[this.data.navIndex].index,
        p: this.data.currPage
      },
      success: res => {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        console.log(res);
        console.log({
          uid: userId,
          status: this.data.navList[this.data.navIndex].index,
          p: this.data.currPage
        })
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: this.data.list.concat(res.data.data.list),
              totalPage: Math.ceil(res.data.data.page_info.total_num * 1 / 10),
            })
          }
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击删除订单
  bindDelete(e) {
    let id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '您是否删除该订单？',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '加载中',
          })
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}User/changeStatus`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              uid: userId,
              id: id,
              status: '1'
            },
            success: res => {
              console.log(res);
              console.log({
                uid: userId,
                id: id,
                status: '1'
              })
              wx.hideLoading()
              if (res.data.status == 1) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                })
                setTimeout(() => {
                  this.setData({
                    list: [], //列表数据
                    currPage: 1, //当前页数
                    totalPage: '', //总页数
                  })
                  this.getList();
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
  },
  //继续付款
  bindMoney(e) {
    let id = e.currentTarget.dataset.id;
    if (this.data.payment == true) {
      this.setData({
        payment: false
      })
      //调微信支付
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}Goods/buy`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          uid: userId,
          id: id
        },
        success: res => {
          console.log(res);
          wx.hideLoading();
          if (res.data.status == 1) {
            wx.requestPayment({
              timeStamp: res.data.data.timeStamp,
              nonceStr: res.data.data.nonceStr,
              paySign: res.data.data.paySign,
              package: res.data.data.package,
              signType: res.data.data.signType,
              success: res => {
                console.log(res)
                //支付成功后
                if (res.errMsg == 'requestPayment:ok') {
                  //支付成功后关闭当前页面跳转到订单列表页面
                  wx.showToast({
                    title: '支付成功',
                    icon: 'none'
                  })
                  setTimeout(() => {
                    this.setData({
                      list: [], //列表数据
                      currPage: 1, //当前页数
                      totalPage: '', //总页数
                      payment: true
                    })
                    this.getList();
                  }, 500)
                } else {
                  console.log('网络异常')
                  this.setData({
                    payment: true
                  });
                  wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 1500
                  });
                }
              },
              fail: res => {
                console.log(res)
                if (res.errMsg == 'requestPayment:fail cancel') {
                  console.log('取消支付')
                  wx.showToast({
                    title: '取消支付',
                    icon: 'none',
                    duration: 1500
                  });
                  this.setData({
                    payment: true
                  })
                }
              },
            })
          } else {
            this.setData({
              payment: true
            })
          }
        },
        fail: err => {
          this.setData({
            payment: true
          })
          console.log(err);
        }
      });
    }
  },
  //提醒发货
  bindRemind() {
    if (this.data.remind * 1 > 5) {
      wx.showLoading({
        title: '加载中',
      })
      setTimeout(() => {
        wx.hideLoading()
        wx.showToast({
          title: '提醒超过上限',
          icon: 'none',
        })
      }, 300)
    } else {
      wx.showLoading({
        title: '加载中',
      })
      setTimeout(() => {
        wx.hideLoading()
        wx.showToast({
          title: '已提醒商家发货，请耐心等待',
          icon: 'none',
        })
      }, 300)
    }
    this.setData({
      remind: this.data.remind * 1 + 1
    })
  },
  //确认收货
  bindAffirm(e) {
    let id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '温馨提示',
      content: '您是否收到该订单的商品？',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '加载中',
          })
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}User/changeStatus`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              uid: userId,
              id: id,
              status: '2'
            },
            success: res => {
              console.log(res);
              if (res.data.status == 1) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                })
                setTimeout(() => {
                  this.setData({
                    list: [], //列表数据
                    currPage: 1, //当前页数
                    totalPage: '', //总页数
                  })
                  this.getList();
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
  },
  //点击跳转详情
  bindOrderDetails(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../orderDetails/orderDetails?id=${id}`
    })
  },
  //下拉加载下一页
  onReachBottom() {
    if (this.data.currPage * 1 < this.data.totalPage * 1) {
      this.setData({
        currPage: this.data.currPage * 1 + 1
      });
      console.log(this.data.currPage);
      this.getList();
    } else {
      wx.showToast({
        title: '亲，没有数据了哦！',
        icon: 'none'
      })
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      list: [], //列表数据
      currPage: 1, //当前页数
      totalPage: '', //总页数
    })
    this.getList();
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