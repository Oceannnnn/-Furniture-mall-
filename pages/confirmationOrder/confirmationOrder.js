// pages/confirmationOrder/confirmationOrder.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    goodsList: [],
    coupon_num:0,
    coupon:0,
    coupon_id:'',
    isdiscount:true,
    balance:0,
    balanceUse:[],
    addressId:0
  },
  onLoad(op) {
    this.setData({
      type:op.type
    })
    this.init()
    main.uploadFormIds();
  },
  onShow() {
    let balance = 0;
    if (this.data.balanceUse != '') {
      balance = this.data.balance
    } else {
      balance = 0
    }
    this.count(balance);
  },
  init(){
    let orderData = wx.getStorageSync('orderData');
    let postage = orderData.productInfo.postage;
    let orderPrice = orderData.productInfo.orderPrice;
    this.setData({
      goodsList: orderData.productInfo.pStatusArray,
      balance: orderData.balance,
      coupon_num: orderData.coupon,
      postage: postage,
      tuan_id: orderData.tuan_id,
      info: orderData.info
    })
    if (orderData.info!=''){
      this.setData({
        location: orderData.info.address,
        addressId: orderData.info.id,
        name: orderData.info.name,
        phone: orderData.info.mobile
      })
    }
    if (postage > 0) {
      orderPrice = postage + orderPrice;
    }
    this.setData({
      allPrice: orderPrice,
      orderPrice: orderPrice,
    })

  },
  orderAddress(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../myadd/myadd?isChoose=1',
    })
  },
  useCoupon() {
    wx.navigateTo({
      url: '../useCoupon/useCoupon?orderPrice=' + this.data.orderPrice
    })
  },
  checkboxChange(e){
    let value = e.detail.value;
    let balance = 0;
    if (value != '') {
      balance = this.data.balance
    } else {
      balance = 0
    }
    this.setData({
      balanceUse : value
    })
    this.count(balance);
  },
  count(balance) {
    let orderPrice = this.data.orderPrice;
    let coupon = this.data.coupon;
    let isdiscount = this.data.isdiscount;
    let coupon_id = this.data.coupon_id;
    let allPrice = this.data.orderPrice;
    if (coupon_id > 0) {
      if (!isdiscount) {
        let diffPrice = orderPrice - coupon;
        if (diffPrice < balance) {
          allPrice = diffPrice
        } else {
          allPrice = diffPrice - balance
        }
        allPrice = allPrice.toFixed(2)
      } else {
        coupon = coupon/10;
        let diffPrice = orderPrice * coupon;
        if (diffPrice < balance) {
          allPrice = diffPrice
        } else {
          allPrice = diffPrice - balance
        }
        allPrice = allPrice.toFixed(2)
      }
    } else {
      if (allPrice < balance) {
        allPrice = allPrice
      } else {
        allPrice = allPrice - balance
      }
      allPrice = allPrice.toFixed(2)
    }
    this.setData({
      allPrice: allPrice
    })
  },
  comfirm(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let info = this.data.info;
    if (info == ''){
      wx.showToast({
        title: '请选择你的地址',
        icon:'none',
        duration:1000
      })
      return
    }
    this.setData({
      disabled: true
    })
    var token = app.globalData.token;
    let balance = 0;
    let balanceUse = this.data.balanceUse;
    let allPrice = this.data.allPrice;
    let address = this.data.addressId;
    if (balanceUse!=''){
      balance = 1
    } else {
      balance = 0
    }
    let json = {
      address: address,
      coupon: this.data.coupon_id,
      balance: balance,
      type:this.data.type,//2为拼团，0为其他
      tuan_id: this.data.tuan_id
    }
    util.http('order/place', json, 'post', token).then(res => {
      if (res.code == 200) {
        let payType = res.data.payType;
        let order_id = res.data.order_id;
        let id = res.data.id;
        this.pay(order_id, id, token, payType)
      }
    })
  },
  pay(order_id, id, token, payType) {
    let that = this;
    let url = ""
    if (payType == 1) {
      url = "pay/balancePay"
    } else {
      url = "pay/wxPay"
    }
    util.http(url, { id: order_id }, 'post', token).then(res => {
      let payResults = 0;
      if (payType == 1) {
        if (res.code == 200) {
          that.setData({
            disabled: false
          })
          payResults = 1;
        } else {
          payResults = 0;
        }
        setTimeout(() => {
          wx.reLaunch({
            url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
          })
        }, 500)
      } else {
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
            payResults = 1;
            setTimeout(() => {
              wx.reLaunch({
                url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
              })
            }, 500)
          },
          'fail': function (res) {
            that.setData({
              disabled: false
            })
            payResults = 0;
            setTimeout(() => {
              wx.reLaunch({
                url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
              })
            }, 500)
          }
        })
      }
    })
  }
})