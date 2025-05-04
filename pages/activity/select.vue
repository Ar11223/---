<template>
	<view class="container">
		<view class="search-box">
			<input 
				class="search-input" 
				v-model="searchKey" 
				placeholder="搜索活动名称" 
				@input="onSearch"
			/>
		</view>
		
		<view class="activity-list">
			<view 
				class="activity-card" 
				v-for="(item, index) in filteredList" 
				:key="index"
				@tap="goToJoin(item)"
			>
				<view class="activity-info">
					<text class="activity-name">{{item.name}}</text>
					<text class="activity-time">{{item.time}}</text>
					<text class="activity-location">{{item.location}}</text>
				</view>
				<view class="activity-status">
					<text :class="['status-tag', item.status]">{{item.statusText}}</text>
					<text class="participants-count">{{item.participants.length}}/{{item.maxParticipants}}</text>
				</view>
			</view>
		</view>
		
		<!-- 空状态提示 -->
		<view class="empty-state" v-if="filteredList.length === 0">
			<image src="/static/images/empty.png" mode="aspectFit"></image>
			<text>暂无活动</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchKey: '',
			activityList: []
		}
	},
	computed: {
		filteredList() {
			if (!this.searchKey) return this.activityList
			const key = this.searchKey.toLowerCase()
			return this.activityList.filter(item => 
				item.name.toLowerCase().includes(key) ||
				item.location.toLowerCase().includes(key)
			)
		}
	},
	onLoad() {
		this.loadActivityList()
	},
	methods: {
		async loadActivityList() {
			try {
				const result = await uniCloud.callFunction({
					name: 'getActivityList',
					data: {
						status: 'ongoing'
					}
				})
				
				if (result.result.code === 200) {
					this.activityList = result.result.data.map(item => ({
						...item,
						statusText: item.status === 'ongoing' ? '进行中' : '已结束'
					}))
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
		onSearch() {
			// 搜索功能已通过计算属性实现
		},
		goToJoin(activity) {
			uni.navigateTo({
				url: `/pages/activity/join?id=${activity._id}`
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

.search-box {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.search-input {
	width: 100%;
	height: 80rpx;
	background-color: #f5f5f5;
	border-radius: 40rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
}

.activity-list {
	margin-bottom: 30rpx;
}

.activity-card {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.activity-info {
	margin-bottom: 20rpx;
}

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

.activity-status {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.status-tag {
	padding: 6rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.status-tag.ongoing {
	background-color: #e6f3ff;
	color: #007AFF;
}

.status-tag.ended {
	background-color: #f5f5f5;
	color: #999;
}

.participants-count {
	font-size: 24rpx;
	color: #666;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-state image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.empty-state text {
	font-size: 28rpx;
	color: #999;
}
</style> 