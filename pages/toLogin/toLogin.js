// pages/toLogin/toLogin.js
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const app = getApp()
Page({
  data: {},
  onLoad(op) {
    if (op.currentId) {
      this.setData({
        currentId: op.currentId
      })
    }
    let bonusID = '';
    if (op.bonusID) {
      this.setData({
        bonusID: op.bonusID
      })
    }
  },
  cancel() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  getUserInfo(e) {
    let that = this;
    let scene = '';
    if (wx.getStorageSync('scene')) {
      scene = wx.getStorageSync('scene')
    }
    wx.login({
      success: function (res) {
        let code = res.code
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
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
                      if (that.data.bonusID) {
                        let bonusID = that.data.bonusID;
                        setTimeout(() => {
                          wx.reLaunch({
                            url: '../consumer/consumer?currentId=3' + '&bonusID=' + bonusID
                          })
                        }, 500)
                      } else {
                        setTimeout(() => {
                          wx.switchTab({
                            url: '../index/index'
                          })
                        }, 500)
                      }
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
  }
})