'use strict';
const db = uniCloud.database()
const activitiesCollection = db.collection('activities')

exports.main = async (event, context) => {
	const { OPENID } = context.WXCONTEXT
	if (!OPENID) {
		return {
			code: 403,
			message: '未登录'
		}
	}

	const { 
		name, 
		time, 
		location, 
		description, 
		maxParticipants,
		options,
		startTime,
		endTime,
		requiredFields,
		useCode,
		code,
		allowList
	} = event
	
	// 参数验证
	if (!name || !time || !location || !maxParticipants || !options || !startTime || !endTime) {
		return {
			code: 400,
			message: '缺少必要参数'
		}
	}

	// 验证时间
	const now = Date.now()
	const startTimeStamp = new Date(startTime).getTime()
	const endTimeStamp = new Date(endTime).getTime()
	const activityTimeStamp = new Date(time).getTime()

	if (startTimeStamp >= endTimeStamp) {
		return {
			code: 400,
			message: '抽签结束时间必须晚于开始时间'
		}
	}

	if (activityTimeStamp <= endTimeStamp) {
		return {
			code: 400,
			message: '活动时间必须晚于抽签结束时间'
		}
	}

	try {
		// 创建活动
		const result = await activitiesCollection.add({
			name,
			time,
			location,
			description: description || '',
			maxParticipants,
			options,
			startTime,
			endTime,
			requiredFields: requiredFields || [],
			useCode: useCode || false,
			code: useCode ? code : '',
			allowList: allowList || [],
			creator: OPENID,
			status: 'ongoing',
			participants: [],
			createTime: Date.now(),
			updateTime: Date.now()
		})

		return {
			code: 200,
			message: '创建成功',
			data: result
		}
	} catch (e) {
		return {
			code: 500,
			message: '创建失败',
			error: e
		}
	}
} 