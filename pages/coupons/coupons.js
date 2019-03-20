// pages/coupons/coupons.js
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {
    currentId: 1,
    HeaderList: [{
      name: "未使用",
      id: 1,
      type:"canUse"
    }, {
      name: "已使用",
        id: 2,
        type: "aUse"
      }, {
        name: "已过期",
        id: 3,
        type: "outOff"
      }],
    page: 1,
    onBottom: true,
    couponList: []
  },
  onLoad() {
    this.couponList(1,"canUse")
  },
  couponList(page, type) {
    let json = {
      size: 10,
      page: page,
      type: type
    }
    let list = this.data.couponList;
    let token = app.globalData.token;
    util.http('coupon/index', json, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            couponList: list
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
      this.couponList(this.data.couponsType, this.data.page);
    }
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    this.setData({
      currentId: id, 
      couponsType: type,
      page: 1,
      onBottom: true,
      couponList: []
    })
    this.couponList(1, type)
  }
})