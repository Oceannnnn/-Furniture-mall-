// pages/distributionExpressive/distributionExpressive.js
const util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    list: [],
    page: 1,
    onBottom: true,
    type:0//0为普通提现记录，1为分销提现记录
  },
  onLoad(op) {
    this.setData({
      type: op.type,
    })
    if (op.type == 1) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#464346'
      })
    }
    this.list(1)
  },
  list(page) {
    let list = this.data.list;
    let token = app.globalData.token;
    util.http('recharge/record', { type: this.data.type }, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            list: list
          })
        } else {
          if (page > 1) {
            wx.showToast({
              title: '没有数据啦！',
              icon: 'none',
              duration: 2000
            })
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.list(this.data.page);
    }
  }
})