// pages/integral/integral.js
const app = getApp();
let userId;
Page({

  data: {
    list: [], //列表数据
    currPage: 1, //当前页数
    totalPage: 1, //总页数
    credit:'',  //积分
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/myCredit`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        p: this.data.currPage
      },
      success: res => {
        console.log(res);
        wx.hideLoading();
        console.log({
          uid: userId,
          p: this.data.currPage
        })
        if (res.data.status == 1) {
          this.setData({
            credit: res.data.data.credit_count,
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    this.getList();
  },
  getList() {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/myCredit`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        p: this.data.currPage
      },
      success: res => {
        console.log(res);
        wx.hideLoading();
        console.log({
          uid: userId,
          p: this.data.currPage
        })
        if (res.data.status == 1) {
          this.setData({
            list: this.data.list.concat(res.data.data.list),
            totalPage: Math.ceil(res.data.data.page_info.total_num * 1 / 10),
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
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
      totalPage: '', //总页数
      credit:'',  //积分
    })
    this.onLoad();
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