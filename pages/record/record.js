// pages/record/record.js
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {
    page: 1,
    onBottom: true,
    list:[]
  },
  onLoad(options) {
    this.list(1);
    main.uploadFormIds();
  },
  list(page) {
    let list = this.data.list;
    let token = app.globalData.token;
    util.http('recharge/record',{type:2}, 'post', token).then(res => {
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
  },
})