//app.js
const util = require('utils/util.js');
App({
  onLaunch: function (op) {
    this.init() 
  },
  onShow(op) {
    this.getTokenFromServer();
  },
  globalData: {
    userInfo: null,
    state:0,
    phone:"41245752425",
    token:'',
    distributor:0,
    balance:0,
    integral: 0,
    globalFormIds: []
  },
  hasBonus(token){
    util.http('bonus/hasBonus', {}, 'get',token).then(res => {
      if (res.code == 200) {
        wx.removeStorage({
          key: 'bonus'
        })
        wx.setStorage({
          key: 'bonus',
          data: {
            bonus: res.data.bonus,
            status: res.data.status
          }
        })
      }
    })
  },
  init() {
    if (wx.getStorageSync('httpClient') && wx.getStorageSync('token')) {
      this.globalData.state = wx.getStorageSync('httpClient').state;
      this.globalData.userInfo = wx.getStorageSync('httpClient').userInfo;
      this.globalData.distributor = wx.getStorageSync('httpClient').distributor;
    }
    if (wx.getStorageSync('distributor')) this.globalData.distributor = wx.getStorageSync('distributor')
    if (wx.getStorageSync('member')) {
      this.globalData.balance = wx.getStorageSync('member').balance
      this.globalData.integral = wx.getStorageSync('member').integral
    }
  },
  getTokenFromServer(callBack) {
    var that = this;
    let token = "";
    wx.login({
      success: function (res) {
        wx.setStorageSync('code', res.code);
        util.http('token/getToken', {code:res.code}, 'post', token).then(data => {
          wx.setStorageSync('token', data.token);
          callBack && callBack(data.token);
          that.globalData.token = data.token;
          that.hasBonus(data.token)
        })
      }
    })
  }
})