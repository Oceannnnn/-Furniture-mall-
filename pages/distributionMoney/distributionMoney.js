// pages/distributionMoney/distributionMoney.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad(op) {
    this.setData({
      money: op.money,
      can_money: op.can_money,
      yet_money: op.yet_money
    })
  },
  bindtap(e) {
    main.toDetails(e, "distributionCommission")
  },
  goCommission(e) {
    main.toDetails(e, "distributionExpressive")
  }
})