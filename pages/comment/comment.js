// pages/comment/comment.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    goodsList:[]
  },
  onLoad(op) {
    let id = op.id;
    let goodslist = op.goodslist;
    let order_no = op.order_no;
    goodslist = JSON.parse(goodslist)
    this.setData({
      id: id,
      goodsList: goodslist,
      order_no: order_no
    })
    main.uploadFormIds();
  },
  bindinput(e){
    let value = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let goodslist = this.data.goodsList;
    goodslist[index].value = value;
    this.setData({
      goodsList: goodslist
    })
  },
  comment(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let goodslist = this.data.goodsList;
    let goodJson = {};
    let arr = [];
    for (var i = 0; i < goodslist.length; i++) {
      if (goodslist[i].value == undefined || goodslist[i].value == '') {
        wx.showToast({
          title: '还有评论没有写哦！',
          icon: 'none',
          duration: 500
        })
        return
      }
      goodJson['product_id'] = goodslist[i].product_id;
      goodJson['content'] = goodslist[i].value;
      arr.push(goodJson)
      goodJson = {};
    }
    arr = JSON.stringify(arr);
    let json = {
      id: this.data.id,
      arr: arr
    };
    let token = app.globalData.token;
    util.http('comment/add', json, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '评论成功！',
          icon: 'success',
          duration: 500
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '../orderDetails/orderDetails?id=' + this.data.id + '&comment=1'
          })
        }, 500)
      }
    })
  }
})