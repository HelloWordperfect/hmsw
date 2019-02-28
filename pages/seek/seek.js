// pages/seek/seek.js
const app = getApp();
let history;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    text: '', //输入框输入的内容
    list: [], //搜索出来的商品数组
    currPage: 1, //当前页数
    totalPage: 1, //总页数
    hotSeek: [], //热搜数组
    history: [], //历史记录
    nolist: false, //判断是否能搜索出商品
    record: true, //是否显示热搜和历史搜索
  },

  onLoad: function(options) {
    //先从缓存中把history数据拿出来，
    history = wx.getStorageSync('history');
    console.log(history)
    //热搜数组
    this.setData({
      history: history,
      hotSeek: ['苹果', '香蕉', '面包', '奶粉', '西瓜']
    })
  },
  //输入的搜索内容
  bindInput(e) {
    this.setData({
      text: e.detail.value
    })
    if (this.data.list && !this.data.text) {
      //先从缓存中把history数据拿出来，
      history = wx.getStorageSync('history');
      this.setData({
        history: history,
        record: true,
        list: [],
        currPage: 1,
        totalPage: 1,
        nolist: false
      })
    }
  },
  //点击热门搜索
  bindHot(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item;
    this.setData({
      text: item,
      list: [],
      currPage: 1,
      totalPage: 1,
      record: false,
      nolist: false,
    })
    this.history();
    this.getList();
  },
  //失去焦点开始搜索
  bindSeek() {
    if (!this.data.text) {
      wx.showToast({
        title: '请输入您要搜索的商品名称',
        icon: 'none'
      })
    } else {
      this.setData({
        list: [],
        currPage: 1,
        totalPage: 1,
        record: false,
        nolist: false,
      })
      this.history();
      this.getList();
    }
  },
  //把搜索内容存入缓存
  history() {
    //把搜索的内容存入缓存
    //先从缓存中把history数据拿出来，
    history = wx.getStorageSync('history');
    if (!history) {
      history = []
    }
    //判断缓存里的名字是否和新输入的名字相同
    for (var i = 0; i < history.length; i++) {
      if (history[i] == this.data.text) {
        history.splice(i, 1)
      }
    }
    //然后在把搜索的名字放入history
    history.unshift(this.data.text)
    console.log(history)
    //判断历史记录是否超过8个，超过的话删除最后一个
    if (history.length > 8) {
      history.splice(8, 1)
    }
    console.log(history)
    //把搜索的内容存入缓存
    wx.setStorageSync('history', history);
  },
  getList() {
    //调接口
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/getGoodsList`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        keyword: this.data.text,
        p: this.data.currPage,
        status: 1
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        console.log({
          keyword: this.data.text,
          p: this.data.currPage,
          status: 1
        })
        if (res.data.status == 1) {
          if (res.data.data.length != 0) {
            this.setData({
              list: this.data.list.concat(res.data.data.goods_list),
              totalPage: Math.ceil(res.data.data.page_info.total_num * 1 / 10),
            })
          }
        } else if (res.data.status == 0 && res.data.msg == '暂无商品') {
          this.setData({
            nolist: true
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击跳转搜索页面
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
  //分享
  onShareAppMessage() {
    console.log(app.globalData.applet)
    return {
      title: app.globalData.applet,
      path: 'pages/index/index'
    };
  },
})