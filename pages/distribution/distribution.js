// pages/distribution/distribution.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onShow() {
    this.init()
    main.uploadFormIds();
  },
  init(){
    let token = app.globalData.token;
    util.http('distributor/pre', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          distributor:res.data.status,//1已经为分销商，2申请中，3未申请
          down_money: res.data.cum_money,
          up_money: res.data.money
        })
        wx.setStorage({
          key: "invite_code",
          data: res.data.invite_code
        })
        if(res.data.status == 1){
          this.distributor(token)
        }
      }
    })
  },
  distributor(token) {
    util.http('distributor/index', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          userInfo: app.globalData.userInfo,
          can_money: res.data.can_money,
          num: res.data.num,
          un_money: res.data.un_money,
          yet_money: res.data.yet_money,
          money: res.data.money,
          cash: res.data.cash
        })
      }
    })
  },
  allorder(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../allorder/allorder?id=' + data.id + '&type=' + data.type + '&allorder=' + data.allorder,
    })
  },
  bindtapOn(e) {
    let type = e.currentTarget.dataset.type;
    if (type == 2) {
      this.setData({
        disabled: true
      })
    }
    let that = this;
    let token = app.globalData.token;
    util.http('distributor/register', { type: type }, 'post', token).then(res => {
      if (res.code == 200) {
        if (type == 2){
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success': function (res) {
              that.setData({
                disabled: false
              })
              wx.showToast({
                title: '申请成功',
                icon: 'success',
                duration: 1000
              })
              that.init();
            },
            'fail': function (res) {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1000
              })
              that.setData({
                disabled: false
              })
            }
          })
        } else {
          wx.showToast({
            title: '申请成功',
            icon: 'success',
            duration: 1000
          })
          wx.setStorage({
            key: "invite_code",
            data: res.data.invite_code
          })
          that.init();
        }
      } else if (res.code == 201) {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  bindtapUP(){
    wx.showModal({
      title: '提示',
      content: '不符合申请条件！',
      confirmColor: '#029F53'
    })
  },
  toMoney() {
    wx.navigateTo({
      url: '../distributionMoney/distributionMoney?money=' + this.data.money + '&can_money=' + this.data.can_money + '&yet_money=' + this.data.yet_money,
    })
  },
  goCommission(e) {
    main.toDetails(e, "distributionCommission")
  },
  toExpressive(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "distributionExpressive")
  },
  bindsubmit(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
  },
  onShareAppMessage() {
    let invite_code = ""
    if (wx.getStorageSync("invite_code")) {
      invite_code = wx.getStorageSync("invite_code");
    }
    return {
      title: '分享不仅仅是一种生活，更是收获',
      path: '/pages/index/index?invite_code=' + invite_code
    }
  }
})