// pages/consumer/consumer.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId: 1,
    HeaderList: [{
      name: "满减优惠券",
      id: 1
    }, {
      name: "折扣优惠券",
      id: 2
    }, {
      name: "红包",
      id: 3
    }],
    couponList: [],
    page: 1,
    onBottom: true,
    isFriend: true,
    isGetBonus: 0,
    redrnvelopesList: [],
    canDismantling: 0,
    bonusID: ''
  },
  onLoad(op) {
    console.log(op)
    if (op.currentId) {
      this.setData({
        currentId: op.currentId
      })
    }
    this.couponList(1, 1)
    this.init(op);
    main.uploadFormIds();
  },
  init(op) {
    if (!app.globalData.userInfo) {
      let bonusID = '';
      if (op.bonusID) {
        bonusID = op.bonusID
      }
      wx.redirectTo({
        url: '../toLogin/toLogin?currentId=' + this.data.currentId + '&bonusID=' + bonusID
      })
    } else {
      if (this.data.currentId == 3) {
        let bonus = wx.getStorageSync('bonus').bonus; // 是否有红包活动  空值为没有红包活动
        let isHaveBonus = ''
        if (bonus != '') {
          isHaveBonus = true;
          this.getBonus(op)
        } else {
          isHaveBonus = false
        }
        this.setData({
          isHaveBonus: isHaveBonus
        })
      }
    }
  },
  getBonus(op) {
    let bonus = wx.getStorageSync('bonus').bonus;
    let status = wx.getStorageSync('bonus').status;
    let token = app.globalData.token;
    this.setData({
      redrnvelopes: bonus
    })
    if (status == 1) {
      this.setData({
        isGetBonus: 1 //领取过
      })
      let id = "";
      if (op) {
        if (op.bonusID != undefined) {
          id = op.bonusID;
        }
      }
      this.redrnvelopesList(bonus, id, token)
    } else {
      let isGetBonus = 0;
      if (op.bonusID) {
        this.setData({
          bonusID: op.bonusID
        })
        this.redrnvelopesList(bonus, op.bonusID, token);
        isGetBonus = 1;
      }
      this.setData({
        isGetBonus: isGetBonus
      })
    }
  },
  receiveBonus(e) { //自己拆红包
    let token = app.globalData.token;
    let redrnvelopes = e.currentTarget.dataset.redrnvelopes;
    let bonus = wx.getStorageSync('bonus').bonus;
    util.http('bonus/getBonus', {
      id: redrnvelopes
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          isGetBonus: 1 //领取过
        })
        let id = res.data.bonus;
        this.redrnvelopesList(bonus, id, token)
      }
    })
  },
  redrnvelopesList(bonus, id, token) {
    util.http('bonus/getBonusInfo', {
      bonus: bonus,
      id: id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        let info = res.data;
        this.setData({
          redrnvelopesList: info.avatar,
          bonusID: info.bonusID,
          end_time: info.end_time,
          bonusMoney: info.money,
          bonusCount: info.count,
          times: info.timestamp,
          isFriend: info.user,
          resultMoney: info.bonus,
          canDismantling: info.status //红包0不可拆，1可拆，
        })
        this.times(info.timestamp)
      }
    })
  },
  pullTogether(e) { //一起拆红包
    let newText = e.currentTarget.dataset.new;
    let token = app.globalData.token;
    if (newText) {
      app.hasBonus(token)
      wx.reLaunch({
        url: '../consumer/consumer?currentId=3',
      })
    } else {
      let id = this.data.bonusID;
      util.http('bonus/pullTogether', {
        id: id
      }, 'post', token).then(res => {
        if (res.code == 200) {
          let info = res.data
          this.setData({
            redrnvelopesList: info.avatar,
            end_time: info.end_time,
            bonusMoney: info.money,
            bonusCount: info.count,
            times: info.timestamp,
            canDismantling: info.status //红包0不可拆（人数不足），1可拆（人数刚好），4已拆，5活动结束,6红包过期
          })
          this.times(info.timestamp)
        }
      })
    }
  },
  pullBonus() { //立即拆红包，人数已够
    let token = app.globalData.token;
    let bonus = wx.getStorageSync('bonus').bonus;
    let id = this.data.bonusID;
    util.http('bonus/pullBonus', {
      id: id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.redrnvelopesList(bonus, id, token)
        main.member();
      }
    })
  },
  times(times) {
    let _this = this;
    let timer = null;
    timer = setInterval(function () {
      times--
      let time = main.countDown(times, 0)
      _this.setData({
        end_time: time
      })
      if (times <= 0) {
        clearInterval(timer);
        wx.showToast({
          title: '已结束',
          icon: "none"
        })
      }
    }, 1000);
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id
    })
    if (id == 3) {
      let bonus = wx.getStorageSync('bonus').bonus; // 是否有红包活动  空值为没有红包活动
      if (bonus != '') {
        this.setData({
          isHaveBonus: true
        })
        this.getBonus()
      }
    }
  },
  couponList(page, currentId) {
    let json = {
      size: 10,
      page: page
    }
    let token = app.globalData.token;
    util.http('index/coupon', json, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          money_off: res.data.money_off,
          discount: res.data.discount
        })
      }
    })
  },
  toVoucher(e) {
    let couponList = this.data.couponList;
    let id = e.currentTarget.dataset.coupon_id;
    let index = e.currentTarget.dataset.index;
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      util.http('coupon/getcoupon', {
        id: id
      }, 'post', token).then(res => {
        if (res.code == 200) {
          couponList[index].status = 1;
          this.setData({
            couponList: couponList
          })
          main.toVoucher()
        }
      })
    } else {
      main.goLogin(1)
    }
  },
  goHome() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  onShareAppMessage(res) {
    let title = "一起来拆红包吧！";
    let path = '/pages/index/index';
    let bonusID = this.data.bonusID;
    if (res.from === 'button') {
      if (this.data.canDismantling == 4) {
        path = '/pages/index/index';
      } else {
        path = '/pages/consumer/consumer?currentId=3&bonusID=' + bonusID;
      }
    } else {
      path = '/pages/index/index';
    }
    return {
      title: title,
      path: path
    }
  }
})