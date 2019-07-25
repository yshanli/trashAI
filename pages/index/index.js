//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    picSrc: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    inProcessing: false,
    classifyResult: "塑料"
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  takePhoto: function() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          picSrc: res.tempFilePaths
        })

        that.processPicture(tempFilePaths)
      }
    })
  },

  processPicture: function(filePaths) {
    var that = this

    if (that.data.inProcessing) {
      return
    }

    that.setData({
      inProcessing: true
    })
    wx.showLoading({
      title: '正在识别中...',
    })

    var predictPayload = {
      "instances": [{ 'input_image': filePaths[0] }]
    }

    wx.request({
      url: 'http:localhost:8501/v1/models/fashion_model:predict',
      method: "POST",
      data: predictPayload,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log(res.data)// 服务器回包内容
        }
      },
      fail: function (res) {
        wx.showToast({ title: '系统错误', icon: "none", duration:3000 })
        this.set({
          classifyResult: ""
        })
      },
      complete: function (res) {
        wx.hideLoading()

        that.setData({
          inProcessing: false
        })
      }
    })
  }
})
