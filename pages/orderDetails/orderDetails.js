// pages/orderDetails/orderDetails.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    times:"",
    goodsList:[],
    disabled:false
  },
  onLoad(op) {
    if(op.id){
      this.setData({
        id: op.id,
        status: op.type
      })                  
    } 
    if(op.comment){
      this.setData({
        comment:op.comment
      })
    }
    this.init(op.id)
    main.uploadFormIds();
  },
  init(id) {
    let token = app.globalData.token;
    util.http('order/details', { id: id}, 'post').then(res => {
      if (res.code == 200) {
        this.setData({
          info: res.data,
          times: res.data.aut_time
        })
        if (res.data.status == 6) {
          this.setData({
            tuan_times: res.data.end_time
          })
          this.countDown(res.data.timestamp)
        }
      }
    })

  },
  countDown(times) {
    let _this = this;
    let timer = null;
    timer = setInterval(function () {
      times--
      let time = main.countDown(times, 1)
      _this.setData({
        tuan_times: time
      })
    }, 1000);
    if (times <= 0) {
      clearInterval(timer);
      wx.showToast({
        title: '订单已取消！',
        icon:"none"
      })
    }
  },
  details(e) {
    main.toDetails(e, "goodsDetails")
  },
  comment(e) {//评价
    let id = e.currentTarget.dataset.id;
    let order_no = e.currentTarget.dataset.order_no;
    let goodslist = e.currentTarget.dataset.goodslist;
    goodslist = JSON.stringify(goodslist)
    wx.navigateTo({
      url: '../comment/comment?id=' + id + '&order_no=' + order_no + '&goodslist=' + goodslist,
    })
  },
  confirm(e) {//确认收货
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let that = this;
    let url = "", content = "", title = "", confirmText="";
    if (type == "s") {//删除订单
      url = "order/del";
      content = "您确定要删除订单吗？";
      title = '已删除';
      confirmText = "订单已删除！";
    } else if (type == "q") {//取消订单
      url = "order/cancel";
      content = "您确定要取消订单吗？";
      title = '已取消';
      confirmText = "订单已取消";
    } else if (type == "h") {//确认收货
      url = "order/confirm";
      content = "请您收到货后再点击“确定”，否则可能钱货两空！";
      title = '成功确认收货！';
      confirmText = "成功确认收货！";
    }
    wx.showModal({
      content: content,
      confirmColor: '#029F53',
      success: function (res) {
        if (res.confirm) {
          let token = app.globalData.token;
          util.http(url, { id: id }, 'post', token).then(res => {
            if (res.code == 200) {
              wx.showToast({
                title: title,
                icon: 'success'
              })
              that.setData({
                confirmData:1,
                confirmText: confirmText
              })
            }
          })
        }
      }
    })
  },
  remind(e) {//提醒发货
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    util.http('order/remind', { id: id }, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '已提醒',
          icon: 'success'
        })
      }
    })
  },
  logistics(e) {
    main.toDetails(e, "logistics")
  },
  pay(e) {
    this.setData({
      disabled: true
    })
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    let that = this;
    util.http("pay/wxPay", { id: id }, 'post', token).then(res => {
      wx.requestPayment({
        'timeStamp': res.timeStamp,
        'nonceStr': res.nonceStr,
        'package': res.package,
        'signType': res.signType,
        'paySign': res.paySign,
        'success': function (res) {
          that.setData({
            disabled: false
          })
          this.init(this.data.id)
        },
        'fail': function (res) {
          that.setData({
            disabled: false
          })
        }
      })
    })
  },
  onUnload(){
    if(this.data.comment){
      wx.reLaunch({
        url: '../index/index',
      })
    }
  }
})