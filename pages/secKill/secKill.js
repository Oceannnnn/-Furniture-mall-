// pages/secKill/secKill.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    isSecKill: 1
  },
  onLoad(op) {
    main.uploadFormIds();
  },
  onShow() {
    this.setData({
      secKillList: [],
      page: 1,
      onBottom: true,
      timer: null
    })
    this.times();
  },
  secKillList(page, ptime) {
    let json = {
      size: 10,
      page: page
    }
    let list = this.data.secKillList;
    util.http('seckill/index', json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            secKillList: list
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
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.secKillList(this.data.page, this.data.ptime);
    }
  },
  times() {
    util.http('seckill/nearest', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          timestamp: res.data.timestamp,
          times: res.data.date,
          isSecKill: res.data.status//1即将开始，0没有秒杀，2是即将结束
        })
        if (res.data.status != 0) {
          this.secKillList(1)
        }
        if (res.data.timestamp) {
          this.countDown(res.data.timestamp);
        }
      }
    })
  },
  countDown(times) {
    let _this = this;
    let timer = _this.data.timer;
    timer = setInterval(function () {
      times--
      let time = main.countDown(times, 0)
      let h = time.split(":")[0];
      let m = time.split(":")[1];;
      let s = time.split(":")[2];
      _this.setData({
        h: h,
        m: m,
        s: s
      })
      if (times <= 0) {
        clearInterval(timer);
        wx.showToast({
          title: '本次活动时间结束',
          icon: "none"
        })
        _this.times();
        _this.secKillList(1)
      }
    }, 1000);
    _this.setData({
      timer: timer
    })
  },
  details(e) {
    main.toDetails(e, "goodsDetails")
  },
  onHide() {
    clearInterval(this.data.timer)
  },
  onReady() {
    var circleCount = 0;
    this.animation = wx.createAnimation();
    setInterval(function () {
      this.setData({ animation: this.animation.export() })
      if (circleCount % 2 == 0) {
        this.animation.translate(0, 5).step()
      } else {
        this.animation.translate(0, 0).step()
      }
      circleCount++;
      if (circleCount == 500) {
        circleCount = 0;
      }
    }.bind(this), 500);
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