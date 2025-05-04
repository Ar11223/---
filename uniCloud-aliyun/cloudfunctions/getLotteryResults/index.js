'use strict';

const db = uniCloud.database();
const activitiesCollection = db.collection('activities');
const recordsCollection = db.collection('records');

exports.main = async (event, context) => {
	try {
		const { activityId } = event;
		
		if (!activityId) {
			return {
				code: -1,
				msg: '缺少活动ID'
			};
		}
		
		// 获取活动信息
		const activity = await activitiesCollection.doc(activityId).get();
		if (!activity.data || activity.data.length === 0) {
			return {
				code: -1,
				msg: '活动不存在'
			};
		}
		
		// 获取抽签记录
		const records = await recordsCollection
			.aggregate()
			.match({
				activityId: activityId
			})
			.lookup({
				from: 'users',
				localField: 'userId',
				foreignField: '_id',
				as: 'userInfo'
			})
			.project({
				_id: 1,
				seatNumber: 1,
				createTime: 1,
				'userInfo.nickName': 1,
				'userInfo.avatarUrl': 1
			})
			.sort({
				seatNumber: 1
			})
			.end();
		
		// 生成Excel数据
		const excelData = records.data.map(record => ({
			'座位号': record.seatNumber,
			'姓名': record.userInfo[0]?.nickName || '未知',
			'抽签时间': new Date(record.createTime).toLocaleString()
		}));
		
		return {
			code: 0,
			msg: '获取成功',
			data: {
				activity: activity.data[0],
				records: records.data,
				excelData: excelData
			}
		};
		
	} catch (e) {
		return {
			code: -1,
			msg: '获取抽签结果失败：' + e.message
		};
	}
}; 