// pages/distributionQRCode/distributionQRCode.js
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {},
  onLoad() {
    let token = app.globalData.token;
    util.http('distributor/getPic', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          image: res.data
        })
      }
    })
  },
	//预览图片
  previewImage(e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.image.split(',') // 需要预览的图片http链接列表
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
  },
})