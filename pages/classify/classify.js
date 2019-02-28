// pages/category/category.js
const app = getApp();
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    stairList: [], //分类列表的一级分类
    stairIndex: 0, //当前选中的一级分类的下标
    twoList: [], //二级分类
    id: '1',
  },

  onLoad: function() {

  },
  onShow() {
    this.setData({
      twoList:[]
    })
    console.log(app.globalData.navListId)
    if (app.globalData.navListId) {
      this.setData({
        id: app.globalData.navListId
      })
    } else {
      this.setData({
        id: '1'
      })
    }
    //获取一级分类
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/getCategory`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          let list = res.data.data;
          let listIndex;
          for (var i = 0; i < list.length; i++) {
            if (list[i].id == this.data.id) {
              console.log(i)
              listIndex = i
            }
          }
          this.setData({
            stairList: res.data.data,
            stairIndex: listIndex
          })
          this.getList(this.data.id);
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //获取二级分类
  getList(item) {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/getNextCategory`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        id: item
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        console.log({
          id: item
        })
        if (res.data.status == 1) {
          this.setData({
            twoList: res.data.data
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击一级分类
  bindStair(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      stairIndex: index,
      twoList: []
    })
    this.getList(this.data.stairList[this.data.stairIndex].id);
  },
  //点击二级分类跳转商品列表
  bindTwoList(e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `../shopClassify/shopClassify?catid=${this.data.twoList[index].id}`
    })
  },
  //点击跳转搜索页面
  bindSeek() {
    wx.navigateTo({
      url: '../seek/seek'
    })
  },
  onHide() {
    app.globalData.navListId = ''
  },
  onUnload() {
    app.globalData.navListId = ''
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