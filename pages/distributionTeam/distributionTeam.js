// pages/distributionTeam/distributionTeam.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    HeaderList:[{
      name:'一级分销',
      id:1
    }, {
        name: '二级分销',
        id: 2
      }, {
        name: '三级分销',
        id: 3
      }],
    currentId:1,
    team:[],
    page:1,
    onBottom:true
  },
  onLoad() {
    this.team(1,1)
  },
  team(type,page) {
    let json = {
      size: 10,
      page: page,
      class: type
    }
    let list = this.data.team;
    let token = app.globalData.token;
    util.http('distributor/team', json, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data) {
            list.push(item)
          }
          this.setData({
            team: list
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
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
      page: 1,
      onBottom: true,
      team: [],
    })
    this.team(id, 1)
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.team(this.data.currentId,this.data.page);
    }
  }
})