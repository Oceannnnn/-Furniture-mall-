// pages/collage/collage.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    collageList: [],
    HeaderList: [],
    page:1,
    onBottom:true
  },
  onLoad() {
    this.init()
    main.uploadFormIds();
  },
  init() {
    util.http("tuan/index", {}, 'get').then(res => {
      if (res.code == 200) {
        if (res.data == '') return
        this.setData({
          HeaderList: res.data,
          currentId: res.data[0].id
        })
        this.collageList(res.data[0].id,10,1)
      }
    })
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  toList(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
      collageList: [],
      page: 1,
      onBottom: true
    })
    this.collageList(id, 10, 1);
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.collageList(this.data.currentId, 10, this.data.page);
    }
  },
  collageList(id, size, page) {
    let json = {
      id: id,
      size: size,
      page: page
    }
    let list = this.data.collageList;
    util.http("tuan/detail", json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            collageList: list
          })
        } else {
          if (page < 2) return
          this.data.onBottom = false;
        }
      }
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