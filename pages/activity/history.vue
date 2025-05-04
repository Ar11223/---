<template>
	<view class="container">
		<view class="history-list">
			<view class="history-item" v-for="(item, index) in historyList" :key="index" @tap="goToDetail(item)">
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
		<view class="empty-state" v-if="historyList.length === 0">
			<text class="empty-text">暂无历史记录</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				historyList: []
			}
		},
		onLoad() {
			this.loadHistory()
		},
		methods: {
			loadHistory() {
				// TODO: 从云数据库加载历史记录
				// 模拟数据
				this.historyList = [
					{
						id: 1,
						name: '2024年春季考试抽签',
						time: '2024-04-28 14:00',
						status: 'ended',
						statusText: '已结束'
					}
				]
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/pages/activity/detail?id=${item.id}`
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
	
	.history-list {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		
		.history-item {
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
		text-align: center;
		padding: 40rpx;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style> 