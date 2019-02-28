// pages/affirmOrder/affirmOrder.js
const app = getApp();
let shopDatas, type, userId;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    addr_id: '-1', //收获地址id
    addressName: '', //收获地址姓名
    addressPhone: '', //收货地址电话
    addressDetail: '', //收获地址详细地址
    list: [], //结算的商品列表
    datas: '', //结算的商品信息
    money: '0.00', //应付金额
    integral: '0.00', //积分总数
    useIntegral: '0.00', //使用的积分总数
    text: [], //备注信息数组
    submit: true, //判断提交订单能否点击
    iPhone:false,
  },

  onLoad: function(options) {
    console.log(options)
    shopDatas = options.shopDatas;
    type = options.type;
    userId = wx.getStorageSync('userId');
    app.globalData.address = ''
    this.setData({
      iPhone: app.globalData.iPhone
    })
  },
  onShow() {
    this.integral();
    //判断app.globalData.addr_id里是否有值
    if (app.globalData.address) {
      console.log('已经去地址列表选择过地址了')
      this.setData({
        addr_id: app.globalData.address.id,
        addressName: app.globalData.address.name,
        addressPhone: app.globalData.address.phone,
        addressDetail: app.globalData.address.province_name + app.globalData.address.city_name + app.globalData.address.area_name + app.globalData.address.address,
      })
      this.getList();
    } else {
      console.log('刚进入页面，没有去地址列表选择地址')
      this.address();
    }
  },
  //获取用户积分接口
  integral() {
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/userInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          this.setData({
            integral: res.data.data.credit
          })
          console.log(this.data.integral)
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //获取默认地址接口
  address() {
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/myAddress`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          let address = res.data.data;
          //判断地址列表是否为空
          if (address.length > 0) {
            //判断地址列表是否有默认地址
            for (var i = 0; i < address.length; i++) {
              if (address[i].status == 1) {
                console.log('拿到默认地址')
                this.setData({
                  addr_id: address[i].id,
                  addressName: address[i].name,
                  addressPhone: address[i].phone,
                  addressDetail: address[i].province_name + address[i].city_name + address[i].area_name + address[i].address,
                })
              }
            }
          } else {
            console.log('地址列表暂无地址')
          }
          this.getList();
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击跳转地址列表页面
  bindAddress() {
    wx.navigateTo({
      url: `../address/address?type=1`
    })
  },
  //确认订单接口
  getList() {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/order`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId,
        data: shopDatas,
        addr_id: this.data.addr_id
      },
      success: res => {
        wx.hideLoading()
        console.log(res);
        console.log({
          uid: userId,
          data: shopDatas,
          addr_id: this.data.addr_id
        })
        if (res.data.status == 1) {
          let list = res.data.data.goods_list.map(item => {
            let items = item;
            items.integral = 0.00;
            items.checked = false;
            return items
          })
          let text = [];
          for (var i = 0; i < list.length; i++) {
            text = text.concat('')
          }
          console.log(text)
          console.log(list)
          this.setData({
            list: list,
            text: text,
            useIntegral: '0.00',
            datas: res.data.data,
            money: res.data.data.total_price.toFixed(2)
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //积分是否选中开关
  bindSwitch(e) {
    console.log(e)
    console.log('发生change事件，携带值为', e.detail.value)
    let index = e.currentTarget.dataset.index;
    if (e.detail.value == true) {
      console.log('正在使用积分')
      //如果选中了使用积分
      //需要判断当前总积分是否大于0
      if (this.data.integral * 1 > 0) {
        let list = this.data.list;
        list[index].checked = true;
        console.log('总积分余额大于0')
        if (this.data.list[index].credit * 1 < this.data.integral * 1) {
          console.log('总积分余额大于商品抵扣的金额')
          list[index].integral = this.data.list[index].credit * 1
          //判断当前商品可以抵扣的积分是否小于当前剩余的总积分
          //扣除商品积分  this.data.list[index].credit
          this.setData({
            list: list,
            money: (this.data.money * 1 - this.data.list[index].credit * 1).toFixed(2),
            integral: (this.data.integral * 1 - this.data.list[index].credit * 1).toFixed(2),
            useIntegral: (this.data.useIntegral * 1 + this.data.list[index].credit * 1).toFixed(2),
          })
        } else {
          list[index].integral = this.data.integral * 1
          console.log('总积分不够商品抵扣了')
          //剩余积分不够抵扣，把剩余的积分清空
          //扣除总积分  this.data.integral
          this.setData({
            list: list,
            useIntegral: (this.data.useIntegral * 1 + this.data.integral * 1).toFixed(2),
            integral: 0.00,
            money: (this.data.money * 1 - this.data.integral * 1).toFixed(2)
          })
        }
      } else {
        console.log('总积分余额为0')
        let list = this.data.list;
        list[index].checked = false;
        this.setData({
          list: list
        })
        wx.showToast({
          title: '您当前积分余额不足！',
          icon: 'none',
        })
      }
    } else {
      console.log('取消使用积分')
      //点击取消使用积分
      this.setData({
        useIntegral: (this.data.useIntegral * 1 - this.data.list[index].integral * 1).toFixed(2),
        integral: (this.data.integral * 1 + this.data.list[index].integral * 1).toFixed(2),
        money: (this.data.money * 1 + this.data.list[index].integral * 1).toFixed(2)
      })
      let list = this.data.list;
      list[index].checked = false;
      list[index].integral = 0
      this.setData({
        list: list
      })
    }
  },
  //写备注信息
  bindText(e) {
    let index = e.currentTarget.dataset.index;
    let content = e.detail.value;
    let text = this.data.text;
    text[index] = content;
    this.setData({
      text: text
    })
  },
  //提交订单
  bindSubmit() {
    let listShow = this.data.list.findIndex(item => item.is_show == 0)
    console.log(listShow)
    if (this.data.addr_id == '-1') {
      //判断是否选中了收货地址
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
    } else if (listShow == '-1') {
      //判断能结算的商品是否为空
      wx.showToast({
        title: '您选择的商品暂无法结算',
        icon: 'none'
      })
    } else if (this.data.submit == true) {
      this.setData({
        submit: false
      })
      console.log(this.data.list)
      //立即去结算，筛选出能结算的商品
      let list = this.data.list;
      let shopSum = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].is_show == 0) {
          //能结算的商品
          let shopInfo = {
            goods_id: list[i].id,
            num: list[i].num,
            goods_attr_id: list[i].goods_attr_id,
            credit: list[i].integral,
            remark: this.data.text[i],
            postage: list[i].postage
          }
          shopSum.push(shopInfo)
        }
      }
      console.log(shopSum)
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}Goods/pay`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          uid: userId,
          addr_id: this.data.addr_id,
          data: JSON.stringify(shopSum)
        },
        success: res => {
          wx.hideLoading();
          console.log(res);
          console.log({
            uid: userId,
            addr_id: this.data.addr_id,
            data: JSON.stringify(shopSum)
          })
          if (res.data.status == 1) {
            console.log('下单成功')
            //发起微信支付
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
                    //跳转到订单列表
                    wx.redirectTo({
                      url: `../order/order?type=1`
                    })
                  }, 500)
                  //判断是否是从购物车进入到结算页面的
                  //支付成功后删除当前结算列表里，库存不足的和支付成功的商品
                  this.payment();
                } else {
                  console.log('网络异常')
                  this.setData({
                    submit: true
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
                  setTimeout(() => {
                    //跳转到订单列表
                    wx.redirectTo({
                      url: `../order/order?type=0`
                    })
                  }, 500)
                  //判断是否是从购物车进入到结算页面的
                  //支付成功后删除当前结算列表里，库存不足的和支付成功的商品
                  this.payment();
                }
              },
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      });
    }
  },
  //支付成功后跳转并删除购物车
  payment() {
    //判断是否是从购物车进入到结算页面的
    //支付成功后删除当前结算列表里，库存不足的和支付成功的商品
    let list = this.data.list
    if (type == 1) {
      console.log('购物车进入的')
      //先从缓存中把购物车里所有的商品都拿出来
      wx.getStorage({
        key: 'shopList',
        success: res => {
          console.log(res)
          //拿到缓存中的数组
          let shopList = res.data ? JSON.parse(res.data) : [];
          //判断缓存中的数组是否为空
          if (shopList.length > 0) {
            //购物车里有商品
            console.log(shopList)
            console.log(list)
            for (var k = 0; k < list.length; k++) {
              for (var i = 0; i < shopList.length; i++) {
                if (shopList[i].shopId == list[k].id && shopList[i].shopSizesId == list[k].goods_attr_id && list[k].is_show != 2) {
                  shopList.splice(i, 1)
                  i = i - 1;
                }
              }
            }
            console.log('已经删除过的数组')
            console.log(shopList)
            //把修改后的数组放入缓存
            wx.setStorage({
              key: 'shopList',
              data: JSON.stringify(shopList)
            })
          } else {
            console.log('暂无商品')
          }
        },
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