'use strict';
const db = uniCloud.database()
const activitiesCollection = db.collection('activities')
const recordsCollection = db.collection('records')

exports.main = async (event, context) => {
	const { OPENID } = context.WXCONTEXT
	if (!OPENID) {
		return {
			code: 403,
			message: '未登录'
		}
	}

	const { activityId, code, userInfo } = event
	
	// 参数验证
	if (!activityId) {
		return {
			code: 400,
			message: '缺少活动ID'
		}
	}

	try {
		// 查询活动
		const activity = await activitiesCollection.doc(activityId).get()
		if (!activity.data || activity.data.length === 0) {
			return {
				code: 404,
				message: '活动不存在'
			}
		}

		const activityData = activity.data[0]

		// 验证活动状态
		if (activityData.status !== 'ongoing') {
			return {
				code: 400,
				message: '活动已结束'
			}
		}

		// 验证时间
		const now = Date.now()
		const startTime = new Date(activityData.startTime).getTime()
		const endTime = new Date(activityData.endTime).getTime()

		if (now < startTime) {
			return {
				code: 400,
				message: '抽签尚未开始'
			}
		}

		if (now > endTime) {
			return {
				code: 400,
				message: '抽签已结束'
			}
		}

		// 验证人数限制
		if (activityData.participants.length >= activityData.maxParticipants) {
			return {
				code: 400,
				message: '活动人数已满'
			}
		}

		// 验证口令
		if (activityData.useCode && activityData.code !== code) {
			return {
				code: 400,
				message: '活动口令错误'
			}
		}

		// 检查是否已参与
		if (activityData.participants.includes(OPENID)) {
			return {
				code: 400,
				message: '已参与过该活动'
			}
		}

		// 验证必填信息
		if (activityData.requiredFields && activityData.requiredFields.length > 0) {
			if (!userInfo) {
				return {
					code: 400,
					message: '请填写必要信息'
				}
			}

			// 验证每个必填字段
			for (const field of activityData.requiredFields) {
				if (field.required && !userInfo[field.name]) {
					return {
						code: 400,
						message: `请填写${field.name}`
					}
				}
			}
		}

		// 验证是否在允许名单中
		if (activityData.allowList && activityData.allowList.length > 0) {
			const userName = userInfo?.name
			if (!userName || !activityData.allowList.includes(userName)) {
				return {
					code: 403,
					message: '您不在允许参与名单中'
				}
			}
		}

		// 生成随机座位号
		const seatNumber = generateSeatNumber()

		// 创建参与记录
		const recordResult = await recordsCollection.add({
			activityId,
			userId: OPENID,
			userInfo: userInfo || {},
			seatNumber,
			createTime: Date.now()
		})

		// 更新活动参与者
		await activitiesCollection.doc(activityId).update({
			participants: db.command.push(OPENID),
			updateTime: Date.now()
		})

		return {
			code: 200,
			message: '参与成功',
			data: {
				seatNumber
			}
		}
	} catch (e) {
		return {
			code: 500,
			message: '参与失败',
			error: e
		}
	}
}

// 生成随机座位号
function generateSeatNumber() {
	const row = String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
	const col = Math.floor(Math.random() * 20) + 1 // 1-20
	return `${row}-${col}`
} 