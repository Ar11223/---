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
		// 获取活动信息
		const activity = await activitiesCollection.doc(activityId).get()
		if (!activity.data || activity.data.length === 0) {
			return {
				code: 404,
				message: '活动不存在'
			}
		}

		const activityData = activity.data[0]

		// 检查活动状态
		if (activityData.status !== 'ongoing') {
			return {
				code: 400,
				message: '活动已结束'
			}
		}

		// 检查抽奖时间
		const now = Date.now()
		const startTime = new Date(activityData.startTime).getTime()
		const endTime = new Date(activityData.endTime).getTime()
		
		if (now < startTime) {
			return {
				code: 400,
				message: '抽奖尚未开始'
			}
		}
		
		if (now > endTime) {
			return {
				code: 400,
				message: '抽奖已结束'
			}
		}

		// 检查人数限制
		if (activityData.participants.length >= activityData.maxParticipants) {
			return {
				code: 400,
				message: '活动人数已满'
			}
		}

		// 检查是否需要验证码
		if (activityData.useCode && (!code || code !== activityData.code)) {
			return {
				code: 400,
				message: '验证码错误'
			}
		}

		// 检查是否已参与
		const existingRecord = await recordsCollection.where({
			activityId,
			userId: OPENID
		}).get()

		if (existingRecord.data && existingRecord.data.length > 0) {
			return {
				code: 400,
				message: '您已参与过此活动'
			}
		}

		// 检查必填信息
		if (activityData.requiredFields && activityData.requiredFields.length > 0) {
			for (const field of activityData.requiredFields) {
				if (field.required && (!userInfo || !userInfo[field.name])) {
					return {
						code: 400,
						message: `请填写${field.label}`
					}
				}
			}
		}

		// 检查白名单
		if (activityData.allowList && activityData.allowList.length > 0) {
			const userName = userInfo?.name || ''
			if (!activityData.allowList.includes(userName)) {
				return {
					code: 403,
					message: '您不在允许参与名单中'
				}
			}
		}

		// 生成座位号
		const seatNumber = Math.floor(Math.random() * activityData.maxParticipants) + 1
		while (activityData.participants.includes(seatNumber)) {
			seatNumber = Math.floor(Math.random() * activityData.maxParticipants) + 1
		}

		// 创建参与记录
		await recordsCollection.add({
			activityId,
			userId: OPENID,
			seatNumber,
			userInfo,
			createTime: Date.now()
		})

		// 更新活动参与人数
		await activitiesCollection.doc(activityId).update({
			participants: db.command.push(seatNumber),
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