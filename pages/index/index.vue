<template>
	<view class="container">
		<!-- 顶部状态栏 -->
		<view class="status-bar">
			<view class="user-info" @tap="handleUserInfo">
				<image class="avatar" :src="userInfo.avatarUrl || '/static/images/default-avatar.png'" mode="aspectFill"></image>
				<text class="nickname">{{userInfo.nickName || '未登录'}}</text>
			</view>
		</view>

		<!-- 快速操作区 -->
		<view class="quick-actions">
			<view class="action-card" @tap="createActivity">
				<text class="iconfont icon-add">+</text>
				<text>创建活动</text>
			</view>
			<view class="action-card" @tap="joinActivity">
				<text class="iconfont icon-search">🔍</text>
				<text>参与抽签</text>
			</view>
			<view class="action-card" @tap="viewHistory">
				<text class="iconfont icon-list">📋</text>
				<text>历史记录</text>
			</view>
		</view>

		<!-- 活动列表 -->
		<view class="activity-list">
			<view class="section-title">
				<text>进行中的活动</text>
				<text class="more" @tap="viewMore">查看更多</text>
			</view>
			<view class="activity-card" v-for="(item, index) in activeActivities" :key="index" @tap="goToDetail(item)">
				<view class="activity-info">
					<text class="activity-name">{{item.name}}</text>
					<text class="activity-time">{{item.time}}</text>
				</view>
				<view class="activity-status">
					<text :class="['status-tag', item.status]">{{item.statusText}}</text>
				</view>
			</view>
		</view>

		<!-- 空状态提示 -->
		<view class="empty-state" v-if="activeActivities.length === 0">
			<image src="/static/images/empty.png" mode="aspectFit"></image>
			<text>暂无进行中的活动</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {},
				activeActivities: [],
				loading: false
			}
		},
		onLoad() {
			this.checkLogin()
			this.loadActivities()
		},
		methods: {
			checkLogin() {
				// 检查登录状态
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					this.userInfo = userInfo
				}
			},
			async loadActivities() {
				this.loading = true
				try {
					// TODO: 从云数据库加载活动数据
					// 模拟数据
					this.activeActivities = [
						{
							id: 1,
							name: '2024年春季考试抽签',
							time: '2024-04-28 14:00',
							status: 'ongoing',
							statusText: '进行中'
						}
					]
				} catch (error) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			handleUserInfo() {
				// 处理用户信息点击
				if (!this.userInfo.nickName) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			},
			createActivity() {
				uni.navigateTo({
					url: '/pages/activity/create'
				})
			},
			joinActivity() {
				uni.navigateTo({
					url: '/pages/activity/join'
				})
			},
			viewHistory() {
				uni.navigateTo({
					url: '/pages/activity/history'
				})
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/activity/detail?id=${item.id}`
				})
			},
			viewMore() {
				uni.navigateTo({
					url: '/pages/activity/list'
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 20rpx;
	}

	.status-bar {
		background-color: #ffffff;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		
		.user-info {
			display: flex;
			align-items: center;
			
			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}
			
			.nickname {
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.quick-actions {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
		
		.action-card {
			background-color: #ffffff;
			width: 30%;
			height: 160rpx;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			
			.iconfont {
				font-size: 40rpx;
				color: #007AFF;
				margin-bottom: 10rpx;
			}
			
			text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	.activity-list {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		
		.section-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
			
			.more {
				font-size: 24rpx;
				color: #007AFF;
			}
		}
		
		.activity-card {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			border-bottom: 1rpx solid #eee;
			
			.activity-info {
				.activity-name {
					font-size: 28rpx;
					color: #333;
					margin-bottom: 10rpx;
					display: block;
				}
				
				.activity-time {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.activity-status {
				.status-tag {
					padding: 6rpx 20rpx;
					border-radius: 20rpx;
					font-size: 24rpx;
					
					&.ongoing {
						background-color: #e6f3ff;
						color: #007AFF;
					}
					
					&.ended {
						background-color: #f5f5f5;
						color: #999;
					}
				}
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		
		image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 20rpx;
		}
		
		text {
			font-size: 28rpx;
			color: #999;
		}
	}
</style>
