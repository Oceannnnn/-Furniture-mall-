// pages/distributionTeam/distributionTeam.js
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {
    bonus: [],
    page: 1,
    onBottom: true
  },
  onLoad() {
    this.bonus(1)
  },
  bonus(page) {
    let json = {
      size: 10,
      page: page
    }
    let list = this.data.bonus;
    let token = app.globalData.token;
    util.http('bonus/bonus_list', json, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            bonus: list
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
      this.bonus(this.data.page);
    }
  }
})