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
	
	const { activityId, fileContent, fileID } = event
	
	if (!activityId) {
		return {
			code: 400,
			message: '缺少活动ID'
		}
	}
	
	if (!fileContent && !fileID) {
		return {
			code: 400,
			message: '请提供文件内容或文件ID'
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
		
		// 检查权限
		if (activity.data[0].creator !== OPENID) {
			return {
				code: 403,
				message: '无权限修改此活动'
			}
		}
		
		let names = []
		
		// 处理文件内容
		if (fileID) {
			try {
				const fileContent = await uniCloud.downloadFile({
					fileID: fileID
				})
				names = fileContent.fileContent
					.toString()
					.split('\n')
					.map(name => name.trim())
					.filter(name => name.length > 0)
			} catch (e) {
				return {
					code: 500,
					message: '处理文件失败'
				}
			}
		} else {
			names = fileContent
				.split('\n')
				.map(name => name.trim())
				.filter(name => name.length > 0)
		}
		
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
			message: '导入失败'
		}
	}
} 