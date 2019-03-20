const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad() {
    main.uploadFormIds();
  },
  onShow() {
    this.init()
  },
  init() {
    this.setData({
      list: [],
      allSelect: "circle",
      num: 0,
      count: 0,
      page: 1,
      onBottom: true,
      cartArr: [],
      chooseArr:[],
      showDelBtn:true,
    })
    if (wx.getStorageSync('httpClient').state){
      this.setData({
        login_state: wx.getStorageSync('httpClient').state
      })
      this.list()
    }
  },
  list() {
    let json = {
      size: '',
      page: ''
    }
    let token = app.globalData.token;
    util.http('cart/index', json, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          list: res.data.upList,
          downList: res.data.downList,
          cartNum: res.data.num
        })
      }
    })
  },
  details(e) {
    main.toDetails(e, "goodsDetails")
  },
  //改变选框状态
  change(e){
    let showDelBtn = e.currentTarget.dataset.showdelbtn;
    //得到下标
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let pid = e.currentTarget.dataset.pid;
    let num = e.currentTarget.dataset.num;
    let priceId = e.currentTarget.dataset.priceid;
    let allSelect = "circle";
    let chooseJson = {
      product_id: pid,
      count:num,
      priceId: priceId,
      cart_id: id
    }
    let cartArr = this.data.cartArr;
    let chooseArr = this.data.chooseArr;
    cartArr.push(id)
    chooseArr.push(chooseJson)
    //得到选中状态
    cartArr = main.unique(cartArr)
    chooseArr = main.uniqueObject(chooseArr)
    var select = e.currentTarget.dataset.select;
    if(select == "circle"){
      var stype = "success"
    }else{
      var stype = "circle"
      cartArr = main.remove(cartArr, id);
      let chooseJsonArr = [];
      chooseJsonArr.push(chooseJson);
      chooseArr = main.removeObject(chooseArr, chooseJsonArr);
    }
    //把新的值给新的数组
    var downList = this.data.downList;
    var newList = this.data.list;
    if (showDelBtn == 1){
      downList[index].select = stype;
    } else {
      newList[index].select = stype;
    }
    let newListLen = newList.length;
    let downListLen = downList.length;
    if (!this.data.showDelBtn) {
      if (cartArr.length == downListLen + newListLen) allSelect = "success"
    } else {
      if (cartArr.length == newListLen) allSelect = "success"
    }
    this.setData({
      cartArr: cartArr,
      list: newList,
      downList: downList,
      chooseArr: chooseArr,
      allSelect: allSelect
    })
    //调用计算数目方法
    this.countNum()
    //计算金额
    this.count()

  },
  delete(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let newList = '';
    if (type == "0") {//没有下架的商品
      newList = this.data.list;
    } else {//下架的商品
      newList = this.data.downList;
    }
    let token = app.globalData.token;
    util.http('cart/del', {cart_id: id}, 'post', token).then(res => {
      if(res.code==200){
        newList.splice(index, 1);
        if (type == "0") {
          this.setData({
            list: newList,
            cartNum: res.data.num
          })
        } else {//下架的商品
          this.setData({
            downList: newList,
            cartNum: res.data.num
          })
        }
      }else{
        wx.showToast({
          title: "删除失败",
          icon:"none",
          duration:500
        })
      }
    })
  },
  delsBtn() {
    let cart_ids = ""
    let cartArr = this.data.cartArr;
    for (var i in cartArr){
      cart_ids += cartArr[i]+","
    }
    cart_ids = cart_ids.substring(0, cart_ids.length - 1);
    let token = app.globalData.token;
    if (cart_ids != "") {
      util.http('cart/dels', { cart_ids: cart_ids }, 'post', token).then(res => {
        if (res.code == 200) {
          this.init()
        } else {
          wx.showToast({
            title: "删除失败",
            icon: "none",
            duration: 500
          })
        }
      })
    }else{
      wx.showToast({
        title: '你没有选择宝贝哦',
        icon:'none',
        duration:500
      })
    }
  },
  //加法
  addtion(e) {
    let cart_id = e.currentTarget.dataset.id;
    //得到下标
    let index = e.currentTarget.dataset.index;
    //得到点击的值
    let num = e.currentTarget.dataset.num;
    let stock = e.currentTarget.dataset.stock;//库存
    if (num < stock){
      num++
    }
    //把新的值给新的数组
    let newList = this.data.list
    newList[index].num = num
    //把新的数组传给前台
    this.setData({
      list: newList
    })
    //调用计算数目方法
    this.countNum();
    //计算金额
    this.count();
    this.editNum(cart_id, num);
  },
  //减法
  subtraction(e) {
    let cart_id = e.currentTarget.dataset.id;
    //得到下标
    var index = e.currentTarget.dataset.index
    //得到点击的值
    var num = e.currentTarget.dataset.num
    //把新的值给新的数组
    var newList = this.data.list
    //当1件时，点击移除
    if (num == 1) {
        return
    }else{
      num--
      newList[index].num = num
    }
    //把新的数组传给前台
    this.setData({
      list: newList
    })
    //调用计算数目方法
    this.countNum()
    //计算金额
    this.count();
    this.editNum(cart_id, num);
  },
  editNum(cart_id, num) {
    let token = app.globalData.token;
    util.http('cart/editNum', { cart_id: cart_id, num: num }, 'post', token).then(res => { })
  },
  //全选
  allSelect(e){
    let showDelBtn = this.data.showDelBtn;
    //先判断现在选中没
    var allSelect = e.currentTarget.dataset.select;
    var newList = this.data.list;
    let downList = this.data.downList;
    let chooseJson = {};
    let chooseArr = [];
    let cartArr = [];
    if(allSelect == "circle"){
      //先把数组遍历一遍，然后改掉select值
      for (var i = 0; i < newList.length; i++) {
        newList[i].select = "success"
        chooseJson = {
          product_id: newList[i].pid,
          cart_id: newList[i].id,
          count: newList[i].num,
          priceId: newList[i].priceId
        }
        cartArr.push(newList[i].id)
        chooseArr.push(chooseJson)
      }
      if (!showDelBtn) {
        for (var i = 0; i < downList.length; i++) {
          downList[i].select = "success"
          chooseJson = {
            product_id: downList[i].pid,
            cart_id: downList[i].id,
            count: downList[i].num,
            priceId: downList[i].priceId
          }
          cartArr.push(downList[i].id)
          chooseArr.push(chooseJson)
        }
      }
      var select="success";
    }else{
      for (var i = 0; i < newList.length; i++) {
        newList[i].select = "circle";
      }
      if (!showDelBtn) {
        for (var i = 0; i < downList.length; i++) {
          downList[i].select = "circle";
        }
      }
      var select = "circle"
      chooseArr = [];
      cartArr = [];
    }
    this.setData({
      list:newList,
      downList: downList,
      allSelect:select,
      chooseArr: chooseArr,
      cartArr: cartArr
    })
    //调用计算数目方法
    this.countNum()
    //计算金额
    this.count()
  },
  //计算数量
  countNum(){
    //遍历数组，把既选中的num加起来
    var newList = this.data.list
    var allNum=0
    for (var i = 0; i < newList.length; i++) {
      if(newList[i].select=="success"){
        allNum += parseInt(newList[i].num) 
      }
    }
    parseInt
    this.setData({
      num:allNum
    })
  },
  //计算金额方法
  count(){
    //思路和上面一致
    //选中的订单，数量*价格加起来
    var newList = this.data.list
    var newCount=0
    for(var i=0;i<newList.length;i++){
      if(newList[i].select == "success"){
        newCount += newList[i].num * newList[i].price
      }
    }
    this.setData({
      count:newCount
    })
  },
  comfirm(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let token = app.globalData.token;
    let products = JSON.stringify(this.data.chooseArr);
    if (this.data.chooseArr != '') {
      util.http('order/add', { products: products }, 'post', token).then(res => {
        if (res.code == 200) {
          let data = res.data;
          wx.removeStorageSync('orderData')
          wx.setStorage({
            key: "orderData",
            data: data
          })
          wx.navigateTo({
            url: '../confirmationOrder/confirmationOrder?type=0'
          })
        }
      })
    }else{
      wx.showToast({
        title: '请选择宝贝',
        icon: 'none'
      })
    }
  },
  showDelBtn(e){
    this.setData({
      showDelBtn: !this.data.showDelBtn
    })
    let showDelBtn = this.data.showDelBtn;
    let cartArr = this.data.cartArr;
    let downList = this.data.downList;
    let newList = this.data.list;
    let allSelect = this.data.allSelect;
    if (allSelect =="success"){
      this.allSelect(e);
    }
    if (showDelBtn) {
      let newListLen = newList.length;
      if (cartArr.length == newListLen) allSelect = "success"
      for (var i = 0; i < downList.length; i++) {
        downList[i].select = "circle"
      }
      this.setData({
        downList: downList,
        allSelect: allSelect
      })
    }
  }
})