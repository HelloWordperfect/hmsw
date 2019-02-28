// pages/shopDetails/shopDetails.js
const app = getApp();
let id, goodsId, shopList, shops, userId, phone, time;
let shopImgs, shopCodeImg;
Page({

  data: {
    baseUrl: app.globalData.baseUrl,
    images: [], //轮播图
    imageIndex: 0, //当前轮播图位置
    mask: false, //是否显示弹窗
    poster: -1000, //是否显示分享弹窗
    posterImage: -1000, //是否显示海报图片
    maskSize: -1000, //是否显示规格弹窗
    shopInfo: '', //商品信息(全部的信息)
    shopMoney: '', //商品价格
    shopStock: '', //商品库存
    credit: '', //商品抵扣金额
    content: '', //富文本内容
    goodsKeep: '', //商品是否收藏（yes no）
    goods_attr: [], //商品规格属性
    shopNum: 1, //商品数量
    selectSize: [], //多规格选择的数组
    selectedId: '', //已经选择的规格的id
    selected: [], //已经选择的规格名字数组 (弹窗里展示)
    selectedName: '请选择规格', //已经选择的规格的名字（详情页面展示）
    type: 1, //当前点击的是选择规格、加入购物车、立即购买
    shopSizesId: -1, //选中的规格的id
    scene: '', //场景值
    cavWidth: '345', //画布宽度
    cavHight: '465', //画布高度
    simulate: false, //如果获取商品详情接口的stastus == 0 时为true
    simulateMsg: '该商品已下架',
    iPhone: false, //兼容苹果X
  },
  onLoad: function(options) {
    //判断是否是扫码进入
    console.log(options)
    if (options.scene) {
      id = options.scene
    } else {
      id = options.id;
    }
    //获取屏幕宽度
    wx.getSystemInfo({
      success: res => {
        console.log(res.screenWidth)
        this.setData({
          cavWidth: res.screenWidth * 0.92
        })
      }
    })
    this.setData({
      iPhone: app.globalData.iPhone
    })
  },
  onShow() {
    this.setData({
      scene: app.globalData.scene,
      selectedName: '请选择规格',
    })
    console.log('场景值：' + this.data.scene)
    userId = wx.getStorageSync('userId');
    //进入后缓存中是否有userId
    if (!userId) {
      wx.showLoading({
        title: '加载中',
      })
      time = setInterval(() => {
        userId = wx.getStorageSync('userId');
        console.log('index:' + userId)
        //判断是否拿到了userId,如果拿到了就停止定时器
        if (userId) {
          clearInterval(time);
          wx.hideLoading()
          this.userInfo();
          this.getList();
        }
      }, 50)
    } else {
      this.userInfo();
      this.getList();
    }
  },
  //获取用户信息接口（拿到手机号）
  userInfo() {
    console.log(userId)
    //获取用户信息接口
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
          phone = res.data.data.phone;
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  getList() {
    console.log(userId)
    wx.showLoading({
      title: '加载中',
    })
    //商品详情接口
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Goods/goodsInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        id: id,
        uid: userId
      },
      success: res => {
        wx.hideLoading()
        console.log({
          id: id,
          uid: userId
        })
        console.log(res);
        if (res.data.status == 1) {
          //给富文本内容里面的图片加一个class
          let content = res.data.data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" class="shop-xiang" ')
          //多规格的数组，数组里面的初始值都为-1
          if (res.data.data.goods_attr.length > 0) {
            let selectSize = res.data.data.goods_attr.map(item => item = '-1')
            goodsId = res.data.data.goods_attr.map(item => item = '-1')
            let selected = res.data.data.goods_attr.map(item => item = ' ')
            this.setData({
              selectSize: selectSize,
              selected: selected
            })
            console.log(selectSize)
          }
          this.setData({
            images: res.data.data.pic,
            shopInfo: res.data.data,
            goodsKeep: res.data.data.goodsKeep,
            content: content,
            shopMoney: res.data.data.sell_price,
            shopStock: res.data.data.stock,
            goods_attr: res.data.data.goods_attr,
            credit: res.data.data.credit,
          })
          console.log(this.data.goods_attr)
        } else {
          this.setData({
            simulate: true,
            simulateMsg: res.data.msg
          })
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  //点击规格
  bindSelect(e) {
    console.log(e)
    //大数组的索引值
    let kindex = e.currentTarget.dataset.kindex;
    //小数组的索引值
    let index = e.currentTarget.dataset.index;
    console.log("点击的大数组是第几个" + kindex)
    //改变规格下标的数组
    let selectSize = this.data.selectSize;
    selectSize[kindex] = index;
    //添加选中的规格名字数组
    let selected = this.data.selected;
    selected[kindex] = '"' + this.data.goods_attr[kindex].value[index].value + '"'
    console.log(selected)
    //选中的规格名字
    let selectedName = '';
    for (var i = 0; i < selected.length; i++) {
      selectedName = selectedName + '  ' + this.data.goods_attr[i].name + ':' + selected[i]
    }
    //选择的规格id
    goodsId[kindex] = this.data.goods_attr[kindex].value[index].id;
    let selectedId = ''
    for (var i = 0; i < goodsId.length; i++) {
      if (!selectedId) {
        selectedId = goodsId[i]
      } else {
        selectedId = selectedId + ',' + goodsId[i]
      }
    }
    console.log(selectedId)
    //如果没有该商品的属性，则不能点击
    // if (!this.data.shopInfo.attr_json.sys_attrprice[selectedId] && this.data.finish == true) {
    //   console.log(selectSize[this.data.goods_attr.length - 1])
    //   console.log('该属性库存为0')
    //   selectSize[this.data.goods_attr.length - 1] = -1
    //   this.setData({})
    // }
    console.log(selectSize)
    //判断属性是否全部选择完毕
    let minus = selectSize.indexOf('-1')
    //如果minus == -1 则选择完毕
    console.log(minus)
    if (minus == -1) {
      console.log('选中的规格id' + selectedId)
      //判断属性组合中是否有该属性的组合
      let keys = [];
      for (let key in this.data.shopInfo.attr_json.sys_attrprice) {
        keys = keys.concat(key)
      }
      console.log(keys)
      //选择完毕后把当前属性的库存价格找出来并渲染
      if (keys.indexOf(selectedId) != -1) {
        let minusShop = this.data.shopInfo.attr_json.sys_attrprice[selectedId];
        console.log(minusShop)
        this.setData({
          shopMoney: minusShop.sell_price,
          shopStock: minusShop.stock,
          credit: minusShop.credit,
          shopSizesId: minusShop.id
        })
      } else {
        this.setData({
          shopStock: 0,
        })
        console.log('暂无此属性')
      }
    }
    this.setData({
      selectSize: selectSize,
      selected: selected,
      selectedName: selectedName,
      selectedId: selectedId
    })
  },
  //点击确定返回上一级页面,如果该商品的status == 0时
  bindReturn() {
    wx.navigateBack({
      delta: 1
    })
  },
  //点击数量增加
  bindIncrease() {
    if (this.data.shopStock * 1 > this.data.shopNum * 1) {
      this.setData({
        shopNum: this.data.shopNum + 1
      })
    } else {
      wx.showToast({
        title: '库存不足！',
        icon: 'none'
      })
    }
  },
  //点击数量减少
  bindReduce() {
    if (this.data.shopNum > 1) {
      this.setData({
        shopNum: this.data.shopNum - 1
      })
    }
  },
  //加入购物车的商品数据
  shopList() {
    return {
      shopId: this.data.shopInfo.id, //商品id
      selectedId: !this.data.selectedId ? '-1' : this.data.selectedId, //商品规格健值
      shopNum: this.data.shopNum, //商品数量
      shopImg: this.data.shopInfo.thumb, //商品图片
      selectedName: this.data.selectedName == '请选择规格' ? '规格："默认"' : this.data.selectedName, //商品规格名称
      shopMoney: this.data.shopMoney, //商品价格
      shopName: this.data.shopInfo.name, //商品名称
      shopSizesId: this.data.shopSizesId, //选中的属性的规格id
      shopStock: this.data.shopStock, //商品库存
    }
  },
  //点击弹窗里的确定
  bindConfirm() {
    let minuss = this.data.selectSize.indexOf('-1')
    if (minuss != -1) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    } else if (this.data.shopStock * 1 < this.data.shopNum * 1) {
      wx.showToast({
        title: '库存不足！',
        icon: 'none'
      })
    } else {
      if (this.data.type == 2) {
        //点击加入购物车打开的弹窗
        if (!phone) {
          //判断用户是否绑定了手机号
          wx.showModal({
            title: '温馨提示',
            content: '请先绑定手机号！',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                //点击确定跳转到绑定手机号页面
                wx.navigateTo({
                  url: '../boundPhone/boundPhone'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          this.joinCart();
        }
      } else if (this.data.type == 3) {
        //点击立即购买打开的弹窗
        //点击后关闭弹窗，跳转到结算页面
        if (!phone) {
          //判断用户是否绑定了手机号
          wx.showModal({
            title: '温馨提示',
            content: '请先绑定手机号！',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                //点击确定跳转到绑定手机号页面
                wx.navigateTo({
                  url: '../boundPhone/boundPhone'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          console.log('商品id:' + this.data.shopInfo.id)
          console.log('购买数量：' + this.data.shopNum)
          console.log('商品规格id:' + this.data.shopSizesId)
          //把选中的商品信息整合成后台需要的
          let shopDatas = this.data.shopInfo.id + '_' + this.data.shopSizesId + '_' + this.data.shopNum
          console.log(shopDatas)
          wx.navigateTo({
            url: `../affirmOrder/affirmOrder?shopDatas=${shopDatas}`
          })
        }
      }
      setTimeout(res => {
        this.bindClose();
      }, 500)
    }
  },
  //加入购物车执行的函数
  joinCart() {
    //拿到选择好的商品信息
    shops = this.shopList();
    console.log(shops);
    //加入购物车之前需要从缓存中把商品数据拿出来
    wx.getStorage({
      key: 'shopList',
      success: res => {
        //现在购物车中有商品
        console.log(res)
        if (res.data.length > 0) {
          //拿到缓存中的数组
          shopList = res.data ? JSON.parse(res.data) : [];
          console.log(shopList)
          //判断数组中是否有相同规格的商品
          let equal = shopList.findIndex(item => item.shopId == shops.shopId && item.selectedId == shops.selectedId)
          if (equal == -1) {
            //如果equal == -1 则表示没有相同的
            //没有相同的商品，就把新加入的商品（shops）push到shopList中
            shopList.unshift(shops)
            console.log(shopList)
            //然后把新数组存入缓存
            wx.setStorage({
              key: 'shopList',
              data: JSON.stringify(shopList)
            })
            wx.showToast({
              title: '加入购物车成功',
              icon: 'none'
            })
          } else {
            //购物车中如果存在该商品
            //那么就让该商品的数量+新加入购物车的数量
            //并让该商品在购物车顶部显示
            for (var i = 0; i < shopList.length; i++) {
              if (shopList[i].shopId == shops.shopId && shopList[i].selectedId == shops.selectedId) {
                console.log(shopList[i].shopNum * 1 + '+' + shops.shopNum * 1)
                shopList[i].shopNum = shopList[i].shopNum * 1 + shops.shopNum * 1
                shopList.unshift(shopList[i])
                shopList.splice(i + 1, 1)
              }
            }
            wx.showToast({
              title: '加入购物车成功',
              icon: 'none'
            })
            console.log(shopList)
            //然后把新数组存入缓存
            wx.setStorage({
              key: 'shopList',
              data: JSON.stringify(shopList)
            })
          }
        } else {
          //现在购物车为空，第一次添加商品
          //直接把商品存入缓存
          wx.setStorage({
            key: 'shopList',
            data: JSON.stringify([shops])
          })
          wx.showToast({
            title: '加入购物车成功',
            icon: 'none'
          })
        }
      },
      fail: err => {
        //现在购物车为空，第一次添加商品
        console.log(err)
        //直接把商品存入缓存
        wx.setStorage({
          key: 'shopList',
          data: JSON.stringify([shops])
        })
        wx.showToast({
          title: '加入购物车成功',
          icon: 'none'
        })
      }
    })
  },
  //点击分享
  //显示生成海报还是立即分享弹窗
  bindPoster() {
    this.setData({
      mask: true,
      poster: this.data.iPhone == true ? '68' : '0'
    })
    console.log(this.data.shopInfo)
    //先下载商品图片
    wx.downloadFile({
      url: this.data.baseUrl + this.data.images[0], //仅为示例，并非真实的资源
      success(res) {
        console.log(res)
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          shopImgs = res.tempFilePath
        }
      }
    })
    //下载商品二维码
    wx.downloadFile({
      url: this.data.baseUrl + '/' + this.data.shopInfo.rqcode, //仅为示例，并非真实的资源
      success(res) {
        console.log(res)
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          shopCodeImg = res.tempFilePath
        }
      }
    })
  },
  //点击生成海报图片
  bindPosterImage() {
    this.setData({
      mask: true,
      posterImage: 30,
      poster: -1000,
    })
    this.cavs();
  },
  //点击跳转客服、购物车、收藏
  bindService(e) {
    console.log(e)
    let type = e.currentTarget.dataset.type;
    if (type == 1) {
      //跳转客服
      wx.navigateTo({
        url: '../service/service'
      })
    } else if (type == 2) {
      //跳转购物车
      if (this.data.scene == '1008' || this.data.scene == '1007' || this.data.scene == '1047') {
        wx.switchTab({
          url: '../index/index'
        })
      } else {
        wx.switchTab({
          url: '../cart/cart'
        })
      }
    } else {
      console.log(this.data.goodsKeep)
      //点击收藏或取消收藏
      if (this.data.goodsKeep == 'yes') {
        //取消收藏
        wx.showLoading({
          title: '加载中',
        })
        wx.request({
          method: 'POST',
          url: `${app.globalData.api}Goods/collect`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            uid: userId,
            goods_id: this.data.shopInfo.id
          },
          success: res => {
            wx.hideLoading()
            console.log(res);
            if (res.data.status == 1) {
              this.setData({
                goodsKeep: 'no'
              })
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
        //加入收藏
        wx.showLoading({
          title: '加载中',
        })
        wx.request({
          method: 'POST',
          url: `${app.globalData.api}Goods/collect`,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            uid: userId,
            goods_id: this.data.shopInfo.id
          },
          success: res => {
            wx.hideLoading()
            console.log(res);
            if (res.data.status == 1) {
              this.setData({
                goodsKeep: 'yes'
              })
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
  //点击显示规格弹窗
  bindSize(e) {
    let type = e.currentTarget.dataset.type;
    this.setData({
      type: type
    })
    if (type == 1 && this.data.goods_attr.length <= 0) {
      //没有规格时点击选择规格
      wx.showToast({
        title: '该商品暂无规格！',
        icon: 'none'
      })
    } else if (type == 2 && this.data.goods_attr.length <= 0) {
      //没有规格时点击加入购物车
      if (!phone) {
        //判断用户是否绑定了手机号
        wx.showModal({
          title: '温馨提示',
          content: '请先绑定手机号！',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              //点击确定跳转到绑定手机号页面
              wx.navigateTo({
                url: '../boundPhone/boundPhone'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        this.joinCart();
      }
    } else if (type == 3 && this.data.goods_attr.length <= 0) {
      //没有规格时点击立即购买 
      if (!phone) {
        //判断用户是否绑定了手机号
        wx.showModal({
          title: '温馨提示',
          content: '请先绑定手机号！',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              //点击确定跳转到绑定手机号页面
              wx.navigateTo({
                url: '../boundPhone/boundPhone'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        //把选中的商品信息整合成后台需要的
        let shopDatas = this.data.shopInfo.id + '_' + this.data.shopSizesId + '_' + this.data.shopNum
        console.log(shopDatas)
        wx.navigateTo({
          url: `../affirmOrder/affirmOrder?shopDatas=${shopDatas}&type=0`
        })
      }
    } else {
      this.setData({
        mask: true,
        maskSize: this.data.iPhone == true ? '68' : '0'
      })
      console.log(this.data.maskSize)
    }
  },
  //点击关闭所有弹窗
  bindClose() {
    this.setData({
      mask: false,
      poster: -1000,
      posterImage: -1000,
      maskSize: -1000
    })
  },
  //轮播图滑动事件
  bindIndex(e) {
    this.setData({
      imageIndex: e.detail.current
    })
  },
  //分享
  onShareAppMessage(res) {
    console.log(res)
    let id = res.target.dataset.id;
    let img = res.target.dataset.img
    this.bindClose();
    return {
      title: app.globalData.applet,
      path: `/pages/shopDetails/shopDetails?id=${this.data.shopInfo.id}`,
      imageUrl: this.data.baseUrl + this.data.images[0]
    };
    console.log('商品Id:' + id)
  },
  //喷绘canvas画布，制作海报
  cavs() {
    wx.showLoading({
      title: '绘制中',
    })
    let cavHight = this.data.cavHight;
    let cavWidth = this.data.cavWidth;
    let shopInfo = this.data.shopInfo;
    // 使用 wx.createContext 获取绘图上下文 ctx
    let ctx = wx.createCanvasContext('firstCanvas')
    //绘制背景白色
    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, cavWidth, cavHight); //设置喷绘的位置
    //喷绘海报头部文字
    let ctxName = shopInfo.name.substr(0, 6);
    console.log(ctxName)
    let ctxNameLength = (cavWidth * 1 - ctxName.length * 16) / 2; //计算文字的宽度
    ctx.setFontSize(17); //设置字体的字号
    ctx.setFillStyle('#333'); //设置字体的颜色
    ctx.fillText(ctxName, ctxNameLength, 28); // 设置喷绘的位置和文字
    //喷绘海报的商品图片
    console.log(shopImgs)
    let shopImgWidth = this.data.cavWidth * 1 - 40
    ctx.drawImage(shopImgs, 20, 45, shopImgWidth, 305)
    //喷绘海报的商品名称（长一点的）
    let ctxNameLong = shopInfo.name.substr(0, 12);
    console.log(ctxNameLong)
    ctx.setFontSize(15); //设置字体的字号
    ctx.setFillStyle('#222'); //设置字体的颜色
    ctx.fillText(ctxNameLong, 20, 390); // 设置喷绘的位置和文字
    //喷绘价格
    let ctxMoney = '￥' + this.data.shopInfo.sell_price;
    ctx.setFontSize(18); //设置字体的字号
    ctx.setFillStyle('#E95355'); //设置字体的颜色
    ctx.fillText(ctxMoney, 20, 430); // 设置喷绘的位置和文字
    //喷绘二维码底部框
    let shopCodeLeft = this.data.cavWidth * 0.65
    ctx.drawImage('../../images/cavs.png', shopCodeLeft, 360, 90, 94)
    //喷绘二维码
    let shopCodeLefts = this.data.cavWidth * 0.68
    console.log(shopCodeImg)
    ctx.drawImage(shopCodeImg, shopCodeLefts, 370, 75, 75)
    ctx.draw();
    wx.hideLoading()
  },
  // 保存图片
  saveImage() {
    wx.showLoading({
      title: '保存中',
    })
    wx.canvasToTempFilePath({
      fileType: 'jpg',
      quality: 1,
      canvasId: 'firstCanvas',
      success: res => {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: result => {
            wx.hideLoading()
            console.log(result)
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(() => {
              this.bindClose();
            }, 300)
          }
        })
      }
    })
  },
})