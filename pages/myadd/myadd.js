// pages/myadd/myadd.js
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const app = getApp()
Page({
  data: {
    hidden:false,
    id:"",
    isChoose:1,
    defaultIcon:0
  },
  onLoad(op) {
    if (op.isChoose) {
      this.setData({
        isChoose: op.isChoose
      })
    }
    this.init(op)
    main.uploadFormIds();
  },
  //表单验证
  checkInput() {
    let phone = this.data.phone;
    let region = this.data.region;
    let name = this.data.name;
    if (!name) {
      wx.showToast({
        title: '请输入联系人',
        image: '../../images/warn.png'
      })
      return false
    } else if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        image: '../../images/warn.png'
      })
      return false
    } else {
      if (!util.toCheck(phone)) {
        wx.showToast({
          title: '手机号格式错误',
          image: '../../images/warn.png'
        })
        return false
      }
    }
    if (!this.data.location) {
      wx.showToast({
        title: '请输入地区',
        image: '../../images/warn.png'
      })
      return false
    }
    if (!region){
      wx.showToast({
        title: '请输入详细地址',
        image: '../../images/warn.png'
      })
      return false
    }
    return true
  },
  edit(e){
    this.write();
    let edit = e.currentTarget.dataset;
    let defaultIcon = edit.default;
    let checked = true;
    if (defaultIcon==1){
      checked = true
    }else{
      checked = false
    }
    this.setData({
      checked: checked,
      id: edit.id,
      location: edit.location,
      name: edit.name,
      region: edit.region,
      defaultIcon: defaultIcon,
      phone: edit.phone
    })
  },
  submit() {
    let json = {
      name: this.data.name,
      default: this.data.defaultIcon,
      mobile: this.data.phone,
      region: this.data.location,
      detail: this.data.region,
      id: this.data.id,
    }
    let token = app.globalData.token;
    if (this.checkInput()) {
      util.http('address/add', json, 'post',token).then(res => {
        if (res.code == 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.init();
          this.setData({
            hidden: !this.data.hidden,
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
  },
  bindPhoneChange: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindNameChange(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindLocationChange(e) {
    this.setData({
      location: e.detail.value
    })
  },
  bindAddressChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  write(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    this.setData({
      hidden: !this.data.hidden,
    })
  },
  location(){
    let that = this;
    wx.chooseLocation({
      success:function(res){
        that.setData({
          location: res.address
        })
      }
    })
  },
  switchChange(e) {
    let defaultIcon = 0;
    if (e.detail.value){
      defaultIcon = 1
    }else{
      defaultIcon = 0
    }
    this.setData({
      defaultIcon: defaultIcon
    })
  },
  addressDel(e) {
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    let index = e.currentTarget.dataset.index;
    let myaddList = this.data.myaddList;
    util.http('address/del', {id:id}, 'post', token).then(res => {
      if (res.code == 200) {
        myaddList.splice(index, 1);
        this.setData({
          myaddList: myaddList
        })
      }
    })
  },
  init() {
    let token = app.globalData.token;
    util.http('address/index', {}, 'get',token).then(res => {
      if (res.code == 200) {
        this.setData({
          myaddList: res.data
        })
      }
    })
  },
  chooseAddress(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]  //上一个页面
    let dataset = e.currentTarget.dataset;
    let isdefault = dataset.default;
    let location = dataset.location + dataset.region;
    prevPage.setData({
      location: location,
      name: dataset.name,
      phone: dataset.phone,
      addressId: dataset.id
    })
    wx.navigateBack()
  }
})