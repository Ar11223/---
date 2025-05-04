'use strict';
const db = uniCloud.database()
const activitiesCollection = db.collection('activities')

exports.main = async (event, context) => {
	const { OPENID } = context
	if (!OPENID) {
		return {
			code: 401,
			message: '请先登录'
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
		allowList,
		optionsFile,
		allowListFile
	} = event
	
	// 参数校验
	if (!name || !time || !location || !maxParticipants || !options || !startTime || !endTime) {
		return {
			code: 400,
			message: '请填写完整信息'
		}
	}
	
	// 处理文件内容
	let finalOptions = options
	let finalAllowList = allowList
	
	if (optionsFile) {
		try {
			const optionsContent = await uniCloud.downloadFile({
				fileID: optionsFile
			})
			finalOptions = optionsContent.fileContent
				.toString()
				.split('\n')
				.map(option => option.trim())
				.filter(option => option.length > 0)
		} catch (e) {
			return {
				code: 500,
				message: '处理选项文件失败'
			}
		}
	}
	
	if (allowListFile) {
		try {
			const allowListContent = await uniCloud.downloadFile({
				fileID: allowListFile
			})
			finalAllowList = allowListContent.fileContent
				.toString()
				.split('\n')
				.map(name => name.trim())
				.filter(name => name.length > 0)
		} catch (e) {
			return {
				code: 500,
				message: '处理白名单文件失败'
			}
		}
	}
	
	// 时间校验
	const now = Date.now()
	const activityTime = new Date(time).getTime()
	const lotteryStartTime = new Date(`${time} ${startTime}`).getTime()
	const lotteryEndTime = new Date(`${time} ${endTime}`).getTime()
	
	if (lotteryEndTime <= lotteryStartTime) {
		return {
			code: 400,
			message: '抽签结束时间必须晚于开始时间'
		}
	}
	
	if (activityTime <= lotteryEndTime) {
		return {
			code: 400,
			message: '活动时间必须晚于抽签结束时间'
		}
	}
	
	try {
		const result = await activitiesCollection.add({
			name,
			time,
			location,
			description,
			maxParticipants: parseInt(maxParticipants),
			options: finalOptions,
			startTime: `${time} ${startTime}`,
			endTime: `${time} ${endTime}`,
			requiredFields: requiredFields || [],
			useCode: useCode || false,
			code: code || '',
			allowList: finalAllowList || [],
			creator: OPENID,
			participants: [],
			status: 'ongoing',
			createTime: now,
			updateTime: now
		})
		
		return {
			code: 200,
			message: '创建成功',
			data: result
		}
	} catch (e) {
		return {
			code: 500,
			message: '创建失败'
		}
	}
} 