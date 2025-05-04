Page({
	data: {
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
		showShare: false,
		canJoin: false,
		joinButtonText: '参与抽签'
	},

	onLoad(options) {
		if (options.id) {
			this.loadActivityDetail(options.id)
		}
	},

	async loadActivityDetail(id) {
		try {
			const result = await wx.cloud.callFunction({
				name: 'getActivityDetail',
				data: { activityId: id }
			})
			
			if (result.result.code === 200) {
				this.setData({
					activity: result.result.data
				})
				// 检查是否是创建者
				const userInfo = wx.getStorageSync('userInfo')
				this.setData({
					isCreator: userInfo && userInfo._id === this.data.activity.creator
				})
				// 更新按钮状态
				this.updateButtonState()
			} else {
				wx.showToast({
					title: result.result.message,
					icon: 'none'
				})
			}
		} catch (e) {
			wx.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
	},

	updateButtonState() {
		const activity = this.data.activity
		let canJoin = true
		let joinButtonText = '参与抽签'

		if (activity.status !== 'ongoing') {
			canJoin = false
			joinButtonText = '活动已结束'
		} else if (activity.participants.length >= activity.maxParticipants) {
			canJoin = false
			joinButtonText = '人数已满'
		} else {
			const now = Date.now()
			const startTime = new Date(activity.startTime).getTime()
			const endTime = new Date(activity.endTime).getTime()
			
			if (now < startTime) {
				canJoin = false
				joinButtonText = '抽签未开始'
			} else if (now > endTime) {
				canJoin = false
				joinButtonText = '抽签已结束'
			}
		}

		this.setData({
			canJoin,
			joinButtonText
		})
	},

	goToJoin() {
		if (!this.data.canJoin) return
		
		wx.navigateTo({
			url: `/pages/activity/join?id=${this.data.activity._id}`
		})
	},

	showShareOptions() {
		this.setData({
			showShare: true
		})
	},

	hideShare() {
		this.setData({
			showShare: false
		})
	},

	async shareByQRCode() {
		try {
			// 生成分享链接
			const shareUrl = `https://your-domain.com/pages/activity/join?id=${this.data.activity._id}`
			
			// 调用云函数生成二维码
			const result = await wx.cloud.callFunction({
				name: 'generateQRCode',
				data: {
					url: shareUrl
				}
			})
			
			if (result.result.code === 200) {
				// 保存二维码到相册
				wx.saveImageToPhotosAlbum({
					filePath: result.result.data.qrcode,
					success: () => {
						wx.showToast({
							title: '二维码已保存到相册',
							icon: 'success'
						})
						this.hideShare()
					}
				})
			}
		} catch (e) {
			wx.showToast({
				title: '生成二维码失败',
				icon: 'none'
			})
		}
	},

	shareByLink() {
		// 复制链接到剪贴板
		const shareUrl = `https://your-domain.com/pages/activity/join?id=${this.data.activity._id}`
		wx.setClipboardData({
			data: shareUrl,
			success: () => {
				wx.showToast({
					title: '链接已复制',
					icon: 'success'
				})
				this.hideShare()
			}
		})
	}
}) 