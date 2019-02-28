// pages/shopClassify/shopClassify.js
const app = getApp();
let catid;
Page({

  data: {
    baseUrl: app.globalData.baseUrl, //图片路径
    screenIndex: 1, //分类下标
    screenType: 1, //价格上下
    list: [], //商品数组
    currPage: 1, //当前页数
    totalPage: 1, //总页数
  },

  onLoad: function(options) {
    console.log(options)
    catid = options.catid;
    this.getList();
  },
  getList() {
    wx.showLoading({
      title: '加载中'
    })
    //获取商品列表
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/getGoodsList`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        p: this.data.currPage,
        status: this.data.screenIndex,
        category_id: catid
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: this.data.list.concat(res.data.data.goods_list),
              totalPage: Math.ceil(res.data.data.page_info.total_num * 1 / 10),
            })
            console.log('共' + this.data.totalPage + '页数据')
          }
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击销量，综合，价格
  bindScreen(e) {
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    if (index == 3 && type == 1) {
      //价格升序
      this.setData({
        screenType: 2,
        screenIndex: 3
      })
    } else if (index == 3 && type == 2) {
      //价格降序
      this.setData({
        screenType: 1,
        screenIndex: 4
      })
    } else {
      //销量和综合
      this.setData({
        screenIndex: index
      })
    }
    this.setData({
      list: [],
      currPage: 1,
      totalPage: 1,
    })
    this.getList();
    console.log(this.data.screenIndex)
  },
  //点击跳转搜索页面
  bindShopDetails(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../shopDetails/shopDetails?id=${id}`
    })
  },
  //点击跳转搜索页面
  bindSeek() {
    wx.navigateTo({
      url: '../seek/seek'
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
  //分享
  onShareAppMessage() {
    console.log(app.globalData.applet)
    return {
      title: app.globalData.applet,
      path: 'pages/index/index'
    };
  },
})