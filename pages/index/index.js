//index.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    redrnvelopesClose: 0,
    timer: null
  },
  onLoad(op) {
    this.init();
    this.scene(op);//分销二维码扫描进入
  },
  init() {
    this.setData({
      imgUrls: [],
      textList: [],
      itemsList: [],
      hasSecKill: 0,
      page: 1,
      onBottom: true,
      isPopping: true,//是否已经弹出
      animPlus: {},//旋转动画
      animCollect: {},//item位移,透明度
      animTranspond: {},//item位移,透明度
    })
    util.http('index/home', {}, 'get').then(res => {
      if (res.code == 200) {
        if (res.data.banner) {
          this.setData({
            imgUrls: res.data.banner,
            adList: res.data.ad,
            textList: res.data.notice
          })
        }
      }
    })
    util.http('index/cate', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          cateList: res.data
        })
      }
    })
    this.itemsList(1);
    let status = wx.getStorageSync('bonus').status;// 是否领过红包
    let bonus = wx.getStorageSync('bonus').bonus;// 是否有红包活动  空值为没有红包活动
    if (bonus != '') {
      if (status == 1) {
        this.setData({
          redrnvelopesClose: 1
        })
      } else {
        this.setData({
          redrnvelopesClose: 0
        })
      }
    } else {
      this.setData({
        redrnvelopesClose: 0
      })
    }
    this.getCompanyConfig()//联系我们
  },
  scene(op) {
    let scene = '';
    if (op.scene) {
      scene = decodeURIComponent(op.scene);
    }
    if (op.invite_code) {
      scene = op.invite_code
    }
    wx.setStorage({
      key: 'scene',
      data: scene
    })
  },
  itemsList(page) {
    let json = {
      size: 10,
      page: page
    }
    let list = this.data.itemsList;
    util.http('index/products', json, 'post').then(res => {
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
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom: function () {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.page);
    }
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  countDown(times) {
    let _this = this;
    let timer = _this.data.timer;
    timer = setInterval(function () {
      times--
      let time = main.countDown(times, 0)
      _this.setData({
        times: time
      })
      if (times <= 0) {
        clearInterval(timer);
        wx.showToast({
          title: '本次活动时间结束',
          icon: "none"
        })
        _this.times();
      }
    }, 1000);
    _this.setData({
      timer: timer
    })
  },
  toVoucher(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    if (app.globalData.userInfo) {
      let id = e.currentTarget.dataset.coupon_id;
      let token = app.globalData.token;
      util.http('coupon/getcoupon', { id: id }, 'post', token).then(res => {
        if (res.code == 200) {
          main.toVoucher()
        }
      })
    } else {
      main.goLogin(1)
    }
  },
  toSecKill(e) {
    wx.navigateTo({
      url: '../secKill/secKill'
    })
    let formId = e.detail.formId;
    main.collectFormIds(formId);
  },
  listPage(e) {//折扣商品
    main.toDetails(e, "listPage")
    let formId = e.detail.formId;
    main.collectFormIds(formId);
  },
  bindconfirm(e) {
    wx.navigateTo({
      url: '../listPage/listPage?keywords=' + e.detail.value
    })
  },
  bindsubmit(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.phone
    })
    this.plus()
  },
  redrnvelopesClose() {
    this.setData({
      redrnvelopesClose: 0
    })
  },
  consumer(e) {
    this.setData({
      isConsumer: 1
    })
    wx.navigateTo({
      url: '../consumer/consumer?currentId=3'
    })
  },
  //点击弹出
  plus() {
    if (this.data.isPopping) {
      //缩回动画
      this.popp();
      this.setData({
        isPopping: false
      })
    } else if (!this.data.isPopping) {
      //弹出动画
      this.takeback();
      this.setData({
        isPopping: true
      })
    }
  },
  //弹出动画
  popp() {
    //plus顺时针旋转
    let animationPlus = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationcollect = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationTranspond = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationInput = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    animationPlus.rotateZ(180).step();
    animationcollect.translate(-20, -40).rotateZ(180).opacity(1).step();
    animationTranspond.translate(-60, 30).rotateZ(180).opacity(1).step();
    this.setData({
      animPlus: animationPlus.export(),
      animCollect: animationcollect.export(),
      animTranspond: animationTranspond.export(),
      animInput: animationInput.export(),
    })
  },
  //收回动画
  takeback() {
    //plus逆时针旋转
    let animationPlus = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationcollect = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationTranspond = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    let animationInput = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    animationPlus.rotateZ(0).step();
    animationcollect.translate(0, 0).rotateZ(0).opacity(0).step();
    animationTranspond.translate(0, 0).rotateZ(0).opacity(0).step();
    this.setData({
      animPlus: animationPlus.export(),
      animCollect: animationcollect.export(),
      animTranspond: animationTranspond.export(),
      animInput: animationInput.export(),
    })
  },
  getCompanyConfig() {
    let token = app.globalData.token;
    util.http('index/about', {}, 'get', token).then(res => {
      if (res.code == 200) {
        let info = res.data;
        app.globalData.address = info.address;
        app.globalData.latitude = info.latitude;
        app.globalData.longitude = info.longitude;
        app.globalData.name = info.name;
        app.globalData.phone = info.mobile;
        app.globalData.logo = info.logo;
      }
    })
  },
  onHide() {
    this.takeback();
    this.setData({
      isPopping: true
    })
    if (this.data.isConsumer == 1) return
    this.redrnvelopesClose();
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
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.init()
    this.times();
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  }
})
