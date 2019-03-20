const app = getApp()
const main = require('../../utils/main.js');
Page({
  data: {
  },
  onLoad() {
    this.setData({
      name: app.globalData.name,
      phone: app.globalData.phone,
      address: app.globalData.address,
      latitude: app.globalData.latitude,
      longitude: app.globalData.longitude,
      logo: app.globalData.logo,
      markers: [{
        iconPath: "../../images/add.png",
        id: 0,
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude,
        width: 30,
        height: 30
      }]
    })
  },
  toCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone
    })
  },
  toPosition() {
    wx.openLocation({
      latitude: Number(this.data.latitude),
      longitude: Number(this.data.longitude),
      name: this.data.address,
      scale: 15
    })
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