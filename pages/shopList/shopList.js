// pages/shopList/shopList.js
const app = getApp();
let id, name;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    list: [], //列表
    currPage: 1, //当前页数
    totalPage: 1, //总页数
  },

  onLoad: function(options) {
    console.log(options)
    id = options.id;
    name = options.name;
    wx.setNavigationBarTitle({
      title: name
    })
    this.getList();
  },
  //列表数据
  getList() {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/goodsList`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        id: id,
        p: this.data.currPage
      },
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        console.log(res);
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: this.data.list.concat(res.data.data.goods_list),
              totalPage: Math.ceil(res.data.data.page_info.total_num * 1 / 10),
            })
          }
        } else {
          if (this.data.list.length == 0) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //跳转到商品详情
  bindShopDetails(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../shopDetails/shopDetails?id=${id}`
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
      list: [], //商品列表
      currPage: 1, //当前页数
      totalPage: 1, //总页数
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