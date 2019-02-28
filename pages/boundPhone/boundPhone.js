// pages/boundPhone/boundPhone.js
const app = getApp();
let time = 60,
  phone, userId, userInfo;
Page({

  data: {
    code: true, //获取验证码状态
    time: '', //时间倒计时
    phone: '', //手机号
    codeNumber: '', //验证码
    phoneType: 0, //页面的标题(0绑定 1解绑)
  },

  onLoad: function(options) {
    userId = wx.getStorageSync('userId');
    wx.showLoading({
      title: '加载中'
    })
    //获取用户信息接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}User/userInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        uid: userId
      },
      success: res => {
        wx.hideLoading();
        console.log(res);
        if (res.data.status == 1) {
          phone = res.data.data.phone;
          if (!phone) {
            //绑定手机号
            wx.setNavigationBarTitle({
              title: '绑定手机号'
            })
            this.setData({
              phoneType: 0
            })
          } else {
            //更换手机号
            wx.setNavigationBarTitle({
              title: '更换手机号'
            })
            this.setData({
              phoneType: 1,
              phone: phone
            })
          }
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //输入手机号
  bindPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  //输入验证码
  bindCodeNumber(e) {
    this.setData({
      codeNumber: e.detail.value
    })
  },
  //点击获取验证码
  bindCode() {
    let num = /^[1][0-9]{10}$/.test(this.data.phone);
    //先判断手机号是否为空
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
    } else if (!num) {
      wx.showToast({
        title: '您输入的手机号有误',
        icon: 'none'
      })
    } else {
      //在判断code的状态
      if (this.data.code == true) {
        //获取验证码开始调接口
        this.setData({
          code: false,
          time: time
        })
        let timer = setInterval(() => {
          this.setData({
            time: this.data.time - 1
          })
          if (this.data.time == 0) {
            timer = clearInterval(timer);
            this.setData({
              time: time,
              code: true
            })
          }
        }, 1000)
        //获取验证码接口
        this.phoneCode();
      } else {
        console.log('正在等待验证码')
      }
    }
  },
  //获取验证码接口
  phoneCode() {
    if (this.data.phoneType == 0) {
      //绑定手机号
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/bindGetCode`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          phone: this.data.phone
        },
        success: res => {
          console.log(res);
        },
        fail: err => {
          console.log(err);
        }
      });
    } else {
      //解绑手机号
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}User/untieGetCode`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          phone: this.data.phone
        },
        success: res => {
          console.log(res);
        },
        fail: err => {
          console.log(err);
        }
      });
    }
  },
  //立即提交按钮
  bindSumbit() {
    let num = /^[1][0-9]{10}$/.test(this.data.phone);
    console.log(num)
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
    } else if (!num) {
      wx.showToast({
        title: '您输入的手机号有误',
        icon: 'none'
      })
    } else if (!this.data.codeNumber) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
    } else {
      if (this.data.phoneType == 0) {
        //绑定手机号接口
        wx.showLoading({
          title: '加载中'
        })
        wx.request({
          method: 'POST',
          url: `${app.globalData.api}User/bindPhone`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            uid: userId,
            phone: this.data.phone,
            code: this.data.codeNumber
          },
          success: res => {
            wx.hideLoading();
            console.log(res);
            console.log({
              uid: userId,
              phone: this.data.phone,
              code: this.data.codeNumber
            })
            if (res.data.status == 1) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
              //手机号绑定成功返回上一级页面
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
                //把新的手机号存入缓存
                wx.setStorageSync('phone', this.data.phone);
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
        //解绑手机号接口
        wx.showLoading({
          title: '加载中'
        })
        wx.request({
          method: 'POST',
          url: `${app.globalData.api}User/untiePhone`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            uid: userId,
            phone: this.data.phone,
            code: this.data.codeNumber
          },
          success: res => {
            wx.hideLoading();
            console.log(res);
            console.log({
              uid: userId,
              phone: this.data.phone,
              code: this.data.codeNumber
            })
            if (res.data.status == 1) {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
              //手机号绑定成功返回上一级页面
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
                //把新的手机号存入缓存
                wx.removeStorageSync('phone');
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
    }
  },
  //授权信息后才能绑定手机号
  onGotUserInfo(e) {
    userInfo = wx.getStorageSync('userInfo');
    //判断缓存里是否有授权信息
    if (!userInfo) {
      wx.getSetting({
        success: res => {
          console.log(res)
          //未授权时
          if (res.authSetting['scope.userInfo'] == true) {
            console.log('点击授权')
            userInfo = e.detail.userInfo;
            console.log(userInfo)
            //把获取到的用户信息存入缓存
            wx.setStorageSync('userInfo', userInfo);
            //调接口把授权信息发送给后台
            wx.request({
              method: 'POST',
              url: `${app.globalData.api}User/addUserInfo`,
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              data: {
                uid: userId,
                nickname: userInfo.nickName,
                headimgurl: userInfo.avatarUrl
              },
              success: res => {
                console.log(res);
                console.log({
                  uid: userId,
                  nickname: userInfo.nickName,
                  headimgurl: userInfo.avatarUrl
                })
              },
              fail: err => {
                console.log(err);
              }
            });
            //授权后执行绑定接口
            this.bindSumbit();
          } else {
            //点击拒绝
            console.log('点击拒绝')
          }
        }
      })
    } else {
      //授权后执行绑定接口
      this.bindSumbit();
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