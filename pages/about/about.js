// pages/about/about.js
const app = getApp();
Page({

  data: {
    content:'',
  },

  onLoad: function (options) {
    wx.request({
      method: 'POST',
      url:`${app.globalData.api}Index/about`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success:res=>{
        console.log(res);
        if (res.data.status == 1) {
          let content = res.data.data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" class="shop-xiang" ')
          this.setData({
            content:content
          })
        }
      },
      fail:err=>{
        console.log(err);
      }
    });
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