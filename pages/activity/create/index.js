Page({
  data: {
    activityName: '',
    activityDate: '',
    locationName: '',
    location: null,
    maxParticipants: 1,
    startTime: '',
    endTime: '',
    options: [''],
    description: '',
    canSubmit: false
  },

  // 检查表单是否可提交
  checkForm() {
    const {
      activityName,
      activityDate,
      location,
      maxParticipants,
      startTime,
      endTime,
      options
    } = this.data

    // 检查必填项
    const canSubmit = activityName &&
      activityDate &&
      location &&
      maxParticipants > 0 &&
      startTime &&
      endTime &&
      options.length > 0 &&
      options.every(option => option.trim())

    this.setData({ canSubmit })
  },

  // 活动名称输入
  onActivityNameInput(e) {
    this.setData({
      activityName: e.detail.value
    }, this.checkForm)
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      activityDate: e.detail.value
    }, this.checkForm)
  },

  // 选择地点
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          locationName: res.name,
          location: {
            name: res.name,
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address
          }
        }, this.checkForm)
      }
    })
  },

  // 减少人数
  decreaseNumber() {
    if (this.data.maxParticipants > 1) {
      this.setData({
        maxParticipants: this.data.maxParticipants - 1
      })
    }
  },

  // 增加人数
  increaseNumber() {
    this.setData({
      maxParticipants: this.data.maxParticipants + 1
    })
  },

  // 人数输入
  onNumberInput(e) {
    const value = parseInt(e.detail.value) || 1
    this.setData({
      maxParticipants: value
    })
  },

  // 开始时间选择
  onStartTimeChange(e) {
    this.setData({
      startTime: e.detail.value
    }, this.checkForm)
  },

  // 结束时间选择
  onEndTimeChange(e) {
    this.setData({
      endTime: e.detail.value
    }, this.checkForm)
  },

  // 选项输入
  onOptionInput(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const options = [...this.data.options]
    options[index] = value
    this.setData({ options }, this.checkForm)
  },

  // 删除选项
  deleteOption(e) {
    const { index } = e.currentTarget.dataset
    const options = [...this.data.options]
    options.splice(index, 1)
    this.setData({ options }, this.checkForm)
  },

  // 添加选项
  addOption() {
    const options = [...this.data.options, '']
    this.setData({ options })
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
  },

  // 提交表单
  async submitForm() {
    if (!this.data.canSubmit) return

    try {
      const result = await wx.cloud.callFunction({
        name: 'createActivity',
        data: {
          name: this.data.activityName,
          time: this.data.activityDate,
          location: this.data.location,
          maxParticipants: this.data.maxParticipants,
          startTime: this.data.startTime,
          endTime: this.data.endTime,
          options: this.data.options,
          description: this.data.description
        }
      })

      if (result.result.code === 200) {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        })
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: result.result.message,
          icon: 'none'
        })
      }
    } catch (e) {
      wx.showToast({
        title: '创建失败',
        icon: 'none'
      })
    }
  }
}) 