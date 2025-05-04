<template>
	<view class="container">
		<view class="filter-bar">
			<view class="filter-item" :class="{ active: currentFilter === 'all' }" @tap="changeFilter('all')">全部</view>
			<view class="filter-item" :class="{ active: currentFilter === 'ongoing' }" @tap="changeFilter('ongoing')">进行中</view>
			<view class="filter-item" :class="{ active: currentFilter === 'ended' }" @tap="changeFilter('ended')">已结束</view>
		</view>
		
		<view class="activity-list">
			<view class="activity-card" v-for="(item, index) in filteredList" :key="index" @tap="goToDetail(item)">
				<view class="activity-info">
					<text class="activity-name">{{item.name}}</text>
					<text class="activity-time">{{item.time}}</text>
					<text class="activity-location">{{item.location}}</text>
				</view>
				<view class="activity-status">
					<text :class="['status-tag', item.status]">{{item.statusText}}</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态提示 -->
		<view class="empty-state" v-if="filteredList.length === 0">
			<image src="/static/images/empty.png" mode="aspectFit"></image>
			<text>暂无活动</text>
		</view>
		
		<view class="create-btn" @tap="goToCreate">
			<text class="create-icon">+</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentFilter: 'all',
				activityList: [
					{
						id: 1,
						name: '2024年春季考试抽签',
						time: '2024-04-28 14:00',
						location: '第一教学楼101室',
						status: 'ongoing',
						statusText: '进行中'
					},
					{
						id: 2,
						name: '2024年春季考试抽签',
						time: '2024-04-27 14:00',
						location: '第一教学楼102室',
						status: 'ended',
						statusText: '已结束'
					}
				]
			}
		},
		computed: {
			filteredList() {
				if (this.currentFilter === 'all') {
					return this.activityList
				}
				return this.activityList.filter(item => item.status === this.currentFilter)
			}
		},
		methods: {
			changeFilter(filter) {
				this.currentFilter = filter
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/activity/detail?id=${item.id}`
				})
			},
			goToCreate() {
				uni.navigateTo({
					url: '/pages/activity/create'
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}
	
	.filter-bar {
		display: flex;
		background-color: #ffffff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		
		.filter-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			padding: 10rpx 0;
			position: relative;
			
			&.active {
				color: #007AFF;
				
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #007AFF;
					border-radius: 2rpx;
				}
			}
		}
	}
	
	.activity-list {
		padding: 20rpx;
		
		.activity-card {
			background-color: #ffffff;
			border-radius: 12rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			
			.activity-info {
				margin-bottom: 20rpx;
				
				.activity-name {
					font-size: 32rpx;
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
	
	.create-btn {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
	}
	
	.create-icon {
		color: #ffffff;
		font-size: 48rpx;
		font-weight: bold;
	}
</style> 