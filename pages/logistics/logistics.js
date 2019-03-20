// pages/logistics/logistics.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    logisticsList:[]
  },
  onLoad(op) {
    let id = op.id;
    let token = app.globalData.token;
    util.http('order/logistics', {id:id}, 'post', token).then(res => {
      if (res.code == 200) {
        let info = res.data;
        this.setData({
          logisticsList: info.info.data,
          num: info.info.nu,
          name: info.name
        })
      }
    })
    main.uploadFormIds();
  }
})