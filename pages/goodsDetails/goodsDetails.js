// pages/goodsDetails/goodsDetails.js
const app = getApp();
const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    info: false,//商品选择
    currentId: 1,
    isSeckill: true,
    imgUrls: [],
    commentrList: [],
    collageList: [],
    commodityAttr: [],
    attrTuanItem: [],
    num: 1,
    attrValueList: [],
    shopMoney: 0,
    shopContent: "",
    shopStock: 0,
    page: 1,
    onBottom: true,
    timer: null
  },
  onLoad(op) {
    this.setData({
      good_id: op.id,
      HeaderList: [{
        name: "详情信息",
        id: 1
      }, {
        name: "商品评论",
        id: 2
      }]
    })
    this.init(op.id)
    main.uploadFormIds();
  },
  init(good_id) {
    let token = app.globalData.token
    util.http('product/detail', { id: good_id }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          commodityAttr: res.data.attrItem,
          attrTuanItem: res.data.attrTuanItem,
          pro_info: res.data.pro_info,
          imgUrls: res.data.banner_info,
          collect: res.data.collect,
          status: res.data.type,//0表示普通订单，2表示拼团,1表示秒杀
          tuanNum: res.data.tuanNum
        })
        if (res.data.type == 1) this.times();
        if (res.data.type == 2) this.collageList();//拼团倒计时
        WxParse.wxParse('details', 'html', res.data.pro_info.content, this, 0)
      }
    })
    this.commentrList(good_id, 1)
  },
  times() {//秒杀倒计时
    util.http('seckill/nearest', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          timestamp: res.data.timestamp,
          times: res.data.date,
          hasSecKill: res.data.status
        })
        if (res.data.timestamp) {
          let times = res.data.timestamp;
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
        }
      }
    })
  },
  onHide() {
    clearInterval(this.data.timer)
  },
  collageList() {
    let token = app.globalData.token;
    util.http('tuan/group', { id: this.data.good_id }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          collageList: res.data
        })
        this.collageTime(res.data)
      }
    })
  },
  collageTime(collage) {
    let collageList = collage;
    setInterval(() => {
      for (let i in collageList) {
        let time = collageList[i].time;
        time--
        let times = main.countDown(time, 0)
        collageList[i].date = times
        collageList[i].time = time
        this.setData({
          collageList: collageList
        })
      }
    }, 1000)
  },
  commentrList(good_id, page) {//评论
    let json = {
      size: 10,
      page: page,
      id: good_id
    }
    let list = this.data.commentrList;
    util.http('comment/index', json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            commentrList: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    if (this.data.currentId == 2) {
      let page = this.data.page + 1;
      this.setData({
        page: page
      })
      if (this.data.onBottom) {
        this.commentrList(this.data.good_id, this.data.page)
      }
    }
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
    })
  },
  collect(e) {
    let collectType = "add";
    let collect = this.data.collect;
    if (collect == 1) {
      collectType = "delete";
    }
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      let collect = e.currentTarget.dataset.collect;
      this.setData({
        collect: !this.data.collect
      })
      util.http('collect/change', { pid: this.data.good_id, type: collectType }, 'post', token).then(res => { })
    } else {
      main.goLogin(1)
    }
  },
  close() {
    this.setData({
      info: !this.data.info
    })
  },
  buy(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let isTuan = e.currentTarget.dataset.istuan;
    let order_id = e.currentTarget.dataset.order_id;
    let cart = e.currentTarget.dataset.cart;
    let comfirmIsTuan = 0;
    let comfirmOrderId = "";
    let comfirmCart = 0;
    let arr = this.data.commodityAttr;
    if (isTuan == 1) {
      comfirmIsTuan = isTuan
      arr = this.data.attrTuanItem;
    }
    if (order_id) {
      comfirmOrderId = order_id
    }
    if (cart) {
      comfirmCart = cart
    }
    this.setData({
      num: 1,
      attrValueList: [],
      shopMoney: 0,
      shopContent: "",
      shopStock: 0,
      comfirmIsTuan: comfirmIsTuan,
      comfirmOrderId: comfirmOrderId,
      comfirmCart: comfirmCart,
      arr: arr
    })
    this.close();
    this.attrValueList(arr);
  },
  addtion(e) {//加法
    let num = e.currentTarget.dataset.num;
    let maxNum = this.data.shopStock;
    if (num < maxNum) {
      num++
    }
    this.setData({
      num: num
    })
  },
  //减法
  subtraction(e) {
    var num = e.currentTarget.dataset.num
    //当1件时，点击移除
    if (num == 1) {
      return
    } else {
      num--
    }
    this.setData({
      num: num
    })
  },
  attrValueList(arr) {
    this.setData({
      includeGroup: arr
    });
    this.distachAttrValue(arr);
    // 只有一个属性组合的时候默认选中 
    // if (arr.length == 1) {
    //   for (var i = 0; i < arr[0].attrValueList.length; i++) {
    //     this.data.attrValueList[i].selectedValue = arr[0].attrValueList[i].attrValue;
    //   }
    //   this.setData({
    //     attrValueList: this.data.attrValueList
    //   });
    // }
  },
  // 获取数据
  distachAttrValue(arr) {
    // 把数据对象的数据（视图使用），写到局部内 
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据 
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(arr[i].attrValueList[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex); 
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置 
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理 
          if (!this.isValueExist(arr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(arr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: arr[i].attrValueList[j].attrKey,
            attrValues: [arr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    let content = "";
    // console.log('result', attrValueList) 
    for (var i = 0; i < attrValueList.length; i++) {
      content += attrValueList[i].attrKey + ",";
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    content = content.substr(0, content.length - 1);
    this.setData({
      attrValueList: attrValueList,
      shopContent: content,
      shopMoney: this.data.pro_info.price,
      spareMoney: this.data.pro_info.price,
      shopStock: this.data.pro_info.inventory,
      spareStock: this.data.pro_info.inventory
    });
  },
  getAttrIndex(attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值 
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist(value, valueArr) {
    // 判断是否已有属性值 
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue(e) {
    /* 
    点选属性值，联动判断其他属性值是否可选 
    { 
    attrKey:'型号', 
    attrValueList:['1','2','3'], 
    selectedValue:'1', 
    attrValueStatus:[true,true,true] 
    } 
    console.log(e.currentTarget.dataset); 
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引 
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中 
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中 
        this.selectValue(attrValueList, index, key, value);
      }
    }
  },
  /* 选中 */
  selectValue(attrValueList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex); 
    var includeGroup = [];
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选 
      var commodityAttr = this.data.arr;
      // 其他选中的属性值全都置空 
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }
    // console.log('选中', commodityAttr, index, key, value); 
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;
    // 判断属性是否可选 
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    let content = "";
    let contentItem = "";
    let contenArr = [];
    for (var k = 0; k < attrValueList.length; k++) {
      let selectedValue = attrValueList[k].selectedValue;
      contentItem = selectedValue ? attrValueList[k].selectedValue : attrValueList[k].attrKey;
      content += contentItem + ",";
      if (selectedValue) contenArr.push(selectedValue)
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    content = content.substr(0, content.length - 1);
    let shopStock = this.data.shopStock;
    let shopMoney = this.data.shopMoney;
    if (contenArr.length == this.data.attrValueList.length) {
      shopStock = includeGroup[0].stock
      shopMoney = includeGroup[0].price
    }
    // console.log('结果', attrValueList); 
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      shopContent: content,
      shopStock: shopStock,
      shopMoney: shopMoney
    });
    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选 
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue(attrValueList, index, key, value) {
    let commodityAttr = this.data.arr;
    attrValueList[index].selectedValue = '';
    // 判断属性是否可选 
    let content = "";
    let contentItem = "";
    for (var i = 0; i < attrValueList.length; i++) {
      let selectedValue = attrValueList[i].selectedValue;
      contentItem = selectedValue ? attrValueList[i].selectedValue : attrValueList[i].attrKey;
      content += contentItem + ",";
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    content = content.substr(0, content.length - 1);
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList,
      shopContent: content,
      shopStock: this.data.spareStock,
      shopMoney: this.data.spareMoney
    });
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },
  comfirm(e) {
    if (app.globalData.userInfo) {
      if (this.data.shopStock < 1) {
        wx.showToast({
          title: '库存不足',
          icon: "none",
          duration: 1000
        })
        return
      }
      var value = [];
      let attrValueList = this.data.includeGroup[0].attrValueList;
      let priceId = this.data.includeGroup[0].priceId;
      for (var i = 0; i < this.data.attrValueList.length; i++) {
        if (!this.data.attrValueList[i].selectedValue) {
          break;
        }
      }
      if (i < this.data.attrValueList.length) {
        wx.showToast({
          title: '请选择完整！',
          icon: 'none',
          duration: 1000
        })
      } else {
        let id = this.data.good_id;
        let priceId = this.data.includeGroup[0].priceId
        this.comfirmBtn(e, priceId, id)
      }
    } else {
      main.goLogin(1)
    }
  },
  comfirmBtn(e, priceId, id) {
    let token = app.globalData.token;
    let comfirmistuan = e.currentTarget.dataset.comfirmistuan;
    let num = this.data.num;
    let jsonArr = [{ product_id: id, priceId: priceId, count: num }];
    jsonArr = JSON.stringify(jsonArr);
    if (comfirmistuan == 1) { //拼团
      let json = {
        order_id: this.data.comfirmOrderId,//与别人拼团时需要的参数
        products: jsonArr,
        order_type: 1
      }
      util.http('order/add', json, 'post', token).then(res => {
        if (res.code == 200) {
          wx.removeStorageSync('orderData');
          wx.setStorage({
            key: "orderData",
            data: res.data
          })
          wx.navigateTo({
            url: '../confirmationOrder/confirmationOrder?type=2',
          })
        }
      })
    } else {
      let carJson = {
        priceId: priceId,
        id: id,
        num: num
      }
      let comfirmCart = this.data.comfirmCart;
      if (comfirmCart == 1) {
        util.http('cart/add', carJson, 'post', token).then(res => {
          if (res.code == 200) {
            if (res.data.enough == 2) {
              wx.showToast({
                title: '添加成功',
                icon: "success",
                duration: 1000
              })
            } else {
              wx.showToast({
                title: '当前购物车已满！',
                icon: "none",
                duration: 1000
              })
            }
            this.close();
          }
        })
      } else {
        let json = {
          products: jsonArr,
          order_type: ""
        }
        util.http('order/add', json, 'post', token).then(res => {
          if (res.code == 200) {
            wx.removeStorageSync('orderData');
            wx.setStorage({
              key: "orderData",
              data: res.data
            })
            wx.navigateTo({
              url: '../confirmationOrder/confirmationOrder?type=0'
            })
          }
        })
      }
    }
  },
  onShareAppMessage(ops) {
    let invite_code = ""
    if (wx.getStorageSync("invite_code")) {
      invite_code = wx.getStorageSync("invite_code");
    }
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let url = "/" + currentPage.route;
    if (ops.from === 'button') { }
    return {
      title: '超级推荐' + this.data.pro_info.name,
      path: url + '?id=' + this.data.good_id + '&invite_code=' + invite_code
    }
  },
})
