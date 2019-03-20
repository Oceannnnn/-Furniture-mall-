// pages/collection/collection.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    page: 1,
    onBottom: true,
    collectionList:[]
  },
  onLoad() {
    this.collectionList(1)
    main.uploadFormIds();
  },
  onReachBottom() {
    var page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.collectionList(this.data.page)
    }
  },
  collectionList(page){
    wx.showLoading({
      title: '加载中'
    });
    var list = this.data.collectionList;
    let token = app.globalData.token
    util.http('collect/index', {size: 10,page: page}, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            collectionList: list
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
    wx.hideLoading()
  },
  goodsDetails(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e,"goodsDetails")
  }
})