<template>
	<view class="container">
		<view class="activity-header">
			<text class="activity-name">{{activity.name}}</text>
			<text class="activity-status" :class="activity.status">{{activity.status === 'ongoing' ? '进行中' : '已结束'}}</text>
		</view>
		
		<view class="info-section">
			<view class="info-item">
				<text class="label">活动时间</text>
				<text class="value">{{activity.time}}</text>
			</view>
			<view class="info-item">
				<text class="label">活动地点</text>
				<text class="value">{{activity.location}}</text>
			</view>
			<view class="info-item">
				<text class="label">参与人数</text>
				<text class="value">{{activity.participants.length}}/{{activity.maxParticipants}}</text>
			</view>
			<view class="info-item">
				<text class="label">抽签时间</text>
				<text class="value">{{activity.startTime}} - {{activity.endTime}}</text>
			</view>
		</view>
		
		<view class="description-section">
			<text class="section-title">活动描述</text>
			<text class="description">{{activity.description || '暂无描述'}}</text>
		</view>
		
		<view class="options-section">
			<text class="section-title">抽签选项</text>
			<view class="options-list">
				<view class="option-item" v-for="(option, index) in activity.options" :key="index">
					<text class="option-text">{{option}}</text>
				</view>
			</view>
		</view>
		
		<view class="action-section">
			<button 
				class="action-btn join-btn" 
				:disabled="!canJoin"
				@tap="goToJoin"
			>
				{{joinButtonText}}
			</button>
			<button 
				class="action-btn share-btn" 
				@tap="showShareOptions"
			>分享活动</button>
		</view>
		
		<!-- 分享弹窗 -->
		<view class="share-popup" v-if="showShare">
			<view class="share-content">
				<view class="share-title">分享活动</view>
				<view class="share-options">
					<view class="share-option" @tap="shareByQRCode">
						<image src="/static/images/qrcode.png" mode="aspectFit"></image>
						<text>二维码分享</text>
					</view>
					<view class="share-option" @tap="shareByLink">
						<image src="/static/images/link.png" mode="aspectFit"></image>
						<text>链接分享</text>
					</view>
				</view>
				<button class="close-btn" @tap="hideShare">关闭</button>
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
				description: '',
				maxParticipants: 0,
				options: [],
				startTime: '',
				endTime: '',
				status: 'ongoing',
				participants: [],
				creator: '',
				useCode: false
			},
			isCreator: false,
			showShare: false
		}
	},
	computed: {
		canJoin() {
			if (this.activity.status !== 'ongoing') return false
			if (this.activity.participants.length >= this.activity.maxParticipants) return false
			
			const now = Date.now()
			const startTime = new Date(this.activity.startTime).getTime()
			const endTime = new Date(this.activity.endTime).getTime()
			
			return now >= startTime && now <= endTime
		},
		joinButtonText() {
			if (this.activity.status !== 'ongoing') return '活动已结束'
			if (this.activity.participants.length >= this.activity.maxParticipants) return '人数已满'
			
			const now = Date.now()
			const startTime = new Date(this.activity.startTime).getTime()
			const endTime = new Date(this.activity.endTime).getTime()
			
			if (now < startTime) return '抽签未开始'
			if (now > endTime) return '抽签已结束'
			
			return '参与抽签'
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
					// 检查是否是创建者
					const userInfo = uni.getStorageSync('userInfo')
					this.isCreator = userInfo && userInfo._id === this.activity.creator
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
		goToJoin() {
			if (!this.canJoin) return
			
			uni.navigateTo({
				url: `/pages/activity/join?id=${this.activity._id}`
			})
		},
		showShareOptions() {
			this.showShare = true
		},
		hideShare() {
			this.showShare = false
		},
		async shareByQRCode() {
			try {
				// 生成分享链接
				const shareUrl = `https://your-domain.com/pages/activity/join?id=${this.activity._id}`
				
				// 调用云函数生成二维码
				const result = await uniCloud.callFunction({
					name: 'generateQRCode',
					data: {
						url: shareUrl
					}
				})
				
				if (result.result.code === 200) {
					// 保存二维码到相册
					uni.saveImageToPhotosAlbum({
						filePath: result.result.data.qrcode,
						success: () => {
							uni.showToast({
								title: '二维码已保存到相册',
								icon: 'success'
							})
							this.hideShare()
						}
					})
				}
			} catch (e) {
				uni.showToast({
					title: '生成二维码失败',
					icon: 'none'
				})
			}
		},
		shareByLink() {
			// 复制链接到剪贴板
			const shareUrl = `https://your-domain.com/pages/activity/join?id=${this.activity._id}`
			uni.setClipboardData({
				data: shareUrl,
				success: () => {
					uni.showToast({
						title: '链接已复制',
						icon: 'success'
					})
					this.hideShare()
				}
			})
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

.activity-header {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.activity-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.activity-status {
	font-size: 24rpx;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
}

.activity-status.ongoing {
	background-color: #e6f7ff;
	color: #007AFF;
}

.activity-status.ended {
	background-color: #f5f5f5;
	color: #999;
}

.info-section {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.label {
	font-size: 28rpx;
	color: #666;
}

.value {
	font-size: 28rpx;
	color: #333;
}

.description-section, .options-section {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.description {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

.options-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.option-item {
	background-color: #f5f5f5;
	padding: 10rpx 20rpx;
	border-radius: 6rpx;
}

.option-text {
	font-size: 28rpx;
	color: #333;
}

.action-section {
	margin-top: 40rpx;
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	height: 88rpx;
	border-radius: 44rpx;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.join-btn {
	background-color: #007AFF;
	color: #ffffff;
}

.join-btn[disabled] {
	background-color: #cccccc;
	color: #ffffff;
}

.share-btn {
	background-color: #ffffff;
	color: #007AFF;
	border: 1px solid #007AFF;
}

.share-popup {
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

.share-content {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
}

.share-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.share-options {
	display: flex;
	justify-content: space-around;
	margin-bottom: 30rpx;
}

.share-option {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.share-option image {
	width: 100rpx;
	height: 100rpx;
	margin-bottom: 10rpx;
}

.share-option text {
	font-size: 24rpx;
	color: #666;
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