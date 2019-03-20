// pages/payResults/payResults.js
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad(op) {
    let text = "支付成功"
    if (op.payResults == 0) {
      text = "支付失败"
    }
    this.setData({
      payResults: op.payResults,
      text: text,
      id: op.id,
      status: op.status
    })
  },
  back(e) {
    main.toDetails(e, "orderDetails")
  }
})