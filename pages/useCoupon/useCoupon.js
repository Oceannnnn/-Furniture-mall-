// pages/useCoupon/useCoupon.js
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const app = getApp();
Page({
  data: {
    couponList: [],
    onBottom: true,
    page: 1
  },
  onLoad(options) {
    let orderPrice = options.orderPrice;
    this.setData({
      orderPrice: orderPrice
    })
    this.couponList(1, orderPrice)
    main.uploadFormIds();
  },
  UnChooseCoupon(e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    var coupon = e.currentTarget.dataset.coupon;
    var id = e.currentTarget.dataset.id;
    prevPage.setData({
      coupon: 0,
      coupon_id: 0
    })
    wx.navigateBack();
  },
  chooseCoupon(e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    var coupon = e.currentTarget.dataset.coupon;
    var id = e.currentTarget.dataset.id;
    let isdiscount = e.currentTarget.dataset.isdiscount;
    prevPage.setData({
      coupon: coupon,
      coupon_id: id,
      isdiscount: isdiscount
    })
    wx.navigateBack();
  },
  onReachBottom() {
    var that = this;
    // 当前页+1
    var page = that.data.page + 1;
    that.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.couponList(this.data.page, this.data.orderPrice)
    }
  },
  couponList(page, orderPrice) {
    wx.showLoading({
      title: '加载中'
    });
    var list = this.data.couponList;
    var token = app.globalData.token;
    util.http('order/useCoupon', { size: 10, page: page, orderPrice: orderPrice}, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            couponList: list
          })
        } else {
          wx.showToast({
            title: '没有数据啦！',
            icon: 'none',
            duration: 1000
          })
          this.data.onBottom = false;
        }
        wx.hideLoading();
      }
    })
  }
})