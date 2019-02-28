// pages/cart/cart.js
const app = getApp();
let clientX, clientEndX, clientMoveX, clientY, clientEndY, clientMoveY;
let shopList, index;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    moveDis: false, //判断是否显示删除按钮（页面中有使用）
    moveDete: false, //判断是否显示删除按钮，然后跳转页面（只在js中使用）
    list: [], //商品数组
    indexs: -1, //移动的商品的下标
    temps: false, //是否选中全选按钮
    listNumber: 0, //选中的商品数量
    compile: false, //是否显示删除按钮
    money: '0.00', //商品总价
    routine: '', //小程序名称
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Public/config`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        wx.hideLoading();
        if (res.data.status == 1) {
          this.setData({
            routine: res.data.data.name
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  onShow() {
    this.setData({
      temps: false,
      listNumber: 0,
      moveDis: false,
      moveDete: false,
      compile: false,
      money: '0.00'
    })
    //页面一进来先从缓存中把数据拿出来
    wx.getStorage({
      key: 'shopList',
      success: res => {
        console.log(res)
        //拿到缓存中的数组
        shopList = res.data ? JSON.parse(res.data) : [];
        //判断缓存中的数组是否为空
        if (shopList.length > 0) {
          //购物车中有商品
          //向数组中添加一个temp属性，通过它来判断是否选中该商品
          shopList = shopList.map(item => {
            let temp = item;
            temp.temp = false;
            return temp
          })
          //调接口，从后台拿购物车里商品的最新数据
          //拿到数据后在渲染
          console.log(shopList)
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}Goods/car`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              data: JSON.stringify(shopList)
            },
            success: res => {
              wx.stopPullDownRefresh();
              console.log(res);
              console.log({
                data: JSON.stringify(shopList)
              })
              if (res.data.status == 1) {
                shopList = JSON.parse(res.data.data)
                this.setData({
                  list: shopList
                })
                //把后台给的最新的数组放入缓存
                wx.setStorage({
                  key: 'shopList',
                  data: JSON.stringify(shopList)
                })
                console.log(this.data.list)
              }
            },
            fail: err => {
              console.log(err);
            }
          });
        } else {
          //数组为空，即购物车里没有商品
          this.setData({
            list: []
          })
          wx.stopPullDownRefresh();
          //把后台给的最新的数组放入缓存
          wx.setStorage({
            key: 'shopList',
            data: ''
          })
          console.log('暂无商品')
        }
      },
    })
  },
  //手指触碰事件
  bindStart(e) {
    index = e.currentTarget.dataset.index;
    console.log(index)
    this.setData({
      moveDis: false,
      indexs: index
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
      console.log('不移动关闭删除')
      this.setData({
        moveDis: false,
      })
    }
  },
  //点击单个商品选中的事件
  catchTemp(e) {
    console.log(e)
    let list = this.data.list
    //判断当前商品是否选中了
    if (list[index].temp == true) {
      list[index].temp = false
      console.log('取消选中')
      //计算合计的总价
      //不选中该商品的话，需要在总价中减去该商品的价格
      let money = this.data.money * 1 - list[index].shopMoney * list[index].shopNum
      console.log(money)
      this.setData({
        money: money.toFixed(2)
      })
    } else {
      console.log('选中了')
      list[index].temp = true
      //计算合计的总价
      let money = this.data.money * 1 + list[index].shopMoney * list[index].shopNum
      console.log(money)
      this.setData({
        money: money.toFixed(2)
      })
    }
    //判断是否选中了所有的商品,temps == -1 表示全部选中
    let temps = list.findIndex(item => item.temp == false)
    console.log(temps)
    if (temps == -1) {
      this.setData({
        temps: true
      })
    } else {
      this.setData({
        temps: false
      })
    }
    //计算选中的商品数量
    let listNumber = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].temp == true) {
        listNumber = listNumber + 1
      }
    }
    this.setData({
      list: list,
      listNumber: listNumber
    })
  },
  //点击全选
  bindAllTemp() {
    //判断现在是否已经全部选中
    let list = this.data.list;
    if (this.data.temps == true) {
      //取消全选
      list = list.map(item => {
        let temp = item;
        temp.temp = false;
        return temp
      })
      //计算选中的数量
      let listNumber = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].temp == true) {
          listNumber = listNumber + 1
        }
      }
      this.setData({
        list: list,
        temps: false,
        listNumber: listNumber,
        money: '0.00'
      })
    } else {
      //全选
      list = list.map(item => {
        let temp = item;
        temp.temp = true;
        return temp
      })
      //计算选中的数量
      let listNumber = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].temp == true) {
          listNumber = listNumber + 1
        }
      }
      //计算合计的总价
      let money = 0
      for (var i = 0; i < list.length; i++) {
        if (list[i].temp == true) {
          money = money + list[i].shopMoney * list[i].shopNum
        }
      }
      console.log(money)
      this.setData({
        list: list,
        temps: true,
        listNumber: listNumber,
        money: money.toFixed(2)
      })
    }
  },
  //计算商品价格
  money() {
    let list = this.data.list
    let money = this.data.money * 1
    for (var i = 0; i < list.length; i++) {
      if (list[i].temp == true) {
        money = money + list[i].shopMoney * list[i].shopNum
      }
    }
    console.log(money)
    this.setData({
      money: money.toFixed(2)
    })
  },
  //点击跳转商品详情
  shopDetails(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    console.log(this.data.moveDete)
    if (this.data.moveDete == false) {
      console.log('跳转')
      wx.navigateTo({
        url: `../shopDetails/shopDetails?id=${id}`
      })
    } else {
      this.setData({
        moveDete: false
      })
      console.log('不跳转')
    }
  },
  //单件商品点击删除
  catchDelete(e) {
    console.log('点击删除')
    let index = e.currentTarget.dataset.index
    console.log(index)
    //点击删除后不关闭删除按钮
    this.setData({
      moveDis: true
    })
    wx.showModal({
      title: '温馨提示',
      content: '您是否要删除该商品',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          let list = this.data.list;
          //如果选中当前商品，删除后需要减去总价和数量
          if (list[index].temp == true) {
            console.log('删除商品了-----------')
            console.log(this.data.money)
            console.log(list[index].shopMoney * list[index].shopNum)
            this.setData({
              listNumber: this.data.listNumber - 1,
              money: (this.data.money * 1 - list[index].shopMoney * list[index].shopNum).toFixed(2)
            })
          }
          //删除该商品
          list.splice(index, 1)
          //把删除后的数组放入缓存
          wx.setStorage({
            key: 'shopList',
            data: JSON.stringify(list)
          })
          console.log(list)
          //点击确定删除后才关闭删除按钮
          this.setData({
            list: list,
            moveDis: false
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击商品减少
  bindReduce(e) {
    let index = e.currentTarget.dataset.index;
    console.log(index)
    let list = this.data.list
    //判断当前数量是否为1
    if (list[index].shopNum > 1) {
      list[index].shopNum = list[index].shopNum - 1
      console.log(list)
      this.setData({
        list: list
      })
      if (list[index].temp == true) {
        let money = this.data.money * 1 - list[index].shopMoney * 1
        this.setData({
          money: money.toFixed(2)
        })
      }
      //把修改后的数组放入缓存
      wx.setStorage({
        key: 'shopList',
        data: JSON.stringify(list)
      })
    }
  },
  //点击商品增加
  bindIncrease(e) {
    let index = e.currentTarget.dataset.index;
    console.log(index)
    let list = this.data.list;
    if (list[index].shopStock * 1 > list[index].shopNum * 1) {
      list[index].shopNum = list[index].shopNum + 1
      console.log(list)
      console.log('开始增加')
      if (list[index].temp == true) {
        let money = this.data.money * 1 + list[index].shopMoney * 1
        this.setData({
          money: money.toFixed(2)
        })
      }
      this.setData({
        list: list
      })
      //把修改后的数组放入缓存
      wx.setStorage({
        key: 'shopList',
        data: JSON.stringify(list)
      })
    } else {
      console.log('库存不足')
      wx.showToast({
        title: '该商品库存不足',
        icon: 'none'
      })
    }
  },
  //点击右上角编辑显示删除
  bindCompile() {
    //判断是否显示删除按钮
    let list = this.data.list
    if (this.data.compile == false) {
      //显示删除按钮
      //并且让选中的全部改为未选中
      list = list.map(item => {
        let items = item;
        items.temp = false;
        return items
      })
      this.setData({
        compile: true,
        list: list,
        temps: false,
        listNumber: 0,
      })
    } else {
      //并且让选中的全部改为未选中
      list = list.map(item => {
        let items = item;
        items.temp = false;
        return items
      })
      //显示结算按钮
      this.setData({
        compile: false,
        list: list,
        temps: false,
        listNumber: 0,
        money: '0.00'
      })
    }
  },
  //点击结算按钮
  bindSubmit() {
    //判断选中的商品数量是否为0
    if (this.data.listNumber > 0) {
      let list = this.data.list;
      let shops = [];
      //选中的商品属性数组
      for (var i = 0; i < list.length; i++) {
        if (list[i].temp == true) {
          shops = shops.concat([{ shopId: list[i].shopId, shopNum: list[i].shopNum, shopSizesId: list[i].shopSizesId }])
        }
      }
      console.log(shops)
      //整合成后台需要的数据
      let shopDatas = '';
      for (var i = 0; i < shops.length; i++) {
        shopDatas = shopDatas + (shops[i].shopId + '_' + shops[i].shopSizesId + '_' + shops[i].shopNum) + ','
      }
      console.log(shopDatas)
      wx.navigateTo({
        url: `../affirmOrder/affirmOrder?shopDatas=${shopDatas}&type=1`
      })
    } else {
      wx.showToast({
        title: '请选择结算的商品',
        icon: 'none'
      })
    }
  },
  //点击多选删除按钮
  bindDeletes() {
    //判断选中的商品数量是否为0
    if (this.data.listNumber > 0) {
      wx.showModal({
        title: '温馨提示',
        content: '您是否要删除该商品',
        success: res => {
          if (res.confirm) {
            console.log('用户点击确定')
            let list = this.data.list;
            console.log(list)
            for (var i = 0; i < list.length; i++) {
              if (list[i].temp == true) {
                list.splice(i, 1)
                //删除一件商品后，数组长度就会改变，所以i的值需要减1
                i = i - 1;
              }
            }
            this.setData({
              list: list,
              temps: false,
              listNumber: 0,
            })
            //把修改后的数组放入缓存
            wx.setStorage({
              key: 'shopList',
              data: JSON.stringify(list)
            })
            console.log(list)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        title: '请选择删除的商品',
        icon: 'none'
      })
    }
  },
  //点击跳转首页
  bindIndex() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.onShow();
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