// pages/noticeDetail/noticeDetail.js
const app = getApp();
Page({

  data: {
    datas:'',
    name:'',
    content:'',
  },

  onLoad: function (options) {
    console.log(options)
    wx.request({
      method: 'POST',
      url:`${app.globalData.api}Index/noticeXq`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data:{
        id: options.id
      },
      success:res=>{
        console.log(res);
        if (res.data.status == 1) {
         let content = res.data.data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" class="shop-xiang" ')
          this.setData({
            datas: res.data.data,
            content: content
          })
        }
      },
      fail:err=>{
        console.log(err);
      }
    });
    wx.request({
      method: 'POST',
      url:`${app.globalData.api}Public/config`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success:res=>{
        console.log(res);
        if (res.data.status == 1) {
          this.setData({
            name: res.data.data.name
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