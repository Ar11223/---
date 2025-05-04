'use strict';
const db = uniCloud.database()
const activitiesCollection = db.collection('activities')
const recordsCollection = db.collection('records')

exports.main = async (event, context) => {
	try {
		// 获取所有进行中的活动
		const activities = await activitiesCollection
			.where({
				status: 'ongoing'
			})
			.get()

		const now = Date.now()
		const expiredActivities = []

		// 检查活动是否过期（活动时间超过24小时）
		for (const activity of activities.data) {
			const activityTime = new Date(activity.time).getTime()
			if (now - activityTime > 24 * 60 * 60 * 1000) {
				expiredActivities.push(activity._id)
			}
		}

		if (expiredActivities.length > 0) {
			// 更新过期活动状态
			await activitiesCollection.where({
				_id: db.command.in(expiredActivities)
			}).update({
				status: 'ended',
				updateTime: now
			})

			// 删除过期活动的记录（可选，取决于是否需要保留历史数据）
			// await recordsCollection.where({
			//     activityId: db.command.in(expiredActivities)
			// }).remove()
		}

		return {
			code: 200,
			message: '清理成功',
			data: {
				cleanedCount: expiredActivities.length
			}
		}
	} catch (e) {
		return {
			code: 500,
			message: '清理失败',
			error: e
		}
	}
} 