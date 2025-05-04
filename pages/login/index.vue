<template>
	<view class="login-container">
		<view class="header">
			<image class="logo" src="/static/logo.png" mode="aspectFit" @error="handleImageError"></image>
			<text class="title">考场抽签</text>
		</view>
		
		<view class="content">
			<view v-if="!hasUserInfo" class="login-box">
				<button class="login-btn" type="primary" @tap="getUserProfile">微信登录</button>
			</view>
			<view v-else class="user-info">
				<view class="avatar-placeholder">
					<text class="avatar-text">{{userInfo.nickName ? userInfo.nickName[0] : '用'}}</text>
				</view>
				<text class="nickname">{{userInfo.nickName}}</text>
			</view>
		</view>
		
		<view class="footer">
			<text class="tips">登录后即可参与抽签活动</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				hasUserInfo: false,
				userInfo: null
			}
		},
		onLoad() {
			// 检查是否已登录
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo) {
				this.hasUserInfo = true;
				this.userInfo = userInfo;
			}
		},
		methods: {
			handleImageError(e) {
				// 图片加载失败时使用默认头像
				if (e.target.dataset.type === 'avatar') {
					this.userInfo.avatarUrl = '/static/default-avatar.png';
				}
			},
			async getUserProfile() {
				try {
					// 获取用户信息
					const [error, res] = await uni.getUserProfile({
						desc: '用于完善用户资料'
					});
					
					if (error) {
						throw new Error('获取用户信息失败');
					}
					
					// 调用登录云函数
					const [loginError, loginRes] = await uniCloud.callFunction({
						name: 'login',
						data: {
							userInfo: res.userInfo
						}
					});
					
					if (loginError || loginRes.result.code !== 0) {
						throw new Error(loginRes?.result?.msg || '登录失败');
					}
					
					// 保存用户信息
					this.hasUserInfo = true;
					this.userInfo = res.userInfo;
					uni.setStorageSync('userInfo', res.userInfo);
					
					// 返回上一页
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
					
				} catch (e) {
					uni.showToast({
						title: e.message || '登录失败',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style>
	.login-container {
		min-height: 100vh;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #f8f8f8;
	}
	
	.header {
		margin-top: 100rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.logo {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.content {
		flex: 1;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 60rpx 0;
	}
	
	.login-box {
		width: 100%;
		padding: 0 40rpx;
	}
	
	.login-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		background: #07c160;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.avatar-placeholder {
		width: 160rpx;
		height: 160rpx;
		border-radius: 80rpx;
		background-color: #007AFF;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}
	
	.avatar-text {
		color: #ffffff;
		font-size: 48rpx;
		font-weight: bold;
	}
	
	.nickname {
		font-size: 32rpx;
		color: #333;
	}
	
	.footer {
		width: 100%;
		text-align: center;
		padding: 40rpx 0;
	}
	
	.tips {
		font-size: 28rpx;
		color: #999;
	}
</style> 