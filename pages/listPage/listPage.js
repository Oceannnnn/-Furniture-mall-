// pages/listPage/listPage.js// index/list.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId:0,
    itemsList: [],
    page: 1,
    onBottom: true,
    triangle:3,
    type:""
  },
  onLoad(op) {
    this.setData({
      tabTxt: [
        {
          name: '销量',
          tab: 0,
          type: "sales"
        },
        {
          name: '最新',
          tab: 1,
          type: "time"
        },
        {
          name: '价格',
          tab: 2,
          type: "price_asc"
        },
        {
          name: '人气',
          tab: 3,
          type: "collect"
        }]
    })
    if (op.id) {
      let id = op.id;
      let isRebate = op.type;//0非折扣入口，1折扣入口
      this.setData({
        shop_id: id,
        isRebate: isRebate,
        keywords: ''
      })
      this.itemsList(id, 1, "sales");
    }
    if (op.keywords) {
      this.setData({
        shop_id: op.keywords,
        isRebate: '',
        keywords: op.keywords
      })
      this.itemsList(op.keywords, 1, "sales");
    }
  },
  filterTab(e) {
    let tab = e.currentTarget.dataset.tab;
    let triangle = this.data.triangle;
    let type = e.currentTarget.dataset.type;
    let tabTxt = this.data.tabTxt;
    if (tab == 2) {
      this.setData({
        triangle: 0,
      })
      tabTxt[2].type = "price_desc";
      if (triangle == 0) {
        triangle = 1;
        tabTxt[2].type = "price_asc";
      } else {
        triangle = 0;
        tabTxt[2].type = "price_desc";
      }
    } else {
      triangle = 3;
    } 
    this.setData({
      tabTxt: tabTxt,
      currentId: tab,
      triangle: triangle,
      itemsList: [],
      page: 1,
      onBottom: true,
      type: type
    })
    this.itemsList(this.data.shop_id,1,type);
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  onReachBottom: function () {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.shop_id, this.data.page,this.data.type);
    }
  },
  itemsList(id,page,type){
    let json = {
      id:id,
      size:10,
      page:page,
      type:type
    }
    let list = this.data.itemsList;
    let isRebate = this.data.isRebate;
    let keywords = this.data.keywords;
    let url = "index/cate_proList";
    if (isRebate==1){
      url = "discount/prolist";
    }
    if (keywords) {
      url = "index/search"; 
      json = {
        keywords: id,
        size: 10,
        page: page,
        type: type
      }
    }
    util.http(url, json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            itemsList: list
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
