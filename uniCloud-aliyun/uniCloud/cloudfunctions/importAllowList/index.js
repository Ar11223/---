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

	const { activityId, fileContent } = event
	
	// 参数验证
	if (!activityId || !fileContent) {
		return {
			code: 400,
			message: '缺少必要参数'
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

		// 检查权限
		if (activityData.creator !== OPENID) {
			return {
				code: 403,
				message: '无权限操作'
			}
		}

		// 解析文件内容（假设是CSV格式，每行一个名字）
		const allowList = fileContent.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0)

		// 更新活动允许名单
		await activitiesCollection.doc(activityId).update({
			allowList,
			updateTime: Date.now()
		})

		return {
			code: 200,
			message: '导入成功',
			data: {
				count: allowList.length
			}
		}
	} catch (e) {
		return {
			code: 500,
			message: '导入失败',
			error: e
		}
	}
} 