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

	const { activityId } = event
	
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

		// 检查权限（只有创建者可以查看记录）
		if (activityData.creator !== OPENID) {
			return {
				code: 403,
				message: '无权限查看记录'
			}
		}

		// 查询参与记录
		const records = await recordsCollection
			.where({
				activityId: activityId
			})
			.orderBy('createTime', 'asc')
			.get()

		// 统计座位号分布
		const seatDistribution = {}
		records.data.forEach(record => {
			const [row] = record.seatNumber.split('-')
			seatDistribution[row] = (seatDistribution[row] || 0) + 1
		})

		return {
			code: 200,
			message: '获取成功',
			data: {
				records: records.data,
				seatDistribution,
				total: records.data.length
			}
		}
	} catch (e) {
		return {
			code: 500,
			message: '获取失败',
			error: e
		}
	}
} 