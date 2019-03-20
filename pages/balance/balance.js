// pages/balance/balance.js
const util = require('../../utils/util.js')
const main = require('../../utils/main.js')
const app = getApp()
Page({
  data: {
    balance: "0.00"
  },
  onLoad(){
    main.uploadFormIds();
  },
  onShow() {
    let token = app.globalData.token;
    util.http('member/info', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          balance: res.data.balance
        })
      }
    })
  },
  toExpressive(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e,"distributionExpressive")
  },
  goCommission(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "distributionCommission")
  },
  recharge(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../recharge/recharge'
    })
  }
})