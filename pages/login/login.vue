<template>
	<view class="container">
		<view class="login-box">
			<image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
			<text class="title">考场抽签</text>
			<text class="subtitle">请登录后继续使用</text>
			
			<button 
				class="login-btn" 
				open-type="getUserProfile"
				@tap="handleLogin"
			>
				微信登录
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		methods: {
			async handleLogin() {
				try {
					// 获取用户信息
					const userProfile = await uni.getUserProfile({
						desc: '用于完善用户资料'
					})
					
					// 获取登录凭证
					const loginResult = await uni.login()
					
					if (loginResult.code) {
						// 调用云函数进行登录
						const result = await uniCloud.callFunction({
							name: 'login',
							data: {
								code: loginResult.code,
								userInfo: userProfile.userInfo
							}
						})
						
						if (result.result.code === 200) {
							// 保存用户信息
							uni.setStorageSync('userInfo', result.result.data)
							
							// 跳转到首页
							uni.reLaunch({
								url: '/pages/index/index'
							})
						} else {
							uni.showToast({
								title: result.result.message,
								icon: 'none'
							})
						}
					}
				} catch (e) {
					uni.showToast({
						title: '登录失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.login-box {
		width: 600rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.logo {
			width: 160rpx;
			height: 160rpx;
			margin-bottom: 30rpx;
		}
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.subtitle {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 60rpx;
		}
		
		.login-btn {
			width: 100%;
			height: 88rpx;
			background-color: #007AFF;
			color: #ffffff;
			font-size: 32rpx;
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style> 