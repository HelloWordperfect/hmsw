// pages/cart/cart.js
let clientX, clientEndX, clientMoveX, clientY, clientEndY, clientMoveY;
const app = getApp();
let userId;
Page({

  data: {
    moveDis: false, //判断是否移动
    moveDete: false, //判断是否显示删除按钮，然后跳转页面（只在js中使用）
    baseUrl: app.globalData.baseUrl,
    currPage: 1, //当前页码
    totalPage: '', //总页数
    list: [], //商品数组
    indexs: '', //点击的是第几个
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
    this.getList();
  },
  //收藏列表数据
  getList() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/MyCollect`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        p: this.data.currPage
      },
      success: res => {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        console.log(res);
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: this.data.list.concat(res.data.data.collect_list),
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
  //删除商品后执行
  getLists() {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      currPage: 1,
      totalPage: '',
      list: [],
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/MyCollect`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        p: this.data.currPage
      },
      success: res => {
        wx.hideLoading()
        console.log(res);
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: res.data.data.collect_list,
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
  bindShop(e) {
    let index = e.currentTarget.dataset.index;
    console.log(index)
    console.log(this.data.list)
    if (this.data.moveDete == false) {
      console.log('点击跳转商品')
      wx.navigateTo({
        url: `../shopDetails/shopDetails?id=${this.data.list[index].goods_id}`
      })
      console.log(this.data.list[index].goods_id)
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
    let index = e.currentTarget.dataset.index;
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
              url: `${app.globalData.api}User/delCollect`,
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: {
                id: this.data.list[index].id
              },
              success: res => {
                wx.hideLoading()
                console.log(res);
                console.log({
                  id: this.data.list[index].id
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
                    this.getLists();
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
  //跳转到首页
  bindIndex() {
    wx.switchTab({
      url: '../index/index'
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
      moveDis: false, //判断是否移动
      moveDete: false, //判断是否显示删除按钮，然后跳转页面（只在js中使用）
      currPage: 1, //当前页码
      totalPage: '', //总页数
      list: [], //商品数组
      indexs: '', //点击的是第几个
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