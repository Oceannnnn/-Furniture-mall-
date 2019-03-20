// pages/my/my.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    hasUserInfo: false,
    state: 0
  },
  onLoad() {
    this.init()
  },
  onShow() {
    if (this.data.hasUserInfo) {
      let token = app.globalData.token;
      util.http('member/info', {}, 'get', token).then(res => {
        if (res.code == 200) {
          this.setData({
            balance: res.data.balance,
            integral: res.data.integral
          })
        } else if (res.code == 201){
          wx.showToast({
            title: '请先登录',
            icon:'none'
          })
        }
      })
    }
  },
  allorder(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let data = e.currentTarget.dataset
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../allorder/allorder?id=' + data.id + '&type=' + data.type + '&allorder=' + data.allorder,
      })
    } else {
      main.goLogin()
    }
  },
  collection(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../collection/collection'
      })
    } else {
      main.goLogin()
    }
  },
  cart(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.switchTab({
        url: '../cart/cart'
      })
    } else {
      main.goLogin()
    }
  },
  coupons(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../coupons/coupons'
      })
    } else {
      main.goLogin()
    }
  },
  redPacket(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../redPacket/redPacket'
      })
    } else {
      main.goLogin()
    }
  },
  myadd(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../myadd/myadd'
      })
    } else {
      main.goLogin()
    }
  },
  getUserInfo(e) {
    let that = this;
    let scene = '';
    if (wx.getStorageSync('scene')) {
      scene = wx.getStorageSync('scene')
    }
    wx.login({
      success: function (res) {
        console.log(res)
        let code = res.code
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              console.log(res)
              wx.getUserInfo({
                success: msg => {
                  let encryptedData = msg.encryptedData;
                  let iv = msg.iv;
                  let token = '';
                  let json = {
                    code: code,
                    encryptedData: encryptedData,
                    iv: iv,
                    invite_code: scene
                  }
                  json = JSON.stringify(json)
                  util.http('login/login', json, 'post', token).then(data => {
                    console.log(data)
                    if (data.code == 200) {
                      main.member();
                      app.globalData.userInfo = e.detail.userInfo;
                      app.globalData.distributor = data.data.distributor;
                      that.setData({
                        state: 1,
                        hasUserInfo: true,
                        userInfo: e.detail.userInfo
                      })
                      wx.setStorage({
                        key: "httpClient",
                        data: {
                          state: 1,
                          userInfo: e.detail.userInfo,
                          distributor: data.data.distributor,
                        }
                      })
                      wx.setStorage({
                        key: "invite_code",
                        data: data.data.invite_code
                      })
                      wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 1000
                      })
                      setTimeout(() => {
                        wx.switchTab({
                          url: '../index/index'
                        })
                      }, 500)
                    }
                  })
                }
              })
            } else {
              wx.showToast({
                title: '授权才能登录哦！',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    })
  },
  call(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.makePhoneCall({
      phoneNumber: app.globalData.phone
    })
  },
  distribution(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../distribution/distribution',
      })
    } else {
      main.goLogin()
    }
  },
  init() {
    this.setData({
      state: app.globalData.state,
      order: [{
        name: "待付款",
        icon: "daifukuan",
        allorder: "pay",
        id: 1
      }, {
        name: "待发货",
        icon: "daifahuo",
        allorder: "deliver",
        id: 2
      }, {
        name: "待收货",
        icon: "daishouhuo",
        allorder: "receive",
        id: 3
      }, {
        name: "待评价",
        icon: "daipingjia20",
        allorder: "evaluate",
        id: 4
      }]
    })
    if (app.globalData.userInfo) {
      this.setData({
        hasUserInfo: true,
        userInfo: app.globalData.userInfo
      })
    }
  }
})