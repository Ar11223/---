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
		// 查询活动详情
		const activity = await activitiesCollection.doc(activityId).get()
		if (!activity.data || activity.data.length === 0) {
			return {
				code: 404,
				message: '活动不存在'
			}
		}

		const activityData = activity.data[0]

		// 查询参与记录
		const records = await recordsCollection.where({
			activityId: activityId
		}).get()

		// 检查当前用户是否已参与
		const userRecord = records.data.find(record => record.userId === OPENID)

		return {
			code: 200,
			message: '获取成功',
			data: {
				...activityData,
				isParticipated: !!userRecord,
				seatNumber: userRecord ? userRecord.seatNumber : null,
				participantCount: records.data.length
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