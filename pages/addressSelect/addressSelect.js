// pages/addressSelect/addressSelect.js
const app = getApp();
let address;
Page({

  data: {
    list: [], //页面显示省市县的数组
    initial: 0, //点击的是第几次
    province: '', //选择的省份的id
    provinceName: '', //省份名字
    city: '', //市的id
    cityName: '', //市的名字
    area: '', //区县的id
    areaName: '', //区县的名字
  },

  onLoad: function(options) {
    //获取省市县的三维数组
    address = wx.getStorageSync('address');
    if (address.length <= 0) {
      wx.showLoading({
        title: '加载中'
      })
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}Public/getRegion`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: res => {
          console.log(res);
          wx.hideLoading();
          if (res.data.status == 1) {
            this.setData({
              list: res.data.data
            })
            wx.setStorageSync('address', res.data.data);
          }
        },
        fail: err => {
          console.log(err);
        }
      });
    } else {
      wx.showLoading({
        title: '加载中'
      })
      this.setData({
        list: address
      })
      wx.hideLoading();
    }
  },
  //点击某个省市区后
  bindSelect(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let initial = e.currentTarget.dataset.initial;
    let name = e.currentTarget.dataset.name;
    if (initial == 0) {
      //选择省份
      this.setData({
        list: this.data.list[index].child,
        initial: 1,
        province: id,
        provinceName: name
      })
    } else if (initial == 1) {
      //选择市
      this.setData({
        list: this.data.list[index].child,
        initial: 2,
        city: id,
        cityName: name
      })
    } else {
      //选择区县
      this.setData({
        initial: 3,
        area: id,
        areaName: name
      })
      let region = this.data.provinceName + '-' + this.data.cityName + '-' + this.data.areaName;
      //把选择的省市县存入app.globalData
      app.globalData.region = region;
      app.globalData.province = this.data.province;
      app.globalData.city = this.data.city;
      app.globalData.area = this.data.area;
      //选择完毕返回上一级页面
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 100)
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