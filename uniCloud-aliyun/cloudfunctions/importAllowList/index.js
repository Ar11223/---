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
		// 获取活动信息
		const activity = await activitiesCollection.doc(activityId).get()
		if (!activity.data || activity.data.length === 0) {
			return {
				code: 404,
				message: '活动不存在'
			}
		}

		// 验证权限
		if (activity.data[0].creator !== OPENID) {
			return {
				code: 403,
				message: '无权限操作'
			}
		}

		// 处理文件内容
		const names = fileContent.split('\n')
			.map(name => name.trim())
			.filter(name => name.length > 0)

		// 更新活动白名单
		await activitiesCollection.doc(activityId).update({
			allowList: names,
			updateTime: Date.now()
		})

		return {
			code: 200,
			message: '导入成功',
			data: {
				count: names.length
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