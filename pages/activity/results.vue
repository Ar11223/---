<template>
	<view class="results-container">
		<view class="header">
			<text class="title">{{activity.title}}</text>
			<text class="subtitle">抽签结果</text>
		</view>
		
		<view class="content">
			<view class="stats">
				<view class="stat-item">
					<text class="stat-value">{{records.length}}</text>
					<text class="stat-label">已抽签人数</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{activity.maxParticipants || '不限'}}</text>
					<text class="stat-label">最大人数</text>
				</view>
			</view>
			
			<view class="records-list">
				<view class="record-item" v-for="(item, index) in records" :key="index">
					<view class="avatar-placeholder">
						<text class="avatar-text">{{item.userInfo && item.userInfo[0] ? item.userInfo[0].nickName[0] : '👤'}}</text>
					</view>
					<view class="record-info">
						<text class="name">{{item.userInfo && item.userInfo[0] ? item.userInfo[0].nickName : '未知用户'}}</text>
						<text class="time">{{formatTime(item.createTime)}}</text>
					</view>
					<text class="seat-number">{{item.seatNumber}}号</text>
				</view>
			</view>
		</view>
		
		<view class="footer">
			<button class="download-btn" @tap="downloadResults">下载结果</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activityId: '',
				activity: {},
				records: []
			}
		},
		onLoad(options) {
			if (options.id) {
				this.activityId = options.id;
				this.loadResults();
			}
		},
		methods: {
			async loadResults() {
				try {
					const [error, res] = await uniCloud.callFunction({
						name: 'getLotteryResults',
						data: {
							activityId: this.activityId
						}
					});
					
					if (error || res.result.code !== 0) {
						throw new Error(res.result?.msg || '获取结果失败');
					}
					
					this.activity = res.result.data.activity;
					this.records = res.result.data.records;
					
				} catch (e) {
					uni.showToast({
						title: e.message || '加载失败',
						icon: 'none'
					});
				}
			},
			formatTime(timestamp) {
				const date = new Date(timestamp);
				return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
			},
			async downloadResults() {
				try {
					uni.showLoading({
						title: '准备下载...'
					});
					
					const [error, res] = await uniCloud.callFunction({
						name: 'getLotteryResults',
						data: {
							activityId: this.activityId
						}
					});
					
					if (error || res.result.code !== 0) {
						throw new Error(res.result?.msg || '获取数据失败');
					}
					
					const excelData = res.result.data.excelData;
					
					// 生成CSV内容
					const headers = ['座位号', '姓名', '抽签时间'];
					const rows = excelData.map(item => [
						item['座位号'],
						item['姓名'],
						item['抽签时间']
					]);
					
					const csvContent = [
						headers.join(','),
						...rows.map(row => row.join(','))
					].join('\n');
					
					// 保存文件
					const fileName = `${this.activity.title}_抽签结果.csv`;
					const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
					
					await uni.getFileSystemManager().writeFile({
						filePath,
						data: csvContent,
						encoding: 'utf8'
					});
					
					// 保存到本地
					await uni.saveFile({
						tempFilePath: filePath
					});
					
					uni.hideLoading();
					uni.showToast({
						title: '下载成功',
						icon: 'success'
					});
					
				} catch (e) {
					uni.hideLoading();
					uni.showToast({
						title: e.message || '下载失败',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
	.results-container {
		min-height: 100vh;
		padding: 40rpx;
		background-color: #f8f8f8;
	}
	
	.header {
		text-align: center;
		margin-bottom: 40rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #666;
	}
	
	.stats {
		display: flex;
		justify-content: space-around;
		background-color: #ffffff;
		padding: 30rpx;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
	}
	
	.stat-item {
		text-align: center;
	}
	
	.stat-value {
		font-size: 40rpx;
		font-weight: bold;
		color: #007AFF;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #666;
	}
	
	.records-list {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
	}
	
	.record-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.record-item:last-child {
		border-bottom: none;
	}
	
	.avatar-placeholder {
		width: 80rpx;
		height: 80rpx;
		border-radius: 40rpx;
		background-color: #007AFF;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}
	
	.avatar-text {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.record-info {
		flex: 1;
	}
	
	.name {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}
	
	.time {
		font-size: 24rpx;
		color: #999;
	}
	
	.seat-number {
		font-size: 32rpx;
		color: #007AFF;
		font-weight: bold;
	}
	
	.footer {
		margin-top: 40rpx;
		padding: 0 40rpx;
	}
	
	.download-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007AFF;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 44rpx;
	}
</style> 