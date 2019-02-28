//index.js
const app = getApp();
let userId, time;
Page({
  data: {
    baseUrl: app.globalData.baseUrl, //图片路径
    imgUrls: [], //轮播图图片
    notice: [], //公告标题
    navList: [], //导航列表
    list: [], //商品列表
    currPage: 1, //当前页数
    totalPage: '', //总页数
  },
  onLoad: function(options) {
    app.globalData.scene = '1001';
    app.globalData.navListId = '';
    wx.showLoading({
      title: '加载中'
    })
    userId = wx.getStorageSync('userId');
    //进入后缓存中是否有userId
    if (!userId) {
      time = setInterval(() => {
        userId = wx.getStorageSync('userId');
        console.log('index:' + userId)
        //判断是否拿到了userId,如果拿到了就停止定时器
        if (userId) {
          clearInterval(time);
        }
      }, 50)
    }
    //公告接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/notice`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          this.setData({
            notice: res.data.data
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    //获取轮播图
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/banner`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          this.setData({
            imgUrls: res.data.data
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    //获取首页导航接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/nav`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.status == 1) {
          let list = [];
          let datas = res.data.data;
          //需要把返回的数组整合成二维数组
          //一个数组里面十个对象
          if (datas.length > 10) {
            console.log('导航数量大于10')
            let length = Math.ceil(datas.length / 10);
            console.log(length)
            for (var i = 0; i < length; i++) {
              list.push(datas.splice(0, 10))
            }
          } else {
            console.log('导航数量小于10')
            list.push(datas)
          }
          this.setData({
            navList: list
          })
          console.log(this.data.navList)
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    console.log(this.data.navList)
    this.getList();
  },
  //获取推荐商品接口
  getList() {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Index/goodsList`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        p: this.data.currPage
      },
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        console.log(res);
        console.log({
          p: this.data.currPage
        })
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
  //点击导航跳转页面
  bindtapNavlist(e) {
    let type = e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    if (type == 1) {
      //跳转到商品列表
      wx.navigateTo({
        url: `../shopList/shopList?id=${id}&name=${name}`
      })
    } else {
      console.log('分类id' + id)
      app.globalData.navListId = id
      //跳转到分类页面
      wx.switchTab({
        url: '../classify/classify'
      })
    }
  },
  //点击跳转公告详情
  bindNotice(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../noticeDetail/noticeDetail?id=${id}`
    })
  },
  //点击轮播图跳转商品详情
  bindBanner(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id)
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
  //点击跳转消息页面
  bindMassge() {
    wx.switchTab({
      url: '../information/information'
    })
  },
  //点击跳转商品详情
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
      imgUrls: [], //轮播图图片
      notice: [], //公告标题
      navList: [], //导航列表
      list: [], //商品列表
      currPage: 1, //当前页数
      totalPage: '', //总页数
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