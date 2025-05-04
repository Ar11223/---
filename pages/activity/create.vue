<template>
  <view class="container">
    <form @submit="handleSubmit">
      <view class="form-card">
        <view class="form-header">
          <text class="form-title">创建抽签活动</text>
        </view>

        <view class="form-body">
          <!-- 基本信息 -->
          <view class="form-section">
            <text class="section-title">基本信息</text>
            
            <view class="form-item" :class="{'error': errors.title}">
              <text class="form-label">活动标题</text>
              <input class="form-input" v-model="formData.title" placeholder="请输入活动标题" />
              <text class="error-msg" v-if="errors.title">{{ errors.title }}</text>
            </view>

            <view class="form-item" :class="{'error': errors.location}">
              <text class="form-label">活动地点</text>
              <input class="form-input" v-model="formData.location" placeholder="请输入活动地点" />
              <text class="error-msg" v-if="errors.location">{{ errors.location }}</text>
            </view>

            <view class="form-item">
              <text class="form-label">活动说明</text>
              <textarea class="form-textarea" v-model="formData.description" placeholder="请输入活动说明"></textarea>
            </view>

            <view class="form-item" :class="{'error': errors.maxParticipants}">
              <text class="form-label">最大参与人数</text>
              <input class="form-input" type="number" v-model="formData.maxParticipants" placeholder="请输入最大参与人数" />
              <text class="error-msg" v-if="errors.maxParticipants">{{ errors.maxParticipants }}</text>
            </view>
          </view>

          <!-- 抽签设置 -->
          <view class="form-section">
            <text class="section-title">抽签设置</text>
            
            <view class="form-item" :class="{'error': errors.options}">
              <text class="form-label">抽签选项</text>
              <view class="options-list">
                <view class="option-item" v-for="(option, index) in formData.options" :key="index">
                  <input class="form-input" v-model="formData.options[index]" placeholder="请输入选项" />
                  <text class="delete-btn" @tap="deleteOption(index)">删除</text>
                </view>
              </view>
              <button class="add-btn" @tap="addOption">添加选项</button>
              <text class="error-msg" v-if="errors.options">{{ errors.options }}</text>
            </view>

            <view class="form-item" :class="{'error': errors.time}">
              <text class="form-label">抽签时间范围</text>
              <view class="time-range">
                <picker mode="date" :value="formData.lotteryStartDate" @change="onLotteryStartDateChange">
                  <view class="form-input">{{ formData.lotteryStartDate || '开始日期' }}</view>
                </picker>
                <picker mode="time" :value="formData.lotteryStartTime" @change="onLotteryStartTimeChange">
                  <view class="form-input">{{ formData.lotteryStartTime || '开始时间' }}</view>
                </picker>
                <text class="separator">至</text>
                <picker mode="date" :value="formData.lotteryEndDate" @change="onLotteryEndDateChange">
                  <view class="form-input">{{ formData.lotteryEndDate || '结束日期' }}</view>
                </picker>
                <picker mode="time" :value="formData.lotteryEndTime" @change="onLotteryEndTimeChange">
                  <view class="form-input">{{ formData.lotteryEndTime || '结束时间' }}</view>
                </picker>
              </view>
              <text class="error-msg" v-if="errors.time">{{ errors.time }}</text>
            </view>
          </view>

          <!-- 其他设置 -->
          <view class="form-section">
            <text class="section-title">其他设置</text>
            
            <view class="form-item">
              <text class="form-label">验证设置</text>
              <view class="switch-container">
                <switch :checked="formData.useCode" @change="onUseCodeChange" />
                <text class="switch-label">使用验证码</text>
              </view>
            </view>

            <view class="form-item" v-if="formData.useCode" :class="{'error': errors.code}">
              <text class="form-label">验证码</text>
              <input class="form-input" v-model="formData.code" placeholder="请输入验证码" />
              <text class="error-msg" v-if="errors.code">{{ errors.code }}</text>
            </view>

            <view class="form-item">
              <text class="form-label">允许名单</text>
              <view class="upload-section">
                <button class="upload-btn" @tap="uploadAllowList">上传名单文件</button>
                <text class="upload-tip">支持txt、csv格式，每行一个名字</text>
              </view>
              <textarea class="form-textarea" v-model="allowListText" placeholder="或直接输入允许参与的人员名单，每行一个名字" />
            </view>
          </view>
        </view>

        <view class="form-footer">
          <button class="submit-btn" form-type="submit" :disabled="isSubmitting">
            <text v-if="!isSubmitting">创建活动</text>
            <text v-else>提交中...</text>
          </button>
        </view>
      </view>
    </form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        title: '',
        location: '',
        description: '',
        maxParticipants: '',
        options: [''],
        lotteryStartDate: '',
        lotteryStartTime: '',
        lotteryEndDate: '',
        lotteryEndTime: '',
        useCode: false,
        code: '',
        allowList: []
      },
      errors: {},
      isSubmitting: false
    }
  },
  computed: {
    allowListText: {
      get() {
        return this.formData.allowList.join('\n')
      },
      set(value) {
        this.formData.allowList = value.split('\n').filter(item => item.trim())
      }
    }
  },
  methods: {
    // 原有方法保持不变
    addOption() {
      this.formData.options.push('')
    },
    deleteOption(index) {
      this.formData.options.splice(index, 1)
    },
    onLotteryStartDateChange(e) {
      this.formData.lotteryStartDate = e.detail.value
    },
    onLotteryStartTimeChange(e) {
      this.formData.lotteryStartTime = e.detail.value
    },
    onLotteryEndDateChange(e) {
      this.formData.lotteryEndDate = e.detail.value
    },
    onLotteryEndTimeChange(e) {
      this.formData.lotteryEndTime = e.detail.value
    },
    onUseCodeChange(e) {
      this.formData.useCode = e.detail.value
    },
    async uploadAllowList() {
      try {
        const [error, res] = await uni.chooseFile({
          count: 1,
          type: 'file',
          extension: ['.txt', '.csv']
        })
        
        if (error) {
          throw new Error('选择文件失败')
        }
        
        const filePath = res.tempFilePaths[0]
        const fileContent = await uni.getFileSystemManager().readFileSync(filePath, 'utf8')
        
        this.formData.allowList = fileContent
          .split('\n')
          .map(name => name.trim())
          .filter(name => name.length > 0)
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '上传失败',
          icon: 'none'
        })
      }
    },
    validateForm() {
      this.errors = {}
      let isValid = true

      if (!this.formData.title) {
        this.errors.title = '请填写活动标题'
        isValid = false
      }

      if (!this.formData.location) {
        this.errors.location = '请填写活动地点'
        isValid = false
      }

      if (!this.formData.maxParticipants) {
        this.errors.maxParticipants = '请输入最大参与人数'
        isValid = false
      }
      
      const validOptions = this.formData.options.filter(opt => opt && opt.trim())
      if (validOptions.length === 0) {
        this.errors.options = '请至少添加一个抽签选项'
        isValid = false
      }
      
      if (!this.formData.lotteryStartDate || !this.formData.lotteryStartTime) {
        this.errors.time = '请选择抽签开始时间'
        isValid = false
      }
      if (!this.formData.lotteryEndDate || !this.formData.lotteryEndTime) {
        this.errors.time = '请选择抽签结束时间'
        isValid = false
      }
      
      if (this.formData.useCode && !this.formData.code) {
        this.errors.code = '请输入验证码'
        isValid = false
      }
      
      return isValid
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }
      
      this.isSubmitting = true
      uni.showLoading({
        title: '创建中...'
      })
      
      try {
        const result = await uniCloud.callFunction({
          name: 'createActivity',
          data: this.formData
        })
        
        uni.hideLoading()
        
        if (result.result.code === 200) {
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: result.result.message || '创建失败',
            icon: 'none'
          })
        }
      } catch (e) {
        uni.hideLoading()
        console.error('创建活动失败:', e)
        uni.showToast({
          title: '创建失败: ' + (e.message || '未知错误'),
          icon: 'none'
        })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
}

.form-card {
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.form-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.form-body {
  padding: 30rpx;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #eee;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item.error .form-input,
.form-item.error .form-textarea {
  border-color: #f56c6c;
}

.form-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.error-msg {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #f56c6c;
}

.options-list {
  margin-top: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 20rpx;
}

.delete-btn {
  color: #ff4d4f;
  font-size: 28rpx;
}

.add-btn {
  margin-top: 20rpx;
  background-color: #f0f0f0;
  color: #333;
  font-size: 28rpx;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.separator {
  color: #999;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.switch-label {
  font-size: 28rpx;
  color: #666;
}

.upload-section {
  margin-bottom: 20rpx;
}

.upload-btn {
  background-color: #f0f0f0;
  color: #333;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
}

.form-footer {
  padding: 0 30rpx 30rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #007AFF;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
}

.submit-btn[disabled] {
  background-color: #a0cfff;
}
</style>
