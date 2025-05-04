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

	const { status = 'all', page = 1, pageSize = 10 } = event
	
	try {
		// 构建查询条件
		const query = {}
		if (status !== 'all') {
			query.status = status
		}

		// 查询活动列表
		const activities = await activitiesCollection
			.where(query)
			.orderBy('createTime', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()

		// 获取总数
		const total = await activitiesCollection.where(query).count()

		// 查询每个活动的参与记录
		const activityIds = activities.data.map(item => item._id)
		const records = await recordsCollection.where({
			activityId: db.command.in(activityIds)
		}).get()

		// 统计每个活动的参与人数
		const participantCounts = {}
		records.data.forEach(record => {
			participantCounts[record.activityId] = (participantCounts[record.activityId] || 0) + 1
		})

		// 检查用户是否参与过每个活动
		const userRecords = records.data.filter(record => record.userId === OPENID)
		const userParticipatedActivities = new Set(userRecords.map(record => record.activityId))

		// 组装返回数据
		const list = activities.data.map(activity => ({
			...activity,
			participantCount: participantCounts[activity._id] || 0,
			isParticipated: userParticipatedActivities.has(activity._id)
		}))

		return {
			code: 200,
			message: '获取成功',
			data: {
				list,
				total: total.total,
				page,
				pageSize
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