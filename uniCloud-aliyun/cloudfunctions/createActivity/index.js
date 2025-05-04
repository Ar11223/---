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
		title, 
		location, 
		description, 
		maxParticipants,
		options,
		lotteryStartDate,
		lotteryStartTime,
		lotteryEndDate,
		lotteryEndTime,
		requiredFields,
		useCode,
		code,
		allowList
	} = event
	
	// 参数验证
	if (!title || !location || !maxParticipants || !options || 
		!lotteryStartDate || !lotteryStartTime || !lotteryEndDate || !lotteryEndTime) {
		return {
			code: 400,
			message: '缺少必要参数'
		}
	}

	// 验证时间
	const now = Date.now()
	
	// 安全地解析日期时间
	let lotteryStartTimeStamp, lotteryEndTimeStamp;
	
	try {
		lotteryStartTimeStamp = new Date(`${lotteryStartDate} ${lotteryStartTime}`).getTime();
		lotteryEndTimeStamp = new Date(`${lotteryEndDate} ${lotteryEndTime}`).getTime();
		
		// 检查时间戳是否有效
		if (isNaN(lotteryStartTimeStamp) || isNaN(lotteryEndTimeStamp)) {
			return {
				code: 400,
				message: '日期时间格式无效'
			}
		}
	} catch (e) {
		return {
			code: 400,
			message: '日期时间格式错误: ' + e.message
		}
	}

	if (lotteryStartTimeStamp >= lotteryEndTimeStamp) {
		return {
			code: 400,
			message: '抽签结束时间必须晚于开始时间'
		}
	}

	try {
		// 创建活动
		const result = await activitiesCollection.add({
			title,
			description: description || '',
			location,
			creatorId: OPENID,
			maxParticipants: parseInt(maxParticipants) || 0,
			options: options.filter(opt => opt && opt.trim()),
			lotteryStartTime: lotteryStartTimeStamp,
			lotteryEndTime: lotteryEndTimeStamp,
			requiredFields: requiredFields || [],
			useCode: useCode || false,
			code: useCode ? code : '',
			allowList: allowList || [],
			status: 0,
			createTime: Date.now(),
			updateTime: Date.now()
		})

		return {
			code: 200,
			message: '创建成功',
			data: result
		}
	} catch (e) {
		console.error('创建活动失败:', e);
		return {
			code: 500,
			message: '创建失败: ' + (e.message || '未知错误'),
			error: e
		}
	}
} 