<template>
	<view class="container">
		<view class="activity-info">
			<text class="activity-name">{{activity.name}}</text>
			<text class="activity-time">{{activity.time}}</text>
			<text class="activity-location">{{activity.location}}</text>
		</view>
		
		<view class="form-section">
			<!-- 验证码输入 -->
			<view class="form-group" v-if="activity.useCode">
				<text class="label">验证码</text>
				<input 
					class="input" 
					v-model="form.code" 
					placeholder="请输入验证码"
					type="number"
					maxlength="6"
				/>
			</view>
			
			<!-- 动态表单字段 -->
			<view 
				class="form-group" 
				v-for="(field, index) in activity.requiredFields" 
				:key="index"
			>
				<text class="label">{{field.label}}</text>
				<input 
					class="input" 
					v-model="form.userInfo[field.name]" 
					:placeholder="`请输入${field.label}`"
				/>
			</view>
			
			<!-- 抽签按钮 -->
			<button 
				class="submit-btn" 
				:disabled="!canSubmit"
				@tap="onSubmit"
			>
				开始抽签
			</button>
		</view>
		
		<!-- 抽签结果弹窗 -->
		<view class="result-popup" v-if="showResult">
			<view class="result-content">
				<view class="result-title">抽签结果</view>
				<view class="result-value">{{result}}</view>
				<button class="close-btn" @tap="hideResult">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activity: {
				name: '',
				time: '',
				location: '',
				useCode: false,
				requiredFields: [],
				options: []
			},
			form: {
				code: '',
				userInfo: {}
			},
			showResult: false,
			result: ''
		}
	},
	computed: {
		canSubmit() {
			// 验证码检查
			if (this.activity.useCode && !this.form.code) {
				return false
			}
			
			// 必填字段检查
			const requiredFields = this.activity.requiredFields.filter(field => field.required)
			return requiredFields.every(field => this.form.userInfo[field.name])
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadActivityDetail(options.id)
		}
	},
	methods: {
		async loadActivityDetail(id) {
			try {
				const result = await uniCloud.callFunction({
					name: 'getActivityDetail',
					data: { activityId: id }
				})
				
				if (result.result.code === 200) {
					this.activity = result.result.data
					// 初始化表单数据
					this.form.userInfo = {}
					this.activity.requiredFields.forEach(field => {
						this.form.userInfo[field.name] = ''
					})
				} else {
					uni.showToast({
						title: result.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		async onSubmit() {
			if (!this.canSubmit) return
			
			try {
				const result = await uniCloud.callFunction({
					name: 'joinActivity',
					data: {
						activityId: this.activity._id,
						code: this.form.code,
						userInfo: this.form.userInfo
					}
				})
				
				if (result.result.code === 200) {
					// 随机选择一个选项
					const randomIndex = Math.floor(Math.random() * this.activity.options.length)
					this.result = this.activity.options[randomIndex]
					this.showResult = true
				} else {
					uni.showToast({
						title: result.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '参与失败',
					icon: 'none'
				})
			}
		},
		hideResult() {
			this.showResult = false
			// 返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 300)
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 30rpx;
}

.activity-info {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.activity-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.activity-time {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
	display: block;
}

.activity-location {
	font-size: 24rpx;
	color: #666;
	display: block;
}

.form-section {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
}

.form-group {
	margin-bottom: 30rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 10rpx;
}

.input {
	width: 100%;
	height: 80rpx;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	background-color: #007AFF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
	margin-top: 60rpx;
}

.submit-btn[disabled] {
	background-color: #cccccc;
	color: #ffffff;
}

.result-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.result-content {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	text-align: center;
}

.result-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
}

.result-value {
	font-size: 48rpx;
	color: #007AFF;
	margin-bottom: 30rpx;
}

.close-btn {
	width: 100%;
	height: 80rpx;
	background-color: #f5f5f5;
	color: #666;
	font-size: 28rpx;
	border-radius: 40rpx;
}
</style> 