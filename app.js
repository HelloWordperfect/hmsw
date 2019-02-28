//app.js
App({
  onLaunch: function(options) {
    console.log(options)
    this.globalData.scene = options.scene
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        wx.request({
          method: 'POST',
          url: `${this.globalData.api}Public/user_login`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            code: res.code
          },
          success: res => {
            console.log(res);
            if (res.data.status == 1) {
              //把userId放到globalData里
              this.globalData.userId = res.data.data.id;
              //把userId存入缓存
              wx.setStorageSync('userId', res.data.data.id);
              console.log('userId：' + this.globalData.userId)
            } else {
              console.log('登录失败')
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 1500,
              });
            }
          },
          fail: err => {
            console.log(err);
            console.log('登录失败')
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1500,
            });
          }
        });
      }
    })
    //获取小程序名称
    wx.request({
      method: 'POST',
      url: `${this.globalData.api}Public/config`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        console.log(res);
        if (res.data.status == 1) {
          this.globalData.applet = res.data.data.name
        }
      },
      fail: err => {
        console.log(err);
      }
    });
    //适配苹果x
    wx.getSystemInfo({
      success: res => {
        console.log('手机型号：' + res.model)
        if (res.model == 'iPhone X' || res.model == 'iPhone XR' || res.model == 'iPhone Xs' || res.model == 'iPhone Xs Max') {
          this.globalData.iPhone = true
          console.log('是否符合'+this.globalData.iPhone)
        }
      }
    })
  },
  // 版本更新
  updata() {
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log(res)
    });
    updateManager.onUpdateReady(function(res) {
      //console.log(res)
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          console.log(res)
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    updateManager.onUpdateFailed(function() {
      console.log('新的版本下载失败')
    });
  },
  globalData: {
    userInfo: null,
    api: 'http://xcxceshi.zzdlwx.com/Api/',
    baseUrl: 'http://xcxceshi.zzdlwx.com',
    userId: '',
    scene: '', //场景值
    applet: '', //小程序名称
    iPhone:false,  //是否是苹果x
  }
})