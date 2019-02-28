// pages/addressDetails/addressDetails.js
const app = getApp();
Page({

  data: {
    name: '', //收货人姓名 
    phone: '', //收货人电话
    text: '', //详细地址
    default: false, //是否设置为默认地址
    region: '请选择', //选择的地址名字
    province: '', //省份id
    city: '', //市份id
    area: '', //区县id
    addressId: '', //地址id(仅修改地址时存在)
  },

  onLoad: function(options) {
    console.log(options)
    //如果存在options.id，则为修改地址
    if (options.id) {
      this.setData({
        addressId: options.id
      })
      console.log(this.data.addressId)
      wx.setNavigationBarTitle({
        title: '编辑收获地址'
      })
      //获取地址详情
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/addressXq`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          id: this.data.addressId
        },
        success: res => {
          console.log(res);
          if (res.data.status == 1) {
            let datas = res.data.data;
            //把获取到的地址详情放到页面上
            this.setData({
              name: datas.name,
              phone: datas.phone,
              text: datas.address,
              default: datas.status == 0 ? false : true,
              region: datas.province_name + '-' + datas.city_name + '-' + datas.area_name,
              province: datas.province,
              city: datas.city,
              area: datas.area,
            })
            console.log({
              name: datas.name,
              phone: datas.phone,
              text: datas.address,
              default: datas.status == 0 ? false : true,
              region: datas.province_name + '-' + datas.city_name + '-' + datas.area_name,
              province: datas.province,
              city: datas.city,
              area: datas.area,
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      });
    } else {
      wx.setNavigationBarTitle({
        title: '添加新地址'
      })
    }
  },
  onShow() {
    //从选择地区页面接收的值
    if (app.globalData.region) {
      this.setData({
        region: app.globalData.region,
        province: app.globalData.province,
        city: app.globalData.city,
        area: app.globalData.area
      })
    }
  },
  //收货人姓名
  bindName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  //收货人电话
  bindPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  //点击选择地区
  bindRegion() {
    wx.navigateTo({
      url: '../addressSelect/addressSelect'
    })
  },
  //详细地址
  bindText(e) {
    this.setData({
      text: e.detail.value
    })
  },
  //设置是否为默认地址
  bindSwitch(e) {
    console.log(e)
    this.setData({
      default: e.detail.value
    })
    console.log(this.data.default)
  },
  //删除地址
  bindDelete() {
    wx.showModal({
      title: '温馨提示',
      content: '确定要删除该地址吗？',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          //调地址删除接口
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}User/delAddress`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              id: this.data.addressId,
              uid: app.globalData.userId
            },
            success: res => {
              console.log(res);
              console.log({
                id: this.data.addressId,
                uid: app.globalData.userId
              })
              if (res.data.status == 1) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none'
                })
                //删除成功返回上一级页面
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 300)
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
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击保存
  bindSave() {
    //正则匹配一下手机号码
    let num = /^[1][0-9]{10}$/.test(this.data.phone);
    console.log(this.data.name)
    console.log(this.data.phone)
    if (!this.data.name) {
      wx.showToast({
        title: '收货人姓名请不要少于2个字！',
        icon: 'none'
      })
    } else if (!this.data.phone) {
      wx.showToast({
        title: '手机号不能为空！',
        icon: 'none'
      })
    } else if (!num) {
      wx.showToast({
        title: '手机号不正确！',
        icon: 'none'
      })
    } else if (!this.data.province || !this.data.city || !this.data.area) {
      wx.showToast({
        title: '所在地区不能为空！',
        icon: 'none'
      })
    } else if (!this.data.text) {
      wx.showToast({
        title: '详细地址不能为空！',
        icon: 'none'
      })
    } else if (!this.data.addressId) {
      console.log('新增地址')
      //新添加地址的保存
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/addAddress`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          uid: app.globalData.userId,
          name: this.data.name,
          phone: this.data.phone,
          province: this.data.province,
          city: this.data.city,
          area: this.data.area,
          address: this.data.text,
          status: this.data.default == true ? 1 : 0
        },
        success: res => {
          console.log(res);
          console.log({
            uid: app.globalData.userId,
            name: this.data.name,
            phone: this.data.phone,
            province: this.data.province,
            city: this.data.city,
            area: this.data.area,
            address: this.data.text,
            status: this.data.default == true ? 1 : 0
          })
          if (res.data.status == 1) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            //地址保存成功返回上一级页面
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
              //清除app.globalData里选择的地址
              app.globalData.region = '';
              app.globalData.province = '';
              app.globalData.city = '';
              app.globalData.area = '';
            }, 500)
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
    } else {
      console.log('修改地址')
      //修改地址接口
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/editAddress`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          id: this.data.addressId,
          uid: app.globalData.userId,
          name: this.data.name,
          phone: this.data.phone,
          province: this.data.province,
          city: this.data.city,
          area: this.data.area,
          address: this.data.text,
          status: this.data.default == true ? 1 : 0
        },
        success: res => {
          console.log(res);
          console.log({
            uid: app.globalData.userId,
            name: this.data.name,
            phone: this.data.phone,
            province: this.data.province,
            city: this.data.city,
            area: this.data.area,
            address: this.data.text,
            status: this.data.default == true ? 1 : 0
          })
          if (res.data.status == 1) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            //地址保存成功返回上一级页面
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
              //清除app.globalData里选择的地址
              app.globalData.region = '';
              app.globalData.province = '';
              app.globalData.city = '';
              app.globalData.area = '';
            }, 500)
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
  //分享
  onShareAppMessage() {
    console.log(app.globalData.applet)
    return {
      title: app.globalData.applet,
      path: 'pages/index/index'
    };
  },
})